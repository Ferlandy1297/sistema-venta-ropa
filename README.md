Sistema de Venta de Ropa — Morfosis / Elite 360

Descripción
- Plataforma para gestionar drops de ropa, checkout de pedidos, empaquetado, entregas locales (Huehuetenango / Santiago Atitlán), impresión de etiquetas térmicas y conciliación de depósitos.
- Este repositorio es un monorepo: DB (PostgreSQL), backend (Java/Spring Boot), frontend (HTML/CSS/JS) y colecciones de Postman.

Tecnologías (referencia)
- DB: PostgreSQL (administrado con DBeaver)
- Backend: Java + Spring Boot (REST /api, Security JWT, JPA)
- Frontend: HTML + CSS + JavaScript (fetch a REST)
- Pruebas: Postman collections

Estructura del repositorio
- backend/: Código del servicio Spring Boot (placeholder en este segmento)
- db/: Scripts SQL (schema.sql, data.sql)
- frontend/: Sitio estático (HTML/CSS/JS)
- postman/: Colecciones y environments de Postman
- docs/: Documentación del proyecto

Cómo correr en local (placeholder)
- DB: pendiente definir docker-compose o setup manual (PostgreSQL).
- Backend: pendiente crear proyecto Spring Boot (Maven/Gradle), variables en .env.
- Frontend: pendiente estructura base y build/servir (estático por ahora).
- Postman: importar colección y environment cuando estén disponibles.

Notas de dominio (resumen)
- Drops: lotes de productos activados por ventana temporal.
- Checkout-first: la reserva se hace al confirmar el checkout.
- Entregas: rutas y recogidas en Huehuetenango / Santiago.
- Empaque: bolsas por N unidades, etiquetas térmicas por pedido/bolsa.
- Finanzas: conciliación cobrado vs depositado, comisión del 10%.

