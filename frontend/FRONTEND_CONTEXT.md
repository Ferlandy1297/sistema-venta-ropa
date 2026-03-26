# Frontend Context — Sistema Venta de Ropa (SVR)

Este documento es la “fuente de verdad” del frontend para:
- endpoints reales del backend
- llaves de localStorage (tema + tokens)
- flujo mínimo por rol (Cliente / Admin / Repartidor / Santiago)

> Backend global (dev): http://localhost:8080

---

## 1) Páginas del frontend (Live Server)
- `frontend/index.html` → Home + toggle Morfosis/Elite
- `frontend/cliente.html` → Catálogo público + Checkout (cliente sin login)
- `frontend/admin.html` → Operación diaria (ADMIN)
- `frontend/repartidor.html` → Entregas Huehue (REPARTIDOR_HUEHUE)
- `frontend/santiago.html` → Recogidas Santiago (ENCARGADO_SANTIAGO)

---

## 2) Tema + Grupo (Morfosis / Elite 360)

El frontend debe soportar 2 “themes” visuales y además seleccionar el grupo de negocio.

### LocalStorage keys (obligatorio)
- `svr_theme`: `"morfosis"` | `"elite"`
- `svr_grupo_codigo`: `"MORFOSIS"` | `"ELITE360"`

### Comportamiento
- Toggle cambia el theme (CSS) y también el grupo por defecto para:
  - catálogo público
  - checkout

---

## 3) Tokens por rol (JWT)
El backend usa JWT. El frontend almacena tokens por rol.

### LocalStorage keys
- `token_admin`
- `token_repartidor`
- `token_santiago`

### Roles seed para pruebas (dev)
- ADMIN: `admin / admin123`
- REPARTIDOR_HUEHUE: `repartidor_huehue / repartidor123`
- ENCARGADO_SANTIAGO: `encargado_santiago / santiago123`

---

## 4) Endpoints reales del backend

### 4.1 Salud
- GET `/api/health` (public)

### 4.2 Auth (JWT)
- POST `/api/auth/login` (public)
  - Request: `{ "username": "...", "password": "..." }`
  - Response: `{ "accessToken": "...", "tokenType": "Bearer", "expiresInSeconds": 14400, "rol": "...", "username": "..." }`
- GET `/api/auth/me` (protected)

> Nota: en frontend usar SIEMPRE `accessToken` (no `token`).

---

## 4.3 Catálogo público (Cliente, sin login)
- GET `/api/public/drops`
  - Lista drops PUBLICADO con grupo
- GET `/api/public/drops/{dropId}/prendas`
  - Lista prendas DISPONIBLE (id, titulo, precio, firstFotoUrl)

---

## 4.4 Checkout (Cliente, sin login)
- POST `/api/checkout` (public)
Request Huehue (ejemplo):
```json
{
  "grupoCodigo":"MORFOSIS",
  "tipoEntrega":"HUEHUE_DELIVERY",
  "clienteNombre":"Ana Perez",
  "telefono":"55555555",
  "zona":"Zona 1",
  "direccion":"Barrio X",
  "referencia":"Frente a ...",
  "metodoPago":"EFECTIVO",
  "bolsasTotal":2,
  "prendaIds":[4,5]
}