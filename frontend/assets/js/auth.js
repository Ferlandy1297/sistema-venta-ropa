;(function(){
  const ROLE_KEY = {
    admin: 'token_admin',
    repartidor: 'token_repartidor',
    santiago: 'token_santiago',
  }

  function storeToken(role, token){
    const key = ROLE_KEY[role]
    if(!key) throw new Error('Rol no soportado')
    localStorage.setItem(key, token)
  }

  function getTokenForRole(role){
    const key = ROLE_KEY[role]
    return key ? localStorage.getItem(key) : null
  }

  function clearTokens(){
    Object.values(ROLE_KEY).forEach(k => localStorage.removeItem(k))
  }

  async function login(role, username, password){
    if(!ROLE_KEY[role]) throw new Error('Rol no soportado')
    const body = { username, password }
    const data = await window.API.fetchJson('/api/auth/login', { method: 'POST', body })
    if(!data || !data.accessToken){
      throw new Error('Respuesta de login inválida')
    }
    storeToken(role, data.accessToken)
    return data
  }

  window.Auth = { login, getTokenForRole, clearTokens }
})()

