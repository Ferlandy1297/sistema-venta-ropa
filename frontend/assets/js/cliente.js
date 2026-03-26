;(function(){
  const state = {
    drops: [],
    prendas: [],
    selectedDropId: null,
    cart: new Map(), // id -> prenda
  }

  function unwrapList(data){
    if(Array.isArray(data)) return data
    if(data && Array.isArray(data.value)) return data.value
    return []
  }

  const fmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 })
  function money(v){
    try { return fmt.format(typeof v === 'string' ? Number(v) : v) } catch(e){ return `Q${v}` }
  }

  function qs(sel){ return document.querySelector(sel) }
  function el(html){ const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild }

  function setGrupoBadge(){
    const badge = qs('#grupo-badge')
    if(badge){ badge.textContent = window.Theme.getGrupoCodigo() }
  }

  async function loadDrops(){
    const container = qs('#drops-container')
    container.innerHTML = '<div class="empty">Cargando drops…</div>'
    try {
      const data = await window.API.fetchJson('/api/public/drops')
      const list = unwrapList(data)
      const grupo = window.Theme.getGrupoCodigo()
      // Filtrar por grupo activo
      state.drops = list.filter(d => d.grupoCodigo === grupo)
      renderDrops()
      // Autoselect first
      if(state.drops.length){
        selectDrop(state.drops[0].id)
      } else {
        qs('#prendas-grid').innerHTML = '<div class="empty">No hay drops publicados para este grupo.</div>'
      }
    } catch (err){
      container.innerHTML = `<div class="empty">Error cargando drops: ${err.message}</div>`
    }
  }

  function renderDrops(){
    const container = qs('#drops-container')
    if(!state.drops.length){
      container.innerHTML = '<div class="empty">No hay drops publicados.</div>'
      return
    }
    container.innerHTML = ''
    state.drops.forEach(d => {
      const isSel = d.id === state.selectedDropId
      const item = el(`
        <button class="drop-item ${isSel?'is-active':''}" data-id="${d.id}">
          <div class="drop-item__title">${escapeHtml(d.nombre)}</div>
          <div class="drop-item__meta">
            <span class="badge">${escapeHtml(d.grupoNombre)}</span>
            <span class="status">${escapeHtml(d.estado)}</span>
          </div>
        </button>
      `)
      item.addEventListener('click', () => selectDrop(d.id))
      container.appendChild(item)
    })
  }

  async function selectDrop(dropId){
    state.selectedDropId = dropId
    renderDrops()
    await loadPrendas(dropId)
  }

  async function loadPrendas(dropId){
    const grid = qs('#prendas-grid')
    const title = qs('#prendas-title')
    const drop = state.drops.find(d => d.id === dropId)
    title.textContent = drop ? `Prendas · ${drop.nombre}` : 'Prendas'
    grid.innerHTML = '<div class="empty">Cargando prendas…</div>'
    try {
      const data = await window.API.fetchJson(`/api/public/drops/${dropId}/prendas`)
      state.prendas = unwrapList(data)
      renderPrendas()
    } catch (err){
      grid.innerHTML = `<div class="empty">Error cargando prendas: ${err.message}</div>`
    }
  }

  function renderPrendas(){
    const grid = qs('#prendas-grid')
    grid.innerHTML = ''
    const list = state.prendas
    if(!list.length){
      grid.innerHTML = '<div class="empty">Sin prendas disponibles en este drop.</div>'
      return
    }
    list.forEach(p => {
      const inCart = state.cart.has(p.id)
      const card = el(`
        <article class="card">
          <div class="card__media">${renderImg(p.firstFotoUrl, p.titulo)}</div>
          <div class="card__body">
            <div class="prenda__top">
              <h3 class="prenda__title">${escapeHtml(p.titulo)}</h3>
              <div class="prenda__price">${money(p.precio)}</div>
            </div>
            <div class="prenda__actions">
              <button class="btn ${inCart?'btn--secondary':'btn--primary'} btn-toggle" data-id="${p.id}">${inCart ? 'Quitar' : 'Añadir'}</button>
            </div>
          </div>
        </article>
      `)
      card.querySelector('.btn-toggle').addEventListener('click', () => toggleCart(p))
      grid.appendChild(card)
    })
  }

  function toggleCart(prenda){
    if(state.cart.has(prenda.id)) state.cart.delete(prenda.id)
    else state.cart.set(prenda.id, prenda)
    renderPrendas()
    renderCart()
  }

  function renderCart(){
    const itemsEl = qs('#cart-items')
    const totalEl = qs('#cart-total')
    const btn = qs('#btn-checkout')
    const values = Array.from(state.cart.values())
    if(!values.length){
      itemsEl.innerHTML = '<div class="empty">Aún no has añadido prendas.</div>'
      totalEl.textContent = money(0)
      btn.disabled = true
      return
    }
    itemsEl.innerHTML = ''
    let total = 0
    values.forEach(p => {
      total += Number(p.precio)
      const row = el(`
        <div class="cart-row">
          <div class="cart-row__info">
            <div class="cart-row__title">${escapeHtml(p.titulo)}</div>
            <div class="cart-row__price">${money(p.precio)}</div>
          </div>
          <button class="btn btn--ghost cart-row__remove" aria-label="Quitar">✕</button>
        </div>
      `)
      row.querySelector('.cart-row__remove').addEventListener('click', () => { toggleCart(p) })
      itemsEl.appendChild(row)
    })
    totalEl.textContent = money(total)
    btn.disabled = false
  }

  function openCheckout(){
    if(!state.cart.size){ window.UI.toast('El carrito está vacío', 'info'); return }
    const body = el(`
      <form id="checkout-form" class="form">
        <div class="form__row">
          <label>Nombre completo<span class="req">*</span>
            <input type="text" name="clienteNombre" required placeholder="Tu nombre" />
          </label>
        </div>
        <div class="form__row">
          <label>Teléfono<span class="req">*</span>
            <input type="tel" name="telefono" required placeholder="5555-5555" />
          </label>
        </div>
        <div class="form__row">
          <label>Entrega<span class="req">*</span>
            <select name="tipoEntrega" required>
              <option value="HUEHUE_DELIVERY">Huehue delivery</option>
              <option value="SANTIAGO_PICKUP">Santiago pickup</option>
            </select>
          </label>
        </div>
        <div id="huehue-fields">
          <div class="form__row">
            <label>Zona<span class="req">*</span>
              <input type="text" name="zona" placeholder="Zona 1" />
            </label>
          </div>
          <div class="form__row">
            <label>Dirección<span class="req">*</span>
              <input type="text" name="direccion" placeholder="Barrio X" />
            </label>
          </div>
          <div class="form__row">
            <label>Referencia<span class="req">*</span>
              <input type="text" name="referencia" placeholder="Frente a ..." />
            </label>
          </div>
        </div>
        <div class="form__row">
          <label>Método de pago<span class="req">*</span>
            <select name="metodoPago" required>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="DEPOSITO">Depósito</option>
            </select>
          </label>
        </div>
        <div class="form__row">
          <label>Bolsas total
            <input type="number" name="bolsasTotal" min="1" max="10" value="1" />
          </label>
        </div>
        <div class="form__row -end">
          <button type="button" class="btn btn--secondary" id="btn-cancel">Cancelar</button>
          <button type="submit" class="btn btn--primary">Confirmar pedido</button>
        </div>
      </form>
    `)
    const footer = document.createElement('div') // not used; form has its own buttons
    const modal = window.UI.openModal({ title: 'Checkout', body })

    const form = body
    const tipoSel = form.querySelector('select[name="tipoEntrega"]')
    const huehueFields = form.querySelector('#huehue-fields')
    const updateEntrega = () => {
      const isHue = tipoSel.value === 'HUEHUE_DELIVERY'
      huehueFields.style.display = isHue ? 'block' : 'none'
      ;['zona','direccion','referencia'].forEach(n => {
        const input = form.querySelector(`[name="${n}"]`)
        if(input){ input.required = isHue }
      })
    }
    tipoSel.addEventListener('change', updateEntrega)
    updateEntrega()
    form.querySelector('#btn-cancel').addEventListener('click', window.UI.closeModal)
    form.addEventListener('submit', submitCheckout)
  }

  async function submitCheckout(ev){
    ev.preventDefault()
    const form = ev.target.closest('form')
    const fd = new FormData(form)
    const payload = {
      grupoCodigo: window.Theme.getGrupoCodigo(),
      tipoEntrega: fd.get('tipoEntrega'),
      clienteNombre: (fd.get('clienteNombre')||'').toString().trim(),
      telefono: (fd.get('telefono')||'').toString().trim(),
      zona: (fd.get('zona')||'').toString().trim() || undefined,
      direccion: (fd.get('direccion')||'').toString().trim() || undefined,
      referencia: (fd.get('referencia')||'').toString().trim() || undefined,
      metodoPago: fd.get('metodoPago'),
      bolsasTotal: parseInt(fd.get('bolsasTotal')||'1', 10) || 1,
      prendaIds: Array.from(state.cart.keys()),
    }
    try {
      const res = await window.API.fetchJson('/api/checkout', { method: 'POST', body: payload })
      // Success: show confirmation
      const modal = document.querySelector('.modal')
      if(modal){
        modal.querySelector('.modal__header').textContent = 'Pedido confirmado'
        const body = modal.querySelector('.modal__body')
        body.innerHTML = `
          <div class="success">
            <div class="success__folio">Folio: <strong>${escapeHtml(res.folio)}</strong></div>
            <div>Total: <strong>${money(res.total)}</strong></div>
            <div>Bolsas: <strong>${res.bolsasTotal || payload.bolsasTotal}</strong></div>
            <div class="success__actions">
              <button class="btn btn--primary" id="btn-new">Nuevo pedido</button>
            </div>
          </div>
        `
        body.querySelector('#btn-new').addEventListener('click', () => {
          state.cart.clear(); renderCart(); window.UI.closeModal()
        })
        const footer = modal.querySelector('.modal__footer')
        footer.innerHTML = ''
      }
      window.UI.toast('Pedido creado', 'success')
    } catch (err){
      if(err.status === 409){
        window.UI.toast('La prenda ya no está disponible', 'error')
        if(state.selectedDropId) loadPrendas(state.selectedDropId)
        return
      }
      if(err.status === 400){
        window.UI.toast(err.message || 'Error de validación', 'error')
        return
      }
      window.UI.toast('Error en checkout', 'error')
    }
  }

  function renderImg(url, alt){
    if(!url) return ''
    const a = escapeHtml(alt || '')
    const u = escapeHtml(url)
    return `<img src="${u}" alt="${a}" loading="lazy"/>`
  }

  function escapeHtml(s){
    return String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]))
  }

  function init(){
    setGrupoBadge()
    loadDrops()
    renderCart()
    const btnCheckout = qs('#btn-checkout')
    btnCheckout.addEventListener('click', openCheckout)
    window.addEventListener('svr:theme', () => { setGrupoBadge(); loadDrops() })
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init)
  else init()

  // Expose for tests if needed
  window.Cliente = { loadDrops, loadPrendas, openCheckout }
  window.ClienteUtils = { unwrapList }
})()

