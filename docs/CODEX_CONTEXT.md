# CODEx Context — Sistema Venta de Ropa (Morfosis / Elite 360)

## 1) Source of truth
- Functional scope: `docs/PLANIFICACION_CERRADA.md` (MVP 1.0 rules are mandatory).
- Commit rules: `docs/CONVENCIONES_COMMITS.md`.

## 2) Tech stack (fixed)
- Database: PostgreSQL (scripts in `db/schema.sql` and `db/data.sql`).
- Backend: Java 17+ Spring Boot (REST API under `/api`), Spring Security JWT, JPA/Hibernate, Flyway (optional later).
- Frontend: HTML + CSS + Vanilla JS using `fetch()` to `/api`.
- Testing: Postman collections under `postman/`.

## 3) Repository layout (monorepo)
- `db/` : SQL scripts and DB docs
- `backend/` : Spring Boot app
- `frontend/` : static web app
- `postman/` : Postman collection + environment
- `docs/` : planning, conventions, context

## 4) Business rules (must not change)
- Two groups: MORFOSIS and ELITE360.
- Sales rule: "checkout-first wins" (a prenda is stock=1 and must not be sold twice).
- Orders:
  - Delivery Huehue requires (zona, direccion, referencia).
  - Santiago pickup does NOT have a maximum pickup time (manual cancellation only).
- One order has one total amount (bags are x/N containers, never redefine total).
- Cash flow:
  - `cobrado` is separate from `depositado` (cash can be collected but not yet deposited).
- Huehue delivery commission: 10% of delivered total (calculated in daily close).

## 5) Roles & permissions (MVP)
- ADMIN/VENDEDOR: full access to drops, products, orders, labels, routes, deposits, close day, users.
- REPARTIDOR_HUEHUE: only assigned orders, mark delivered/cash/incidents, register deposits.
- ENCARGADO_SANTIAGO: only Santiago pickup orders, bag checklist, mark picked up/cash/incidents, register deposits.

## 6) API conventions (mandatory)
- All endpoints are prefixed with `/api`.
- JSON request/response.
- Standard error response:
  - `{ "timestamp": "...", "status": 400, "error": "Bad Request", "message": "...", "path": "/api/..." }`
- Prefer consistent pagination/filtering (later), but keep MVP simple.

## 7) Development rules for Codex (important)
When implementing a segment:
1) Read `docs/PLANIFICACION_CERRADA.md` and this file first.
2) Only modify files explicitly listed in the task.
3) Do NOT regenerate the whole project.
4) Keep changes minimal and incremental.
5) If adding endpoints, also add/update Postman requests in `postman/` (when requested by the segment).
6) If uncertain, prefer adding TODOs in docs instead of inventing requirements.

## 8) Key enums (use these exact values)
- grupo.codigo: `MORFOSIS`, `ELITE360`
- drop.estado: `BORRADOR`, `PUBLICADO`, `CERRADO`
- prenda.estado: `DISPONIBLE`, `VENDIDA`, `CANCELADA`
- pedido.tipo_entrega: `HUEHUE_DELIVERY`, `SANTIAGO_PICKUP`
- pedido.metodo_pago: `EFECTIVO`, `TRANSFERENCIA`, `DEPOSITO`
- pedido.estado_pago: `PENDIENTE`, `PAGADO`, `CONTRAENTREGA`, `PARCIAL`
- pedido.estado_pedido: `CONFIRMADO`, `PREPARANDO`, `LISTO`, `EN_RUTA`, `ENTREGADO`, `INCIDENCIA`, `CANCELADO`

## 9) Acceptance scenarios (must always work)
1) Huehue + cash + 2 bags -> labels x/N -> delivered -> cash collected -> deposit registered.
2) Huehue + transfer -> pending payment -> payment confirmed -> delivered.
3) Santiago + cash + 3 bags -> bag checklist -> picked up -> deposit registered.