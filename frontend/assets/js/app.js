;(function(){
  function ensureFavicon(){
    if(document.querySelector('link[rel="icon"]')) return
    const link = document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/svg+xml'
    // Simple circle favicon (dark) as inline SVG
    link.href = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3Ccircle cx="8" cy="8" r="8" fill="%23111214"/%3E%3C/svg%3E'
    document.head.appendChild(link)
  }
  function navLinks(){
    return [
      { href: 'index.html', label: 'Home' },
      { href: 'cliente.html', label: 'Cliente' },
      { href: 'admin.html', label: 'Admin' },
      { href: 'repartidor.html', label: 'Repartidor' },
      { href: 'santiago.html', label: 'Santiago' },
    ]
  }

  function isActive(href){
    const here = location.pathname.split('/').pop() || 'index.html'
    return here === href
  }

  function logoFor(theme){
    return theme === 'elite' ? 'assets/img/logo-elite.svg' : 'assets/img/logo-morfosis.svg'
  }

  function renderHeader(){
    const header = document.createElement('header')
    header.innerHTML = `
      <div class="promo">
        <div class="container">Drops en Huehue y Santiago · Checkout‑first · Etiquetas térmicas</div>
      </div>
      <nav class="nav">
        <div class="container nav__inner">
          <div class="brand">
            <a href="index.html" class="brand__logo" aria-label="Logo">
              <img id="brand-logo" src="${logoFor(window.Theme.getTheme())}" alt="Logo"/>
            </a>
          </div>
          <div class="menu" role="navigation" aria-label="Principal">
            ${navLinks().map(l => `<a href="${l.href}" class="${isActive(l.href)?'is-active':''}">${l.label}</a>`).join('')}
          </div>
          <div class="nav__actions">
            <div class="toggle" role="tablist" aria-label="Tema">
              <div class="toggle__pill" aria-hidden="true"></div>
              <button id="btn-morfosis" class="toggle__btn" role="tab">Morfosis</button>
              <button id="btn-elite" class="toggle__btn" role="tab">Elite 360</button>
            </div>
            <button class="nav__mobile btn btn--secondary" id="btn-menu" aria-expanded="false" aria-controls="drawer">Menú</button>
          </div>
        </div>
        <div class="nav__drawer container" id="drawer">
          ${navLinks().map(l => `<a href="${l.href}" class="${isActive(l.href)?'is-active':''}">${l.label}</a>`).join('')}
        </div>
      </nav>
    `
    document.body.prepend(header)

    // Toggle setup
    const btnMor = header.querySelector('#btn-morfosis')
    const btnElt = header.querySelector('#btn-elite')
    const updateActive = () => {
      const t = window.Theme.getTheme()
      btnMor.classList.toggle('is-active', t === 'morfosis')
      btnElt.classList.toggle('is-active', t === 'elite')
      const brand = header.querySelector('#brand-logo')
      brand.src = logoFor(t)
    }
    btnMor.addEventListener('click', () => { window.Theme.setTheme('morfosis'); updateActive() })
    btnElt.addEventListener('click', () => { window.Theme.setTheme('elite'); updateActive() })
    updateActive()

    // Mobile menu
    const btnMenu = header.querySelector('#btn-menu')
    const nav = header.querySelector('.nav')
    btnMenu.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open')
      btnMenu.setAttribute('aria-expanded', String(open))
    })

    // Update when theme changes elsewhere
    window.addEventListener('svr:theme', updateActive)
  }

  function renderFooter(){
    const footer = document.createElement('footer')
    footer.className = 'footer'
    footer.innerHTML = `
      <div class="container footer__inner">
        <div class="footer__col">
          <h4>Ayuda</h4>
          <a href="#">Envíos y entregas</a>
          <a href="#">Pagos y comprobantes</a>
          <a href="#">Incidencias</a>
        </div>
        <div class="footer__col">
          <h4>Empresa</h4>
          <a href="#">Nosotros</a>
          <a href="#">Drops</a>
          <a href="#">Contactos</a>
        </div>
        <div class="footer__col">
          <h4>Redes</h4>
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">TikTok</a>
        </div>
        <div class="footer__col">
          <h4>Legal</h4>
          <a href="#">Términos</a>
          <a href="#">Privacidad</a>
          <a href="#">Cookies</a>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="container">© <span id="year"></span> Morfosis / Elite 360</div>
      </div>
    `
    document.body.appendChild(footer)
    const year = footer.querySelector('#year')
    year.textContent = new Date().getFullYear()
  }

  function highlightActive(){
    // already handled during render; no-op placeholder for later
  }

  function init(){
    ensureFavicon()
    renderHeader()
    renderFooter()
    highlightActive()
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
