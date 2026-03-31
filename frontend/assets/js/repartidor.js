;(function(){
  const state = {
    token: null,
    filtros: {
      estadoPedido: '',
      estadoPago: '',
    },
    pedidos: [],
    loading: false,
  }

  // Utils
  const moneyFmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 })
  function money(v){ try { return moneyFmt.format(typeof v === 'string' ? Number(v) : v) } catch(e){ return `Q${v}` } }
  function qs(sel, root){ return (root||document).querySelector(sel) }
  function qsa(sel, root){ return Array.from((root||document).querySelectorAll(sel)) }
  function el(html){ const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild }
  function escapeHtml(s){ return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])) }

  // Friendly labels
  const LABELS = {
    estadoPedido: {
      CONFIRMADO: 'Confirmado', PREPARANDO: 'Preparando', LISTO: 'Listo', EN_RUTA: 'En ruta', ENTREGADO: 'Entregado', INCIDENCIA: 'Incidencia', CANCELADO: 'Cancelado',
    },
    estadoPago: {
      PENDIENTE: 'Pendiente', PAGADO: 'Pagado', CONTRAENTREGA: 'Contraentrega', PARCIAL: 'Parcial',
    },
    tipoEntrega: {
      HUEHUE_DELIVERY: 'Entrega Huehuetenango', SANTIAGO_PICKUP: 'Retiro en Santiago',
    }
  }
  function labelOf(kind, value){ const v = String(value||''); return (LABELS[kind] && LABELS[kind][v]) ? LABELS[kind][v] : v }

  // Auth helpers
  function ensureToken(){
    state.token = window.Auth.getTokenForRole('repartidor')
    return state.token
  }
  async function fetchAuth(path, opts){
    try {
      return await window.API.fetchJson(path, { ...(opts||{}), token: state.token })
    } catch (err){
      if(err && (err.status === 401 || err.status === 403)){
        window.UI.toast('Sesión expirada o sin permisos', 'error')
        try { localStorage.removeItem('token_repartidor') } catch(e){}
        state.token = null
        render()
      }
      throw err
    }
  }

  // Data
  async function loadData(){
    state.loading = true
    renderLoading()
    try {
      const pedidos = await fetchAuth('/api/repartidor/pedidos')
      state.pedidos = Array.isArray(pedidos) ? pedidos : []
    } catch (err){
      const msg = err && err.message ? err.message : 'Error cargando pedidos'
      window.UI.toast(msg, 'error')
      state.pedidos = []
    } finally {
      state.loading = false
      updateSummary(); updatePedidos()
    }
  }

  // Actions
  function onFilterChange(){
    const root = qs('#repartidor-root')
    ;['estadoPedido','estadoPago'].forEach(k => {
      const sel = qs(`select[name="${k}"]`, root)
      state.filtros[k] = sel ? (sel.value || '') : ''
    })
    updatePedidos(); updateSummary()
  }

  async function markEnRuta(pedido){
    try {
      await fetchAuth(`/api/repartidor/pedidos/${pedido.id}/en-ruta`, { method: 'PATCH' })
      window.UI.toast('Pedido marcado en ruta', 'success')
      loadData()
    } catch (err){
      const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
      window.UI.toast(msg, 'error')
    }
  }

  function openEntregarModal(pedido){
    const esContra = String(pedido.estadoPago) === 'CONTRAENTREGA'
    if(esContra){
      const bodyHtml = `
        <form class="form" id="form-entregar">
          <div class="form__row">
            <label><input type="checkbox" name="efectivoCobrado" checked /> Efectivo cobrado</label>
          </div>
          <div class="form__row" id="row-monto">
            <label>Monto cobrado
              <input type="number" name="efectivoMonto" min="0" step="0.01" value="${escapeHtml(pedido.total)}" required />
            </label>
          </div>
          <div class="form__row -end">
            <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
            <button type="submit" class="btn btn--primary">Confirmar entrega</button>
          </div>
        </form>
      `
      const backdrop = window.UI.openModal({ title: `Entregar folio ${escapeHtml(pedido.folio)}`, body: bodyHtml })
      const form = qs('#form-entregar', backdrop)
      const chk = qs('input[name="efectivoCobrado"]', form)
      const rowMonto = qs('#row-monto', form)
      const updateMonto = () => { rowMonto.style.display = chk.checked ? 'grid' : 'none' }
      chk.addEventListener('change', updateMonto); updateMonto()
      qs('#btn-cancel', form).addEventListener('click', window.UI.closeModal)
      form.addEventListener('submit', async (ev) => {
        ev.preventDefault()
        const fd = new FormData(form)
        const efectivoCobrado = !!fd.get('efectivoCobrado')
        let efectivoMonto = parseFloat((fd.get('efectivoMonto')||'0').toString())
        if(efectivoCobrado && !(efectivoMonto > 0)){
          window.UI.toast('Ingresa monto válido', 'error')
          return
        }
        try {
          await fetchAuth(`/api/repartidor/pedidos/${pedido.id}/entregar`, { method: 'PATCH', body: { efectivoCobrado, efectivoMonto: efectivoCobrado ? efectivoMonto : 0 } })
          window.UI.toast('Entrega registrada', 'success')
          window.UI.closeModal(); loadData()
        } catch (err){
          const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
          window.UI.toast(msg, 'error')
        }
      })
    } else {
      const footer = document.createElement('div')
      const btnCancel = el('<button class="btn btn--secondary">Cancelar</button>')
      const btnOk = el('<button class="btn btn--primary">Marcar entregado</button>')
      footer.appendChild(btnCancel); footer.appendChild(btnOk)
      const backdrop = window.UI.openModal({ title: `Entregar folio ${escapeHtml(pedido.folio)}`, body: '<p>Confirmar entrega sin cobro de efectivo.</p>', footer })
      btnCancel.addEventListener('click', window.UI.closeModal)
      btnOk.addEventListener('click', async () => {
        try {
          await fetchAuth(`/api/repartidor/pedidos/${pedido.id}/entregar`, { method: 'PATCH', body: { efectivoCobrado: false, efectivoMonto: 0 } })
          window.UI.toast('Entrega registrada', 'success')
          window.UI.closeModal(); loadData()
        } catch (err){
          const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
          window.UI.toast(msg, 'error')
        }
      })
    }
  }

  function openDepositoModal(){
    const bodyHtml = `
      <form class="form" id="form-deposito">
        <div class="form__row">
          <label>Monto
            <input type="number" name="monto" min="0.01" step="0.01" required />
          </label>
        </div>
        <div class="form__row">
          <label>Referencia
            <input type="text" name="referencia" required placeholder="Comprobante o nota" />
          </label>
        </div>
        <div class="form__row -end">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Registrar</button>
        </div>
      </form>
    `
    const backdrop = window.UI.openModal({ title: 'Registrar depósito', body: bodyHtml })
    const form = qs('#form-deposito', backdrop)
    qs('#btn-cancel', form).addEventListener('click', window.UI.closeModal)
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const fd = new FormData(form)
      const monto = parseFloat((fd.get('monto')||'0').toString())
      const referencia = (fd.get('referencia')||'').toString().trim()
      if(!(monto > 0)){ window.UI.toast('Monto inválido', 'error'); return }
      if(!referencia){ window.UI.toast('Referencia requerida', 'error'); return }
      try {
        await fetchAuth('/api/depositos', { method: 'POST', body: { monto, referencia } })
        window.UI.toast('Depósito registrado', 'success')
        window.UI.closeModal()
      } catch (err){
        const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
        window.UI.toast(msg, 'error')
      }
    })
  }

  // Rendering
  function render(){
    const root = qs('#repartidor-root')
    if(!root) return
    if(!ensureToken()) renderLogin(root)
    else { renderDashboard(root); loadData() }
  }

  function renderLogin(root){
    root.innerHTML = `
      <section class="section">
        <div class="section__header">
          <h2>Repartidor - Iniciar sesión</h2>
        </div>
        <div class="panel" style="max-width:520px;">
          <div class="panel__body">
            <form class="form" id="rep-login">
              <div class="form__row">
                <label>Usuario
                  <input type="text" name="username" autocomplete="username" required />
                </label>
              </div>
              <div class="form__row">
                <label>Contraseña
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
    const form = qs('#rep-login', root)
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const fd = new FormData(form)
      const username = (fd.get('username')||'').toString().trim()
      const password = (fd.get('password')||'').toString().trim()
      try {
        const res = await window.Auth.login('repartidor', username, password)
        state.token = res && res.accessToken ? res.accessToken : null
        window.UI.toast('Bienvenido', 'success')
        render()
      } catch (err){
        const msg = err && err.message ? err.message : 'Error de autenticación'
        window.UI.toast(msg, 'error')
      }
    })
  }

  function renderLoading(){
    const list = qs('#rep-pedidos-list')
    if(list){ list.innerHTML = '<div class="empty">Cargando...</div>' }
  }

  function renderDashboard(root){
    root.innerHTML = `
      <section class="section">
        <div class="section__header">
          <h2>Dashboard Repartidor Huehue</h2>
          <div>
            <button class="btn btn--secondary" id="btn-deposito">Registrar depósito</button>
          </div>
        </div>
        <div class="grid grid--cards" id="rep-summary">
          ${renderSummaryCards()}
        </div>
      </section>

      <section class="section">
        <div class="section__header">
          <h2>Pedidos asignados</h2>
          <div class="catalog-hint">Filtra por estado y pago</div>
        </div>
        <div class="panel">
          <div class="panel__body">
            <div class="grid" style="grid-template-columns: repeat(2, minmax(180px,1fr));">
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
            </div>
          </div>
          <div class="panel__footer" style="display:flex; justify-content:flex-end;">
            <button class="btn btn--primary" id="btn-aplicar">Aplicar filtros</button>
          </div>
        </div>

        <div class="panel" style="margin-top: 16px;">
          <div class="panel__body" id="rep-pedidos-list">
            ${renderPedidosTableUI(getFiltered())}
          </div>
        </div>
      </section>
    `

    const r = root
    const setSel = (name, val) => { const s = qs(`select[name="${name}"]`, r); if(s) s.value = val || '' }
    setSel('estadoPedido', state.filtros.estadoPedido)
    setSel('estadoPago', state.filtros.estadoPago)
    qs('#btn-aplicar', r).addEventListener('click', onFilterChange)
    qs('#btn-deposito', r).addEventListener('click', openDepositoModal)
    if(!state.loading){ updateSummary(); updatePedidos() }
  }

  function getFiltered(){
    let list = state.pedidos.slice()
    const f = state.filtros
    if(f.estadoPedido) list = list.filter(p => String(p.estadoPedido) === f.estadoPedido)
    if(f.estadoPago) list = list.filter(p => String(p.estadoPago) === f.estadoPago)
    return list
  }

  function renderSummaryCards(){
    const list = getFiltered()
    const total = list.length
    const enRuta = list.filter(p => String(p.estadoPedido) === 'EN_RUTA').length
    const entregados = list.filter(p => String(p.estadoPedido) === 'ENTREGADO').length
    const pendientesCobro = list.filter(p => String(p.estadoPago) === 'CONTRAENTREGA' && !Boolean(p.efectivoCobrado)).length
    return `
      <div class="card"><div class="card__body"><h3>Asignados</h3><div style="font-size:24px;font-weight:800;">${total}</div></div></div>
      <div class="card"><div class="card__body"><h3>En ruta</h3><div style="font-size:24px;font-weight:800;">${enRuta}</div></div></div>
      <div class="card"><div class="card__body"><h3>Entregados</h3><div style="font-size:24px;font-weight:800;">${entregados}</div></div></div>
      <div class="card"><div class="card__body"><h3>Pend. de cobro</h3><div style="font-size:24px;font-weight:800;">${pendientesCobro}</div></div></div>
    `
  }
  function updateSummary(){ const c = qs('#rep-summary'); if(c) c.innerHTML = renderSummaryCards() }

  function renderPedidosTableUI(pedidos){
    if(!pedidos || !pedidos.length){ return '<div class="empty">Sin pedidos asignados.</div>' }
    const gridCols = '120px 1.3fr 130px 1.6fr 120px 150px 150px 160px 220px'
    const head = `
      <div class="table-scroll">
        <div style="min-width:1200px;">
          <div style="display:grid; grid-template-columns: ${gridCols}; gap: 12px; font-weight:700; padding: 6px 0;">
            <div>Folio</div>
            <div>Cliente</div>
            <div>Teléfono</div>
            <div>Dirección / Ref.</div>
            <div>Total</div>
            <div>Estado pedido</div>
            <div>Estado pago</div>
            <div>Entrega</div>
            <div>Acciones</div>
          </div>
    `
    const rows = pedidos.map(p => {
      const direccion = (p.direccion && p.direccion.trim()) ? p.direccion : ''
      const ref = (p.referencia && p.referencia.trim()) ? p.referencia : ''
      const dirRef = escapeHtml(direccion || ref || '-')
      const isHue = String(p.tipoEntrega) === 'HUEHUE_DELIVERY'
      const canEnRuta = isHue && String(p.estadoPedido) !== 'EN_RUTA' && String(p.estadoPedido) !== 'ENTREGADO' && String(p.estadoPedido) !== 'CANCELADO'
      const canEntregar = isHue && (String(p.estadoPedido) === 'EN_RUTA' || String(p.estadoPedido) === 'LISTO')
      return `
        <div style="display:grid; grid-template-columns: ${gridCols}; gap: 12px; align-items:center; padding: 10px 0; border-top: 1px solid rgba(0,0,0,0.06);" data-id="${p.id}">
          <div>${escapeHtml(p.folio)}</div>
          <div>${escapeHtml(p.cliente && p.cliente.nombre || '')}</div>
          <div>${escapeHtml(p.cliente && p.cliente.telefono || '')}</div>
          <div>${dirRef}</div>
          <div>${money(p.total||0)}</div>
          <div>${labelOf('estadoPedido', p.estadoPedido)}</div>
          <div>${labelOf('estadoPago', p.estadoPago)}</div>
          <div>${labelOf('tipoEntrega', p.tipoEntrega)}</div>
          <div>
            <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
              ${canEnRuta ? `<button class="btn btn--ghost" data-act="ruta" data-id="${p.id}">En ruta</button>` : ''}
              ${canEntregar ? `<button class="btn btn--primary" data-act="entregar" data-id="${p.id}">Entregar</button>` : ''}
            </div>
          </div>
        </div>
      `
    }).join('')
    return head + rows + '</div></div>'
  }

  function updatePedidos(){
    const list = qs('#rep-pedidos-list')
    if(list){
      const data = getFiltered()
      list.innerHTML = renderPedidosTableUI(data)
      qsa('button[data-act="ruta"]', list).forEach(btn => {
        const id = Number(btn.getAttribute('data-id'))
        const pedido = state.pedidos.find(x => x.id === id)
        if(pedido){ btn.addEventListener('click', () => markEnRuta(pedido)) }
      })
      qsa('button[data-act="entregar"]', list).forEach(btn => {
        const id = Number(btn.getAttribute('data-id'))
        const pedido = state.pedidos.find(x => x.id === id)
        if(pedido){ btn.addEventListener('click', () => openEntregarModal(pedido)) }
      })
    }
  }

  // Boot
  function init(){ render() }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
