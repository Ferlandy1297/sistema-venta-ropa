;(function(){
  function ensureToastContainer(){
    let el = document.querySelector('.toast-container')
    if(!el){
      el = document.createElement('div')
      el.className = 'toast-container'
      document.body.appendChild(el)
    }
    return el
  }

  function toast(message, type){
    const container = ensureToastContainer()
    const t = document.createElement('div')
    t.className = `toast ${type ? 'toast--'+type : ''}`
    t.textContent = message
    container.appendChild(t)
    setTimeout(() => {
      t.style.transition = 'opacity .2s ease'
      t.style.opacity = '0'
      setTimeout(() => t.remove(), 200)
    }, 2400)
  }

  function openModal({ title = 'Información', body = '', footer = null } = {}){
    const backdrop = document.createElement('div')
    backdrop.className = 'modal-backdrop'
    backdrop.addEventListener('click', (e) => { if(e.target === backdrop) closeModal() })

    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.innerHTML = `
      <div class="modal__header">${title}</div>
      <div class="modal__body">${body}</div>
      <div class="modal__footer"></div>
    `
    backdrop.appendChild(modal)

    const footerEl = modal.querySelector('.modal__footer')
    if(footer instanceof HTMLElement){ footerEl.appendChild(footer) }
    else {
      const btn = document.createElement('button')
      btn.className = 'btn btn--secondary'
      btn.textContent = 'Cerrar'
      btn.addEventListener('click', closeModal)
      footerEl.appendChild(btn)
    }

    document.body.appendChild(backdrop)
    return backdrop
  }

  function closeModal(){
    const backdrop = document.querySelector('.modal-backdrop')
    if(backdrop) backdrop.remove()
  }

  window.UI = { toast, openModal, closeModal }
})()

