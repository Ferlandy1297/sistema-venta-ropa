;(function(){
  const state = {
    token: null,
    filtros: {
      estadoPedido: '',
      estadoPago: '',
    },
    pedidos: [],
    bolsasByPedido: {},
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
  }
  function labelOf(kind, value){ const v = String(value||''); return (LABELS[kind] && LABELS[kind][v]) ? LABELS[kind][v] : v }

  // Auth helpers
  function ensureToken(){
    state.token = window.Auth.getTokenForRole('santiago')
    return state.token
  }
  async function fetchAuth(path, opts){
    try {
      return await window.API.fetchJson(path, { ...(opts||{}), token: state.token })
    } catch (err){
      if(err && (err.status === 401 || err.status === 403)){
        window.UI.toast('Sesión expirada o sin permisos', 'error')
        try { localStorage.removeItem('token_santiago') } catch(e){}
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
      const pedidos = await fetchAuth('/api/santiago/pedidos')
      state.pedidos = Array.isArray(pedidos) ? pedidos : []
      // Preload bolsas in background (best-effort)
      preloadBolsas()
    } catch (err){
      const msg = err && err.message ? err.message : 'Error cargando pedidos'
      window.UI.toast(msg, 'error')
      state.pedidos = []
    } finally {
      state.loading = false
      updateSummary(); updatePedidos()
    }
  }

  function onFilterChange(){
    const root = qs('#santiago-root')
    ;['estadoPedido','estadoPago'].forEach(k => {
      const sel = qs(`select[name="${k}"]`, root)
      state.filtros[k] = sel ? (sel.value || '') : ''
    })
    updatePedidos(); updateSummary()
  }

  async function preloadBolsas(){
    const pedidos = state.pedidos.slice()
    for(const p of pedidos){
      try {
        const bolsas = await fetchAuth(`/api/santiago/pedidos/${p.id}/bolsas`)
        state.bolsasByPedido[p.id] = Array.isArray(bolsas) ? bolsas : []
      } catch(e){ /* ignore */ }
    }
    updatePedidos(); updateSummary()
  }

  // Actions
  function openBolsasModal(pedido){
    const title = `Entrega / Bolsas - Folio ${escapeHtml(pedido.folio)}`

    async function ensureBolsas(){
      if(!Array.isArray(state.bolsasByPedido[pedido.id])){
        const bolsas = await fetchAuth(`/api/santiago/pedidos/${pedido.id}/bolsas`)
        state.bolsasByPedido[pedido.id] = Array.isArray(bolsas) ? bolsas : []
      }
      return state.bolsasByPedido[pedido.id]
    }

    function renderBody(bolsas){
      const entregadas = bolsas.filter(b => !!b.entregada).length
      const pendientes = (pedido.bolsasTotal||0) - entregadas
      const list = bolsas.map(b => {
        const checked = !!b.entregada
        const disabled = !!b.entregada
        return `
          <label class="check">
            <input type="checkbox" data-numero="${b.numero}" ${checked?'checked':''} ${disabled?'disabled':''} />
            Bolsa #${escapeHtml(b.numero)} ${checked ? '(entregada)' : ''}
          </label>
        `
      }).join('')
      return `
        <div class="grid" style="grid-template-columns: 1fr; gap: 10px;">
          <div><strong>${entregadas}/${escapeHtml(pedido.bolsasTotal)}</strong> bolsas entregadas. ${pendientes>0?escapeHtml(pendientes)+ ' pendientes':''}</div>
          <div class="panel">
            <div class="panel__body">
              <div class="grid" style="grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap: 10px;">
                ${list}
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="panel__body">
              <div id="recoger-wrap"></div>
            </div>
          </div>
        </div>
      `
    }

    function bindBolsas(backdrop, bolsas){
      qsa('input[type="checkbox"][data-numero]', backdrop).forEach(chk => {
        chk.addEventListener('change', async (ev) => {
          const numero = Number(chk.getAttribute('data-numero'))
          // only allow marking as delivered (checking). Prevent uncheck.
          if(!chk.checked){ chk.checked = true; return }
          chk.disabled = true
          try {
            await fetchAuth(`/api/santiago/pedidos/${pedido.id}/bolsas/${numero}/entregar`, { method: 'PATCH' })
            window.UI.toast(`Bolsa #${numero} entregada`, 'success')
            // Update local state
            const arr = state.bolsasByPedido[pedido.id] || []
            const it = arr.find(x => Number(x.numero) === numero)
            if(it){ it.entregada = true }
            // Re-render modal body
            const modalBody = backdrop.querySelector('.modal__body')
            modalBody.innerHTML = renderBody(arr)
            bindBolsas(backdrop, arr)
            bindRecoger(backdrop, pedido, arr)
            updatePedidos(); updateSummary()
          } catch (err){
            const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
            window.UI.toast(msg, 'error')
            chk.disabled = false
            chk.checked = false
          }
        })
      })
    }

    function bindRecoger(backdrop, pedido, bolsas){
      const allEntregadas = (bolsas||[]).filter(b => !!b.entregada).length === (pedido.bolsasTotal||0)
      const wrap = qs('#recoger-wrap', backdrop)
      const esContra = String(pedido.estadoPago) === 'CONTRAENTREGA'
      if(esContra){
        const bodyHtml = `
          <form class="form" id="form-recoger">
            <div class="form__row">
              <label><input type="checkbox" name="efectivoCobrado" checked /> Efectivo cobrado</label>
            </div>
            <div class="form__row" id="row-monto">
              <label>Monto cobrado
                <input type="number" name="efectivoMonto" min="0" step="0.01" value="${escapeHtml(pedido.total)}" required />
              </label>
            </div>
            <div class="form__row -end">
              <button type="button" class="btn btn--secondary" id="btn-cerrar">Cerrar</button>
              <button type="submit" class="btn btn--primary" ${allEntregadas? '' : 'disabled'}>Marcar recogido</button>
            </div>
            <div class="catalog-hint">Para recoger, entrega todas las bolsas primero.</div>
          </form>
        `
        wrap.innerHTML = bodyHtml
        const form = qs('#form-recoger', wrap)
        const chk = qs('input[name="efectivoCobrado"]', form)
        const rowMonto = qs('#row-monto', form)
        const updateMonto = () => { rowMonto.style.display = chk.checked ? 'grid' : 'none' }
        chk.addEventListener('change', updateMonto); updateMonto()
        qs('#btn-cerrar', form).addEventListener('click', window.UI.closeModal)
        form.addEventListener('submit', async (ev) => {
          ev.preventDefault()
          if(!allEntregadas){ window.UI.toast('Entrega todas las bolsas', 'error'); return }
          const fd = new FormData(form)
          const efectivoCobrado = !!fd.get('efectivoCobrado')
          let efectivoMonto = parseFloat((fd.get('efectivoMonto')||'0').toString())
          if(efectivoCobrado && !(efectivoMonto > 0)){
            window.UI.toast('Ingresa monto válido', 'error'); return
          }
          try {
            await fetchAuth(`/api/santiago/pedidos/${pedido.id}/recoger`, { method: 'PATCH', body: { efectivoCobrado, efectivoMonto: efectivoCobrado ? efectivoMonto : 0 } })
            window.UI.toast('Pedido marcado como recogido', 'success')
            window.UI.closeModal(); loadData()
          } catch (err){
            const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
            window.UI.toast(msg, 'error')
          }
        })
      } else {
        const footer = document.createElement('div')
        const btnClose = el('<button class="btn btn--secondary">Cerrar</button>')
        const btnOk = el(`<button class="btn btn--primary" ${allEntregadas? '' : 'disabled'}>Marcar recogido</button>`)
        footer.appendChild(btnClose); footer.appendChild(btnOk)
        wrap.innerHTML = '<div style="display:flex; justify-content:space-between; align-items:center; gap:12px;"><div>Recoger sin cobro de efectivo.</div></div>'
        const footerWrap = document.createElement('div')
        footerWrap.style.display = 'flex'; footerWrap.style.justifyContent = 'flex-end'; footerWrap.style.gap = '8px'
        footerWrap.appendChild(btnClose); footerWrap.appendChild(btnOk)
        wrap.appendChild(footerWrap)
        btnClose.addEventListener('click', window.UI.closeModal)
        btnOk.addEventListener('click', async () => {
          if(!allEntregadas){ window.UI.toast('Entrega todas las bolsas', 'error'); return }
          try {
            await fetchAuth(`/api/santiago/pedidos/${pedido.id}/recoger`, { method: 'PATCH', body: { efectivoCobrado: false, efectivoMonto: 0 } })
            window.UI.toast('Pedido marcado como recogido', 'success')
            window.UI.closeModal(); loadData()
          } catch (err){
            const msg = (err && err.data && err.data.message) ? err.data.message : (err && err.message ? err.message : 'Error')
            window.UI.toast(msg, 'error')
          }
        })
      }
    }

    (async () => {
      try {
        const bolsas = await ensureBolsas()
        const backdrop = window.UI.openModal({ title, body: renderBody(bolsas) })
        bindBolsas(backdrop, bolsas)
        bindRecoger(backdrop, pedido, bolsas)
      } catch (err){
        const msg = (err && err.message) ? err.message : 'Error abriendo bolsas'
        window.UI.toast(msg, 'error')
      }
    })()
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
    const root = qs('#santiago-root')
    if(!root) return
    if(!ensureToken()) renderLogin(root)
    else { renderDashboard(root); loadData() }
  }

  function renderLogin(root){
    root.innerHTML = `
      <section class="section">
        <div class="section__header">
          <h2>Encargado Santiago - Iniciar sesión</h2>
        </div>
        <div class="panel" style="max-width:520px;">
          <div class="panel__body">
            <form class="form" id="scl-login">
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
    const form = qs('#scl-login', root)
    form.addEventListener('submit', async (ev) => {
      ev.preventDefault()
      const fd = new FormData(form)
      const username = (fd.get('username')||'').toString().trim()
      const password = (fd.get('password')||'').toString().trim()
      try {
        const res = await window.Auth.login('santiago', username, password)
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
    const list = qs('#scl-pedidos-list')
    if(list){ list.innerHTML = '<div class="empty">Cargando...</div>' }
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
    const recogidos = list.filter(p => String(p.estadoPedido) === 'ENTREGADO').length
    const pendientes = list.filter(p => String(p.estadoPedido) !== 'ENTREGADO').length
    const pendientesCobro = list.filter(p => String(p.estadoPago) === 'CONTRAENTREGA' && !Boolean(p.efectivoCobrado)).length
    return `
      <div class="card"><div class="card__body"><h3>Total pedidos</h3><div style="font-size:24px;font-weight:800;">${total}</div></div></div>
      <div class="card"><div class="card__body"><h3>Pend. de recoger</h3><div style="font-size:24px;font-weight:800;">${pendientes}</div></div></div>
      <div class="card"><div class="card__body"><h3>Recogidos</h3><div style="font-size:24px;font-weight:800;">${recogidos}</div></div></div>
      <div class="card"><div class="card__body"><h3>Pend. de cobro</h3><div style="font-size:24px;font-weight:800;">${pendientesCobro}</div></div></div>
    `
  }
  function updateSummary(){ const c = qs('#scl-summary'); if(c) c.innerHTML = renderSummaryCards() }

  function bolsasEntregadasStr(p){
    const bolsas = state.bolsasByPedido[p.id]
    if(!Array.isArray(bolsas)) return '—'
    const entregadas = bolsas.filter(b => !!b.entregada).length
    return `${entregadas}/${p.bolsasTotal||0}`
  }

  function isPedidoCompletado(p){
    if(String(p.estadoPedido) === 'ENTREGADO') return true
    const bolsas = state.bolsasByPedido[p.id]
    if(Array.isArray(bolsas)){
      const entregadas = bolsas.filter(b => !!b.entregada).length
      return (p.bolsasTotal||0) > 0 && entregadas === (p.bolsasTotal||0)
    }
    return false
  }

  function renderPedidosTableUI(pedidos){
    if(!pedidos || !pedidos.length){ return '<div class="empty">Sin pedidos para recoger.</div>' }
    const gridCols = '120px 1.3fr 130px 120px 160px 120px 150px 200px 200px'
    const head = `
      <div class="table-scroll">
        <div style="min-width:1200px;">
          <div style="display:grid; grid-template-columns: ${gridCols}; gap: 12px; font-weight:700; padding: 6px 0;">
            <div>Folio</div>
            <div>Cliente</div>
            <div>Teléfono</div>
            <div>Bolsas</div>
            <div>Bolsas entregadas</div>
            <div>Total</div>
            <div>Estado pedido</div>
            <div>Estado pago</div>
            <div>Entrega</div>
          </div>
    `
    const rows = pedidos.map(p => {
      return `
        <div style="display:grid; grid-template-columns: ${gridCols}; gap: 12px; align-items:center; padding: 10px 0; border-top: 1px solid rgba(0,0,0,0.06);" data-id="${p.id}">
          <div>${escapeHtml(p.folio)}</div>
          <div>${escapeHtml(p.cliente && p.cliente.nombre || '')}</div>
          <div>${escapeHtml(p.cliente && p.cliente.telefono || '')}</div>
          <div>${escapeHtml(p.bolsasTotal||0)}</div>
          <div>${escapeHtml(bolsasEntregadasStr(p))}</div>
          <div>${money(p.total||0)}</div>
          <div>${labelOf('estadoPedido', p.estadoPedido)}</div>
          <div>${labelOf('estadoPago', p.estadoPago)}</div>
          <div>Santiago Chimaltenango</div>
        </div>
      `
    }).join('')
    return head + rows + '</div></div>'
  }

  function updatePedidos(){
    const list = qs('#scl-pedidos-list')
    if(list){
      const data = getFiltered()
      list.innerHTML = renderPedidosTableUI(data)
      // Bind row actions: open bolsas modal
      qsa('[data-id]', list).forEach(row => {
        const id = Number(row.getAttribute('data-id'))
        const pedido = state.pedidos.find(x => x.id === id)
        if(!pedido) return
        // Add action button inline
        let act = row.querySelector('.scl-act')
        if(!act){
          act = document.createElement('div')
          act.className = 'scl-act'
          act.style.gridColumn = '1 / -1'
          act.style.paddingTop = '8px'
          const completed = isPedidoCompletado(pedido)
          const label = completed ? 'Ver bolsas' : 'Entrega / Bolsas'
          const klass = completed ? 'btn btn--ghost' : 'btn btn--primary'
          act.innerHTML = `<button class="${klass}" data-act="bolsas" data-id="${pedido.id}">${label}</button>`
          row.after(act)
        }
      })
      qsa('button[data-act="bolsas"]', list).forEach(btn => {
        const id = Number(btn.getAttribute('data-id'))
        const pedido = state.pedidos.find(x => x.id === id)
        if(pedido){ btn.addEventListener('click', () => openBolsasModal(pedido)) }
      })
    }
  }

  function renderDashboard(root){
    root.innerHTML = `
      <section class="section">
        <div class="section__header">
          <h2>Dashboard Santiago</h2>
          <div>
            <button class="btn btn--secondary" id="btn-deposito">Registrar depósito</button>
          </div>
        </div>
        <div class="grid grid--cards" id="scl-summary">
          ${renderSummaryCards()}
        </div>
      </section>

      <section class="section">
        <div class="section__header">
          <h2>Pedidos para recoger</h2>
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
          <div class="panel__body" id="scl-pedidos-list">
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

  // Boot
  function init(){ render() }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()
})()
