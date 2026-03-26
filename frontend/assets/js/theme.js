;(function(){
  const KEY_THEME = 'svr_theme' // 'morfosis' | 'elite'
  const KEY_GRUPO = 'svr_grupo_codigo' // 'MORFOSIS' | 'ELITE360'

  function apply(theme){
    const t = theme === 'elite' ? 'elite' : 'morfosis'
    const grupo = t === 'elite' ? 'ELITE360' : 'MORFOSIS'
    document.documentElement.dataset.theme = t
    localStorage.setItem(KEY_THEME, t)
    localStorage.setItem(KEY_GRUPO, grupo)
  }

  function setTheme(theme){
    apply(theme)
    const event = new CustomEvent('svr:theme', { detail: { theme: getTheme(), grupo: getGrupoCodigo() } })
    window.dispatchEvent(event)
  }

  function getTheme(){
    return localStorage.getItem(KEY_THEME) || 'morfosis'
  }

  function getGrupoCodigo(){
    return localStorage.getItem(KEY_GRUPO) || (getTheme() === 'elite' ? 'ELITE360' : 'MORFOSIS')
  }

  function initTheme(){
    apply(getTheme())
  }

  window.Theme = { setTheme, getGrupoCodigo, initTheme, getTheme }
  // Initialize early
  initTheme()
})()

