Base de datos — Morfosis / Elite 360

Requisitos
- PostgreSQL 13+ (recomendado 14 o superior)
- DBeaver (o cliente SQL equivalente)

Creación de la base de datos (solo una vez)
1) Conéctate al servidor PostgreSQL (usuario con permisos de CREATE DATABASE).
2) Ejecuta:
   CREATE DATABASE morfosis_elite360 WITH ENCODING 'UTF8';

Ejecución de scripts (orden)
1) Conéctate a la base morfosis_elite360 en DBeaver.
2) Ejecuta `db/schema.sql` (re-ejecutable: hace DROP y crea todo de nuevo).
3) Ejecuta `db/data.sql` para cargar datos de ejemplo (usuarios, grupos, drops, prendas, clientes, pedidos, bolsas, depósitos, auditoría).

Notas importantes
- `schema.sql` incluye:
  - Trigger genérico `set_updated_at()` para actualizar `updated_at` en `usuarios`, `prendas` y `pedidos`.
  - Secuencia `pedido_folio_seq` y trigger `gen_pedido_folio()` para generar folios:
    - `HUE-000001` para `HUEHUE_DELIVERY`
    - `SCL-000001` para `SANTIAGO_PICKUP`
  - Checks por tipo de entrega: si `HUEHUE_DELIVERY` => `zona`, `direccion`, `referencia` obligatorias.
  - `pedido_detalle.prenda_id` es UNIQUE para evitar doble compra.
- `data.sql` reinicia identidades y la secuencia de folios.

Troubleshooting
- Error: «relation "pedido_folio_seq" does not exist»
  - Solución: ejecuta primero `schema.sql` y luego `data.sql`.
- Error de permisos al crear BD/tablas
  - Usa un usuario con permisos suficientes o solicita al DBA la creación de la base.
- Violación de CHECK por `tipo_entrega`
  - Para `HUEHUE_DELIVERY` debes enviar `zona`, `direccion`, `referencia` no nulos.
- Violación de UNIQUE en `pedido_detalle(prenda_id)`
  - La prenda ya está asignada a otro pedido activo; libera/cancela primero.

Reset de ambiente de desarrollo
- Opción A: re-ejecutar `db/schema.sql` (se pierden datos; recrea todo).
- Opción B: `TRUNCATE` + reinicio de secuencias (ver `data.sql`).
- Reiniciar folios manualmente: `ALTER SEQUENCE pedido_folio_seq RESTART WITH 1;`

