;(function(){
  const state = {
    token: null,
    // Conciliacion date (kept for totals)
    fecha: fmtDate(new Date()),
    // Pedidos-specific date filter (explicit only)
    fechaPedidos: '',
    filtros: {
      grupoCodigo: '',
      tipoEntrega: '',
      estadoPedido: '',
      estadoPago: '',
    },
    pedidos: [],
    conciliacion: null,
    loading: false,
  }

  // Utils
  const moneyFmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 })
  function money(v){ try { return moneyFmt.format(typeof v === 'string' ? Number(v) : v) } catch(e){ return `Q${v}` } }
  function qs(sel, root){ return (root||document).querySelector(sel) }
  function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)) }
  function el(html){ const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild }
  function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])) }
  function fmtDate(d){ const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` }

  // Friendly labels for enums (UI only)
  const LABELS = {
    tipoEntrega: {
      HUEHUE_DELIVERY: 'Entrega Huehuetenango',
      SANTIAGO_PICKUP: 'Retiro en Santiago',
    },
    estadoPedido: {
      CONFIRMADO: 'Confirmado',
      PREPARANDO: 'Preparando',
      LISTO: 'Listo',
      EN_RUTA: 'En ruta',
      ENTREGADO: 'Entregado',
      INCIDENCIA: 'Incidencia',
      CANCELADO: 'Cancelado',
    },
    estadoPago: {
      PENDIENTE: 'Pendiente',
      PAGADO: 'Pagado',
      CONTRAENTREGA: 'Contraentrega',
      PARCIAL: 'Parcial',
    },
  }
  function labelOf(kind, value){
    const v = String(value||'')
    return (LABELS[kind] && LABELS[kind][v]) ? LABELS[kind][v] : v
  }

  // Auth helpers
  function ensureToken(){
    state.token = window.Auth.getTokenForRole('admin')
    return state.token
  }

  async function fetchAuth(path, opts){
    try {
      const res = await window.API.fetchJson(path, { ...(opts||{}), token: state.token })
      return res
    } catch (err){
      if(err && (err.status === 401 || err.status === 403)){
        window.UI.toast('Sesion expirada o sin permisos', 'error')
        try { localStorage.removeItem('token_admin') } catch(e){}
        state.token = null
        render()
        throw err
      }
      throw err
    }
  }

  // Data loading
  async function loadData(){
    state.loading = true
    renderLoading()
    try {
      // Build pedidos params without forcing fecha unless explicitly set for pedidos
      const paramsPedidos = new URLSearchParams()
      Object.entries(state.filtros).forEach(([k,v]) => { if(v) paramsPedidos.append(k, v) })
      if(state.fechaPedidos) paramsPedidos.append('fecha', state.fechaPedidos)
      const pedidosUrl = `/api/admin/pedidos?${paramsPedidos.toString()}`
      const conciliacionUrl = `/api/admin/conciliacion?fecha=${encodeURIComponent(state.fecha)}`

      try { console.debug('[admin] loadData params', { fecha: state.fecha, fechaPedidos: state.fechaPedidos, pedidosUrl: `${window.API.baseUrl}${pedidosUrl}`, conciliacionUrl: `${window.API.baseUrl}${conciliacionUrl}` }) } catch(e){}

      const [pedidos, conc] = await Promise.all([
        fetchAuth(pedidosUrl),
        fetchAuth(conciliacionUrl),
      ])
      state.pedidos = Array.isArray(pedidos) ? pedidos : []
      try { console.debug('[admin] pedidos count', state.pedidos.length) } catch(e){}
      state.conciliacion = conc || null
    } catch (err){
      const msg = err && err.message ? err.message : 'Error cargando datos'
      try { console.warn('[admin] loadData error', err) } catch (e){}
      window.UI.toast(msg, 'error')
      state.pedidos = []
      state.conciliacion = null
    } finally {
      state.loading = false
      renderDashboard()
    }
  }

  // Actions
  function onFilterChange(){
    const root = qs('#admin-root')
    const fechaEl = qs('input[name="fecha"]', root)
    state.fecha = (fechaEl && fechaEl.value) || state.fecha
    // pedidos-specific date filter (optional)
    const fechaPedidosEl = qs('input[name="fechaPedidos"]', root)
    state.fechaPedidos = (fechaPedidosEl && fechaPedidosEl.value) ? fechaPedidosEl.value : ''
    ;['grupoCodigo','tipoEntrega','estadoPedido','estadoPago'].forEach(k => {
      const sel = qs(`select[name="${k}"]`, root)
      state.filtros[k] = sel ? (sel.value || '') : ''
    })
    try { console.debug('[admin] onFilterChange', { fecha: state.fecha, fechaPedidos: state.fechaPedidos, filtros: { ...state.filtros } }) } catch(e){}
    loadData()
  }

  async function changeEstado(pedido){
    const bodyHtml = `
      <form class="form" id="form-estado">
        <div class="form__row">
          <label>Nuevo estado
            <select name="estadoPedido" required>
              ${[
                'CONFIRMADO','PREPARANDO','LISTO','EN_RUTA','ENTREGADO','INCIDENCIA','CANCELADO'
              ].map(s => `<option value="${s}" ${s===escapeHtml(pedido.estadoPedido)?'selected':''}>${labelOf('estadoPedido', s)}</option>`).join('')}
            </select>
          </label>
        </div>
        <div class="form__row" id="inc-fields" style="display:none">
          <label>Tipo de incidencia
            <input type="text" name="incidenciaTipo" placeholder="EJ: CLIENTE_NO_ENCUENTRA" />
          </label>
          <label>Nota de incidencia
            <input type="text" name="incidenciaNota" placeholder="Detalles" />
          </label>
        </div>
        <div class="form__row -end">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Guardar</button>
        </div>
      </form>
    `
    const backdrop = window.UI.openModal({ title: `Cambiar estado #${pedido.pedidoId}`, body: bodyHtml })
    const form = qs('#form-estado', backdrop)
    const sel = qs('select[name="estadoPedido"]', form)
    const inc = qs('#inc-fields', form)
    const updateInc = () => { inc.style.display = sel.value === 'INCIDENCIA' ? 'grid' : 'none' }
    sel.addEventListener('change', updateInc); updateInc()
    qs('#btn-cancel', form).addEventListener('click', window.UI.closeModal)
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const fd = new FormData(form)
      const payload = { estadoPedido: fd.get('estadoPedido') }
      if(payload.estadoPedido === 'INCIDENCIA'){
        payload.incidenciaTipo = (fd.get('incidenciaTipo')||'').toString().trim()
        payload.incidenciaNota = (fd.get('incidenciaNota')||'').toString().trim()
      }
      try {
        await fetchAuth(`/api/admin/pedidos/${pedido.pedidoId}/estado`, { method: 'PATCH', body: payload })
        window.UI.toast('Estado actualizado', 'success')
        window.UI.closeModal()
        loadData()
      } catch (err){
        const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
        window.UI.toast(msg, 'error')
      }
    })
  }

  async function asignarRepartidor(pedido){
    const bodyHtml = `
      <form class="form" id="form-rep">
        <div class="form__row">
          <label>Repartidor (username)
            <input type="text" name="repartidorUsername" placeholder="usuario" required />
          </label>
        </div>
        <div class="form__row -end">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Asignar</button>
        </div>
      </form>
    `
    const backdrop = window.UI.openModal({ title: `Asignar repartidor #${pedido.pedidoId}`, body: bodyHtml })
    const form = qs('#form-rep', backdrop)
    qs('#btn-cancel', form).addEventListener('click', window.UI.closeModal)
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const fd = new FormData(form)
      const username = (fd.get('repartidorUsername')||'').toString().trim()
      if(!username){ window.UI.toast('Ingresa el usuario', 'error'); return }
      try {
        await fetchAuth(`/api/admin/pedidos/${pedido.pedidoId}/asignar-repartidor`, { method: 'PATCH', body: { repartidorUsername: username } })
        window.UI.toast('Repartidor asignado', 'success')
        window.UI.closeModal()
        loadData()
      } catch (err){
        const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
        window.UI.toast(msg, 'error')
      }
    })
  }

  // Rendering
  function render(){
    const root = qs('#admin-root')
    if(!root) return
    ensureHeader()
    if(!ensureToken()){
      renderLogin(root)
    } else {
      renderDashboard(root)
      loadData()
    }
  }

  function ensureHeader(){ /* header/footer rendered by app.js */ }

  function renderLogin(root){
    root.innerHTML = `
      <section class="section">
        <div class="section__header">
          <h2>Admin - Iniciar sesion</h2>
        </div>
        <div class="panel" style="max-width:520px;">
          <div class="panel__body">
            <form class="form" id="admin-login">
              <div class="form__row">
                <label>Usuario
                  <input type="text" name="username" autocomplete="username" required />
                </label>
              </div>
              <div class="form__row">
                <label>Contrasena
                  <input type="password" name="password" autocomplete="current-password" required />
                </label>
              </div>
              <div class="form__row -end">
                <button type="submit" class="btn btn--primary">Entrar</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    `
    const form = qs('#admin-login', root)
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const fd = new FormData(form)
      const username = (fd.get('username')||'').toString().trim()
      const password = (fd.get('password')||'').toString().trim()
      try {
        const res = await window.Auth.login('admin', username, password)
        state.token = res && res.accessToken ? res.accessToken : null
        window.UI.toast('Bienvenido', 'success')
        render()
      } catch (err){
        const msg = err && err.message ? err.message : 'Error de autenticacion'
        window.UI.toast(msg, 'error')
      }
    })
  }

  function renderLoading(){
    const list = qs('#pedidos-list')
    if(list){ list.innerHTML = '<div class="empty">Cargando...</div>' }
  }

  function renderDashboard(root){
    if(!root) root = qs('#admin-root')
    if(!root) return
    root.innerHTML = `
      <section class="section">
        <div class="section__header">
          <h2>Dashboard de Operacion</h2>
          <div class="form__row" style="min-width:220px;">
            <label>Fecha de conciliación
              <input type="date" name="fecha" value="${escapeHtml(state.fecha)}" />
            </label>
          </div>
        </div>
        <div class="grid grid--cards" id="summary-cards">
          ${renderSummaryCards()}
        </div>
      </section>

      <section class="section">
        <div class="section__header">
          <h2>Pedidos</h2>
          <div class="catalog-hint">Filtra por grupo, entrega, estado y pago</div>
        </div>
        <div class="panel">
          <div class="panel__body">
            <div class="grid" style="grid-template-columns: repeat(5, minmax(160px,1fr));">
              <label>Grupo
                <select name="grupoCodigo">
                  <option value="">Todos</option>
                  <option value="MORFOSIS">MORFOSIS</option>
                  <option value="ELITE360">ELITE360</option>
                </select>
              </label>
              <label>Entrega
                <select name="tipoEntrega">
                  <option value="">Todas</option>
                  <option value="HUEHUE_DELIVERY">${labelOf('tipoEntrega','HUEHUE_DELIVERY')}</option>
                  <option value="SANTIAGO_PICKUP">${labelOf('tipoEntrega','SANTIAGO_PICKUP')}</option>
                </select>
              </label>
              <label>Estado pedido
                <select name="estadoPedido">
                  <option value="">Todos</option>
                  ${['CONFIRMADO','PREPARANDO','LISTO','EN_RUTA','ENTREGADO','INCIDENCIA','CANCELADO'].map(s => `<option value="${s}">${labelOf('estadoPedido', s)}</option>`).join('')}
                </select>
              </label>
              <label>Estado pago
                <select name="estadoPago">
                  <option value="">Todos</option>
                  ${['PENDIENTE','PAGADO','CONTRAENTREGA','PARCIAL'].map(s => `<option value="${s}">${labelOf('estadoPago', s)}</option>`).join('')}
                </select>
              </label>
              <label>Fecha de pedido (opcional)
                <input type="date" name="fechaPedidos" value="${escapeHtml(state.fechaPedidos||'')}" />
                <div class="catalog-hint">Déjalo vacío para ver pedidos de todas las fechas</div>
              </label>
            </div>
          </div>
          <div class="panel__footer" style="display:flex; justify-content:flex-end;">
            <button class="btn btn--primary" id="btn-aplicar">Aplicar filtros</button>
          </div>
        </div>

        <div class="panel" style="margin-top: 16px;">
          <div class="panel__body" id="pedidos-list">
            ${renderPedidosTableUI(state.pedidos)}
          </div>
        </div>

      </section>
    `

    // Set filter values and handlers
    const r = root
    const setSel = (name, val) => { const s = qs(`select[name="${name}"]`, r); if(s) s.value = val || '' }
    setSel('grupoCodigo', state.filtros.grupoCodigo)
    setSel('tipoEntrega', state.filtros.tipoEntrega)
    setSel('estadoPedido', state.filtros.estadoPedido)
    setSel('estadoPago', state.filtros.estadoPago)
    const fechaEl = qs('input[name="fecha"]', r); if(fechaEl) fechaEl.value = state.fecha
    const fechaPedidosEl = qs('input[name="fechaPedidos"]', r); if(fechaPedidosEl) fechaPedidosEl.value = state.fechaPedidos || ''
    qs('#btn-aplicar', r).addEventListener('click', onFilterChange)
    if(!state.loading){
      // ensure current data is rendered
      updateSummary()
      updatePedidos()
    }
  }

  function renderSummaryCards(){
    const total = state.pedidos.length
    const entregados = state.pedidos.filter(p => p.estadoPedido === 'ENTREGADO').length
    const pendientes = state.pedidos.filter(p => p.estadoPedido !== 'ENTREGADO' && p.estadoPedido !== 'CANCELADO').length
    const c = state.conciliacion || { totalEfectivoCobrado: 0, totalDepositado: 0, totalPendienteDeposito: 0 }
    return `
      <div class="card"><div class="card__body"><h3>Total pedidos</h3><div style="font-size:24px;font-weight:800;">${total}</div></div></div>
      <div class="card"><div class="card__body"><h3>Pendientes</h3><div style="font-size:24px;font-weight:800;">${pendientes}</div></div></div>
      <div class="card"><div class="card__body"><h3>Entregados</h3><div style="font-size:24px;font-weight:800;">${entregados}</div></div></div>
      <div class="card"><div class="card__body"><h3>Total efectivo cobrado</h3><div style="font-size:24px;font-weight:800;">${money(c.totalEfectivoCobrado||0)}</div></div></div>
      <div class="card"><div class="card__body"><h3>Total depositado</h3><div style="font-size:24px;font-weight:800;">${money(c.totalDepositado||0)}</div></div></div>
      <div class="card"><div class="card__body"><h3>Pendiente de depositar</h3><div style="font-size:24px;font-weight:800;">${money(c.totalPendienteDeposito||0)}</div></div></div>
    `
  }

  function updateSummary(){
    const container = qs('#summary-cards')
    if(container) container.innerHTML = renderSummaryCards()
  }

  function renderPedidosTableUI(pedidos){
    if(!pedidos || !pedidos.length){
      return '<div class="empty">Sin pedidos para los filtros seleccionados.</div>'
    }
    // Removed visible ID column; adjusted widths for cleaner layout
    const gridCols = '120px 1.2fr 130px 120px 160px 110px 160px 140px 140px 200px'
    const head = `
      <div class="table-scroll">
        <div style="min-width:1120px;">
          <div style="display:grid; grid-template-columns: ${gridCols}; gap: 12px; font-weight:700; padding: 6px 0;">
            <div>Folio</div>
            <div>Cliente</div>
            <div>Telefono</div>
            <div>Grupo</div>
            <div>Entrega</div>
            <div>Total</div>
            <div>Estado pedido</div>
            <div>Estado pago</div>
            <div>Repartidor</div>
            <div>Acciones</div>
          </div>
    `
    const rows = pedidos.map(p => {
      const isDelivery = String(p.tipoEntrega) === 'HUEHUE_DELIVERY'
      return `
          <div style="display:grid; grid-template-columns: ${gridCols}; gap: 12px; align-items:center; padding: 10px 0; border-top: 1px solid rgba(0,0,0,0.06);" data-pedido-id="${p.pedidoId}">
            <div>${escapeHtml(p.folio)}</div>
            <div>${escapeHtml(p.clienteNombre||'')}</div>
            <div>${escapeHtml(p.telefono||'')}</div>
            <div><span class="badge">${escapeHtml(p.grupoCodigo||'')}</span></div>
            <div>${labelOf('tipoEntrega', p.tipoEntrega)}</div>
            <div>${money(p.total||0)}</div>
            <div>${labelOf('estadoPedido', p.estadoPedido)}</div>
            <div>${labelOf('estadoPago', p.estadoPago)}</div>
            <div>${isDelivery ? escapeHtml(p.repartidorUsername||'-') : '<span class="status">No aplica</span>'}</div>
            <div>
              <div style="display:flex; gap:6px; align-items:center; justify-content:flex-start; flex-wrap:wrap;">
                <button class="btn btn--ghost" data-act="estado" data-id="${p.pedidoId}">Estado</button>
                ${isDelivery ? `<button class="btn btn--ghost" data-act="repartidor" data-id="${p.pedidoId}">Asignar</button>` : ''}
              </div>
            </div>
          </div>
      `
    }).join('')
    return head + rows + '</div></div>'
  }

  function updatePedidos(){
    const list = qs('#pedidos-list')
    if(list){
      list.innerHTML = renderPedidosTableUI(state.pedidos)
      qsa('button[data-act="estado"]', list).forEach(btn => {
        const id = Number(btn.getAttribute('data-id'))
        const pedido = state.pedidos.find(x => x.pedidoId === id)
        if(pedido){ btn.addEventListener('click', () => changeEstado(pedido)) }
      })
      qsa('button[data-act="repartidor"]', list).forEach(btn => {
        try { btn.className = 'btn btn--ghost' } catch(e){}
        const id = Number(btn.getAttribute('data-id'))
        const pedido = state.pedidos.find(x => x.pedidoId === id)
        if(pedido){ btn.addEventListener('click', () => asignarRepartidor(pedido)) }
      })
    }
  }

  

  // Boot
  function init(){ render() }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
