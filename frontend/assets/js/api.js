;(function(){
  const API = (function(){
    let BASE_URL = 'http://localhost:8080'

    function setBaseUrl(url){
      if(typeof url === 'string' && url.trim()) BASE_URL = url
    }

    async function fetchJson(path, opts){
      const { method = 'GET', body, token } = opts || {}
      const headers = { 'Content-Type': 'application/json' }
      if(token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body != null ? JSON.stringify(body) : undefined,
      })

      const text = await res.text()
      let data = null
      if(text){
        try { data = JSON.parse(text) }
        catch (e) {
          const err = new Error(`Respuesta inválida del servidor (HTTP ${res.status})`)
          err.status = res.status
          throw err
        }
      }

      if(!res.ok){
        const message = data && data.message ? data.message : `HTTP ${res.status}`
        const err = new Error(message)
        err.status = res.status
        err.data = data
        throw err
      }
      return data
    }

    return { setBaseUrl, fetchJson, get baseUrl(){ return BASE_URL } }
  })()

  window.API = API
})()

