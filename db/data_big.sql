-- ------------------------------------------
-- Sistema de venta de ropa (Morfosis / Elite 360)
-- Datos de demostracion grandes
-- Ejecutar este archivo despues de db/schema.sql
-- ------------------------------------------
-- Nota de ejecucion:
-- Ejecutar conectado a la base de datos actual del proyecto.
-- No asume un nombre especifico de base de datos.

-- ------------------------------------------
-- Limpieza segura y reinicio de identidades
-- ------------------------------------------
TRUNCATE TABLE
  pedido_eventos,
  bolsas,
  pedido_detalle,
  pedidos,
  prendas_fotos,
  prendas,
  drops,
  depositos,
  clientes_direcciones,
  clientes,
  grupos,
  usuarios
RESTART IDENTITY CASCADE;

ALTER SEQUENCE pedido_folio_seq RESTART WITH 1;

-- ------------------------------------------
-- Usuarios de demo y apoyo
-- Mantener credenciales usadas por el frontend:
-- admin / admin123
-- repartidor_huehue / repartidor123
-- encargado_santiago / santiago123
-- IDs esperadas:
--   1 admin
--   2 repartidor_huehue
--   3 encargado_santiago
--   4 repartidor_luis
--   5 repartidor_marta
--   6 santiago_pablo
-- ------------------------------------------
INSERT INTO usuarios (username, password, nombre_completo, rol, activo) VALUES
  ('admin', '{noop}admin123', 'Administrador General', 'ADMIN', TRUE),
  ('repartidor_huehue', '{noop}repartidor123', 'Repartidor Huehuetenango', 'REPARTIDOR_HUEHUE', TRUE),
  ('encargado_santiago', '{noop}santiago123', 'Encargado Santiago', 'ENCARGADO_SANTIAGO', TRUE),
  ('repartidor_luis', '{noop}repartidor123', 'Luis Perez', 'REPARTIDOR_HUEHUE', TRUE),
  ('repartidor_marta', '{noop}repartidor123', 'Marta Diaz', 'REPARTIDOR_HUEHUE', TRUE),
  ('santiago_pablo', '{noop}santiago123', 'Pablo Castillo', 'ENCARGADO_SANTIAGO', TRUE);

-- ------------------------------------------
-- Grupos de negocio
-- ------------------------------------------
INSERT INTO grupos (codigo, nombre) VALUES
  ('MORFOSIS', 'Morfosis'),
  ('ELITE360', 'Elite 360');

-- ------------------------------------------
-- Drops
-- ------------------------------------------
INSERT INTO drops (grupo_id, nombre, estado, created_at, published_at)
VALUES
  (1, 'Morfosis Primavera 2026', 'PUBLICADO', now() - interval '30 days', now() - interval '28 days'),
  (1, 'Morfosis Verano 2026', 'PUBLICADO', now() - interval '10 days', now() - interval '9 days'),
  (1, 'Morfosis Otono 2025', 'CERRADO', now() - interval '180 days', now() - interval '175 days'),
  (1, 'Morfosis Borrador Jeans', 'BORRADOR', now() - interval '2 days', NULL),
  (2, 'Elite360 Urban 2026', 'PUBLICADO', now() - interval '20 days', now() - interval '19 days'),
  (2, 'Elite360 Street Classics', 'PUBLICADO', now() - interval '5 days', now() - interval '4 days'),
  (2, 'Elite360 Flash Sale', 'BORRADOR', now() - interval '1 day', NULL),
  (2, 'Elite360 Edicion 2025', 'CERRADO', now() - interval '200 days', now() - interval '198 days');

UPDATE drops
SET closed_at = published_at + interval '14 days'
WHERE id IN (3, 8);

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Prendas y fotos
-- Una prenda representa stock=1
-- ------------------------------------------
INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (1, 'Blusa floral', 199.00, 'DISPONIBLE'),
  (1, 'Jeans azul', 249.00, 'DISPONIBLE'),
  (1, 'Chaqueta ligera', 329.00, 'DISPONIBLE'),
  (1, 'Falda midi', 179.00, 'DISPONIBLE'),
  (1, 'Camisa blanca', 159.00, 'DISPONIBLE'),
  (1, 'Vestido verano', 279.00, 'DISPONIBLE'),
  (1, 'Top encaje', 139.00, 'DISPONIBLE'),
  (1, 'Pantalon beige', 269.00, 'DISPONIBLE'),
  (1, 'Sueter pastel', 209.00, 'DISPONIBLE'),
  (1, 'Blazer lino', 349.00, 'DISPONIBLE'),
  (1, 'Shorts denim', 189.00, 'DISPONIBLE'),
  (1, 'Cardigan corto', 199.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (2, 'Blusa rayas', 189.00, 'DISPONIBLE'),
  (2, 'Pantalon cargo', 289.00, 'DISPONIBLE'),
  (2, 'Vestido floral', 319.00, 'DISPONIBLE'),
  (2, 'Camiseta basica', 99.00, 'DISPONIBLE'),
  (2, 'Falda plisada', 199.00, 'DISPONIBLE'),
  (2, 'Chaqueta denim', 339.00, 'DISPONIBLE'),
  (2, 'Jumpsuit', 299.00, 'DISPONIBLE'),
  (2, 'Top saten', 159.00, 'DISPONIBLE'),
  (2, 'Pantalon negro', 259.00, 'DISPONIBLE'),
  (2, 'Sueter ligero', 179.00, 'DISPONIBLE'),
  (2, 'Blazer negro', 359.00, 'DISPONIBLE'),
  (2, 'Pantalon culotte', 229.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (5, 'Hoodie negro', 289.00, 'DISPONIBLE'),
  (5, 'Jogger gris', 219.00, 'DISPONIBLE'),
  (5, 'Playera oversize', 149.00, 'DISPONIBLE'),
  (5, 'Gorra urbana', 99.00, 'DISPONIBLE'),
  (5, 'Campera ligera', 279.00, 'DISPONIBLE'),
  (5, 'Pantalon jogger negro', 239.00, 'DISPONIBLE'),
  (5, 'Camiseta grafica', 169.00, 'DISPONIBLE'),
  (5, 'Chaleco utilitario', 199.00, 'DISPONIBLE'),
  (5, 'Sudadera beige', 259.00, 'DISPONIBLE'),
  (5, 'Short deportivo', 149.00, 'DISPONIBLE'),
  (5, 'Windbreaker', 309.00, 'DISPONIBLE'),
  (5, 'Polo clasico', 179.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (6, 'Hoodie blanco', 279.00, 'DISPONIBLE'),
  (6, 'Jogger negro', 229.00, 'DISPONIBLE'),
  (6, 'Playera basica', 119.00, 'DISPONIBLE'),
  (6, 'Gorra snapback', 109.00, 'DISPONIBLE'),
  (6, 'Chaqueta wind', 319.00, 'DISPONIBLE'),
  (6, 'Pantalon cargo negro', 269.00, 'DISPONIBLE'),
  (6, 'Camiseta logo', 159.00, 'DISPONIBLE'),
  (6, 'Chaleco acolchado', 249.00, 'DISPONIBLE'),
  (6, 'Sudadera con capucha', 269.00, 'DISPONIBLE'),
  (6, 'Short cargo', 159.00, 'DISPONIBLE'),
  (6, 'Rompeviento', 299.00, 'DISPONIBLE'),
  (6, 'Polo slim', 189.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (3, 'Abrigo lana', 499.00, 'DISPONIBLE'),
  (3, 'Sueter cuello alto', 239.00, 'DISPONIBLE'),
  (3, 'Pantalon sastre', 299.00, 'DISPONIBLE'),
  (3, 'Bufanda', 89.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (4, 'Jeans skinny', 259.00, 'DISPONIBLE'),
  (4, 'Jeans mom', 249.00, 'DISPONIBLE'),
  (4, 'Chaqueta cuero', 459.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (7, 'Hoodie estampado', 199.00, 'DISPONIBLE'),
  (7, 'Camiseta tie-dye', 129.00, 'DISPONIBLE'),
  (7, 'Short runner', 139.00, 'DISPONIBLE');

INSERT INTO prendas (drop_id, titulo, precio, estado) VALUES
  (8, 'Parka', 399.00, 'DISPONIBLE'),
  (8, 'Chaleco tecnico', 279.00, 'DISPONIBLE'),
  (8, 'Jogger termico', 259.00, 'DISPONIBLE'),
  (8, 'Gorro beanie', 79.00, 'DISPONIBLE');

INSERT INTO prendas_fotos (prenda_id, url, orden)
SELECT id, 'https://picsum.photos/seed/p' || id || '/600/800', 1
FROM prendas;

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Clientes y direcciones
-- ------------------------------------------
INSERT INTO clientes (nombre, telefono) VALUES
  ('Ana Lopez', '502-5551-0001'),
  ('Carlos Perez', '502-5551-0002'),
  ('Maria Gomez', '502-5551-0003'),
  ('Kevin Morales', '502-5551-0004'),
  ('Sofia Ruiz', '502-5551-0005'),
  ('Diego Alvarez', '502-5551-0006'),
  ('Lucia Martinez', '502-5551-0007'),
  ('Pedro Castillo', '502-5551-0008'),
  ('Elena Torres', '502-5551-0009'),
  ('Jorge Ramos', '502-5551-0010'),
  ('Valeria Cano', '502-5551-0011'),
  ('Bruno Diaz', '502-5551-0012');

INSERT INTO clientes_direcciones (cliente_id, municipio, zona, direccion, referencia, es_principal) VALUES
  (1, 'HUEHUETENANGO', 'Zona 1', '3ra Calle 5-10', 'Frente al parque central', TRUE),
  (2, 'HUEHUETENANGO', 'Zona 3', 'Av. Principal 10-55', 'Cerca del mercado', TRUE),
  (3, 'SANTIAGO_CHIMAL', NULL, 'Plaza Central', 'Kiosko rojo', TRUE),
  (4, 'HUEHUETENANGO', 'Zona 2', '5a Avenida 12-34', 'A una cuadra del hospital', TRUE),
  (5, 'SANTIAGO_CHIMAL', NULL, 'Parque San Jose', 'Frente a la iglesia', TRUE),
  (6, 'HUEHUETENANGO', 'Zona 5', 'Col. Las Flores 8-22', 'Casa azul', TRUE),
  (7, 'SANTIAGO_CHIMAL', NULL, 'Centro Comercial X', 'Entrada principal', TRUE),
  (8, 'HUEHUETENANGO', 'Zona 6', 'Col. El Rosario', 'Porton negro', TRUE),
  (9, 'SANTIAGO_CHIMAL', NULL, 'Plaza La Esquina', 'Local 12', TRUE),
  (10, 'HUEHUETENANGO', 'Zona 4', 'Av. Reforma 2-20', 'Esquina farmacia', TRUE),
  (11, 'SANTIAGO_CHIMAL', NULL, 'Parque Central', 'Banca norte', TRUE),
  (12, 'HUEHUETENANGO', 'Zona 7', 'Resid. Campo Verde', 'Torre B', TRUE);

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Pedidos
-- Cada pedido usa prendas de un solo drop
-- ------------------------------------------

-- 1) Huehue, efectivo contraentrega, preparando, 2 bolsas, demo repartidor
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, created_at, preparado_at
) VALUES (
  NULL, 1, 1, 'HUEHUE_DELIVERY', 'Zona 1', '3ra Calle 5-10', 'Frente al parque central',
  448.00, 'EFECTIVO', 'CONTRAENTREGA', 'PREPARANDO', 2,
  2, now() - interval '8 hours', now() - interval '6 hours'
);

-- 2) Huehue, efectivo ya cobrado, entregado, 1 bolsa, demo repartidor
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, created_at, preparado_at, en_ruta_at, entregado_at,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 1, 2, 'HUEHUE_DELIVERY', 'Zona 3', 'Av. Principal 10-55', 'Cerca del mercado',
  329.00, 'EFECTIVO', 'PAGADO', 'ENTREGADO', 1,
  2, now() - interval '3 days', now() - interval '3 days', now() - interval '2 days', now() - interval '1 day',
  TRUE, 329.00, 2, now() - interval '1 day'
);

-- 3) Huehue, transferencia pendiente, confirmado, 1 bolsa
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at
) VALUES (
  NULL, 1, 4, 'HUEHUE_DELIVERY', 'Zona 2', '5a Avenida 12-34', 'A una cuadra del hospital',
  358.00, 'TRANSFERENCIA', 'PENDIENTE', 'CONFIRMADO', 1,
  now() - interval '4 hours'
);

-- 4) Santiago, efectivo contraentrega, listo, 3 bolsas, dos entregadas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at, preparado_at
) VALUES (
  NULL, 2, 5, 'SANTIAGO_PICKUP',
  657.00, 'EFECTIVO', 'CONTRAENTREGA', 'LISTO', 3,
  now() - interval '7 hours', now() - interval '6 hours'
);

-- 5) Santiago, efectivo pagado, entregado, 2 bolsas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at, preparado_at, entregado_at,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 2, 7, 'SANTIAGO_PICKUP',
  298.00, 'EFECTIVO', 'PAGADO', 'ENTREGADO', 2,
  now() - interval '1 day', now() - interval '22 hours', now() - interval '20 hours',
  TRUE, 298.00, 6, now() - interval '20 hours'
);

-- 6) Huehue, efectivo contraentrega, en ruta, 2 bolsas, demo repartidor
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, created_at, preparado_at, en_ruta_at
) VALUES (
  NULL, 1, 6, 'HUEHUE_DELIVERY', 'Zona 5', 'Col. Las Flores 8-22', 'Casa azul',
  418.00, 'EFECTIVO', 'CONTRAENTREGA', 'EN_RUTA', 2,
  2, now() - interval '8 hours', now() - interval '6 hours', now() - interval '2 hours'
);

-- 7) Huehue, transferencia pagada, entregado, 2 bolsas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, created_at, preparado_at, en_ruta_at, entregado_at
) VALUES (
  NULL, 1, 8, 'HUEHUE_DELIVERY', 'Zona 6', 'Col. El Rosario', 'Porton negro',
  408.00, 'TRANSFERENCIA', 'PAGADO', 'ENTREGADO', 2,
  5, now() - interval '5 days', now() - interval '5 days', now() - interval '4 days', now() - interval '3 days'
);

-- 8) Santiago, transferencia pendiente, preparando, 1 bolsa
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at, preparado_at
) VALUES (
  NULL, 2, 9, 'SANTIAGO_PICKUP',
  279.00, 'TRANSFERENCIA', 'PENDIENTE', 'PREPARANDO', 1,
  now() - interval '3 hours', now() - interval '2 hours'
);

-- 9) Huehue, deposito pendiente, confirmado, 2 bolsas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at
) VALUES (
  NULL, 1, 10, 'HUEHUE_DELIVERY', 'Zona 4', 'Av. Reforma 2-20', 'Esquina farmacia',
  548.00, 'DEPOSITO', 'PENDIENTE', 'CONFIRMADO', 2,
  now() - interval '1 day'
);

-- 10) Santiago, efectivo parcial, ya entregado, 2 bolsas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at, preparado_at, entregado_at,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 2, 11, 'SANTIAGO_PICKUP',
  408.00, 'EFECTIVO', 'PARCIAL', 'ENTREGADO', 2,
  now() - interval '5 hours', now() - interval '4 hours', now() - interval '1 hour',
  TRUE, 200.00, 3, now() - interval '1 hour'
);

-- 11) Huehue, efectivo pagado, entregado, 2 bolsas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, created_at, preparado_at, en_ruta_at, entregado_at,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 1, 12, 'HUEHUE_DELIVERY', 'Zona 7', 'Resid. Campo Verde', 'Torre B',
  458.00, 'EFECTIVO', 'PAGADO', 'ENTREGADO', 2,
  4, now() - interval '1 day', now() - interval '22 hours', now() - interval '12 hours', now() - interval '10 hours',
  TRUE, 458.00, 4, now() - interval '10 hours'
);

-- 12) Santiago, efectivo pagado, entregado, 2 bolsas
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at, preparado_at, entregado_at,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 2, 3, 'SANTIAGO_PICKUP',
  388.00, 'EFECTIVO', 'PAGADO', 'ENTREGADO', 2,
  now() - interval '16 hours', now() - interval '15 hours', now() - interval '12 hours',
  TRUE, 388.00, 3, now() - interval '12 hours'
);

-- 13) Historico Huehue de drop cerrado, efectivo pagado, entregado
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, created_at, preparado_at, en_ruta_at, entregado_at,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 1, 6, 'HUEHUE_DELIVERY', 'Zona 5', 'Col. Las Flores 8-22', 'Casa azul',
  588.00, 'EFECTIVO', 'PAGADO', 'ENTREGADO', 2,
  5, now() - interval '122 days', now() - interval '121 days', now() - interval '121 days', now() - interval '120 days',
  TRUE, 588.00, 5, now() - interval '120 days'
);

-- 14) Huehue cancelado, prenda apartada como CANCELADA, 1 bolsa
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  created_at
) VALUES (
  NULL, 1, 4, 'HUEHUE_DELIVERY', 'Zona 2', '5a Avenida 12-34', 'A una cuadra del hospital',
  229.00, 'EFECTIVO', 'PENDIENTE', 'CANCELADO', 1,
  now() - interval '1 day'
);

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Detalle de pedidos
-- ------------------------------------------
INSERT INTO pedido_detalle (pedido_id, prenda_id, precio) VALUES
  (1, 1, 199.00), (1, 2, 249.00),
  (2, 3, 329.00),
  (3, 17, 199.00), (3, 20, 159.00),
  (4, 25, 289.00), (4, 26, 219.00), (4, 27, 149.00),
  (5, 28, 99.00), (5, 32, 199.00),
  (6, 15, 319.00), (6, 16, 99.00),
  (7, 7, 139.00), (7, 8, 269.00),
  (8, 29, 279.00),
  (9, 14, 289.00), (9, 21, 259.00),
  (10, 30, 239.00), (10, 31, 169.00),
  (11, 46, 269.00), (11, 48, 189.00),
  (12, 39, 119.00), (12, 42, 269.00),
  (13, 49, 499.00), (13, 52, 89.00),
  (14, 24, 229.00);

-- Prendas vendidas solo en pedidos activos/entregados
UPDATE prendas
SET estado = 'VENDIDA'
WHERE id IN (
  1, 2, 3,
  7, 8,
  14, 15, 16, 17, 20, 21,
  25, 26, 27, 28, 29, 30, 31, 32,
  39, 42, 46, 48,
  49, 52
);

-- Prenda ligada a pedido cancelado: no disponible para venta
UPDATE prendas
SET estado = 'CANCELADA'
WHERE id = 24;

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Bolsas por pedido
-- ------------------------------------------
INSERT INTO bolsas (pedido_id, numero, entregada) VALUES
  (1, 1, FALSE), (1, 2, FALSE);

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at)
VALUES (2, 1, TRUE, 2, (SELECT entregado_at FROM pedidos WHERE id = 2));

INSERT INTO bolsas (pedido_id, numero, entregada) VALUES
  (3, 1, FALSE);

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (4, 1, TRUE, 3, now() - interval '5 hours'),
  (4, 2, TRUE, 3, now() - interval '4 hours'),
  (4, 3, FALSE, NULL, NULL);

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (5, 1, TRUE, 6, (SELECT entregado_at FROM pedidos WHERE id = 5)),
  (5, 2, TRUE, 6, (SELECT entregado_at FROM pedidos WHERE id = 5));

INSERT INTO bolsas (pedido_id, numero, entregada) VALUES
  (6, 1, FALSE), (6, 2, FALSE);

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (7, 1, TRUE, 5, (SELECT entregado_at FROM pedidos WHERE id = 7)),
  (7, 2, TRUE, 5, (SELECT entregado_at FROM pedidos WHERE id = 7));

INSERT INTO bolsas (pedido_id, numero, entregada) VALUES
  (8, 1, FALSE);

INSERT INTO bolsas (pedido_id, numero, entregada) VALUES
  (9, 1, FALSE), (9, 2, FALSE);

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (10, 1, TRUE, 3, now() - interval '90 minutes'),
  (10, 2, TRUE, 3, now() - interval '1 hour');

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (11, 1, TRUE, 4, (SELECT entregado_at FROM pedidos WHERE id = 11)),
  (11, 2, TRUE, 4, (SELECT entregado_at FROM pedidos WHERE id = 11));

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (12, 1, TRUE, 3, (SELECT entregado_at FROM pedidos WHERE id = 12)),
  (12, 2, TRUE, 3, (SELECT entregado_at FROM pedidos WHERE id = 12));

INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at) VALUES
  (13, 1, TRUE, 5, (SELECT entregado_at FROM pedidos WHERE id = 13)),
  (13, 2, TRUE, 5, (SELECT entregado_at FROM pedidos WHERE id = 13));

INSERT INTO bolsas (pedido_id, numero, entregada) VALUES
  (14, 1, FALSE);

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Depositos
-- Solo se registran montos provenientes de efectivo cobrado
-- ------------------------------------------
INSERT INTO depositos (usuario_id, monto, referencia, fecha_deposito, verificado, nota) VALUES
  (2, 329.00, 'DEP-HUE-0001', now() - interval '20 hours', TRUE, 'Efectivo del pedido entregado HUE demo'),
  (4, 458.00, 'DEP-HUE-0002', now() - interval '8 hours', FALSE, 'Efectivo pendiente de verificacion de ruta Luis'),
  (6, 298.00, 'DEP-STG-0001', now() - interval '18 hours', FALSE, 'Caja de turno Santiago por pedido entregado'),
  (3, 388.00, 'DEP-STG-0002', now() - interval '11 hours', TRUE, 'Cierre de entregas Santiago'),
  (5, 588.00, 'DEP-HUE-HIST-0001', now() - interval '119 days', TRUE, 'Historico de ruta Huehue');

-- APPEND_MARKER_DO_NOT_REMOVE
-- ------------------------------------------
-- Eventos de pedidos
-- ------------------------------------------
INSERT INTO pedido_eventos (pedido_id, tipo_evento, detalle, creado_por, creado_at) VALUES
  (1, 'CONFIRMADO', 'Pedido confirmado', 1, now() - interval '8 hours'),
  (1, 'PREPARANDO', 'Pedido en preparacion', 1, now() - interval '6 hours'),

  (2, 'CONFIRMADO', 'Pedido confirmado', 1, now() - interval '3 days'),
  (2, 'PREPARANDO', 'Pedido en preparacion', 1, now() - interval '3 days'),
  (2, 'EN_RUTA', 'Pedido en ruta', 2, now() - interval '2 days'),
  (2, 'ENTREGADO', 'Pedido entregado y cobrado en efectivo', 2, now() - interval '1 day'),

  (3, 'CONFIRMADO', 'Esperando transferencia', 1, now() - interval '4 hours'),

  (4, 'CONFIRMADO', 'Pedido para recogida en Santiago', 3, now() - interval '7 hours'),
  (4, 'LISTO', 'Bolsas listas en punto de recogida', 3, now() - interval '6 hours'),
  (4, 'BOLSA_ENTREGADA', 'Se entregaron 2 de 3 bolsas', 3, now() - interval '4 hours'),

  (5, 'CONFIRMADO', 'Pedido confirmado en Santiago', 6, now() - interval '1 day'),
  (5, 'LISTO', 'Listo para recoger', 6, now() - interval '22 hours'),
  (5, 'ENTREGADO', 'Pedido entregado en punto de recogida', 6, now() - interval '20 hours'),

  (6, 'CONFIRMADO', 'Pedido confirmado', 1, now() - interval '8 hours'),
  (6, 'PREPARANDO', 'Armando bolsas', 1, now() - interval '6 hours'),
  (6, 'EN_RUTA', 'Salida a ruta Huehue', 2, now() - interval '2 hours'),

  (7, 'CONFIRMADO', 'Pago por transferencia recibido', 1, now() - interval '5 days'),
  (7, 'PREPARANDO', 'Listo para despacho', 1, now() - interval '5 days'),
  (7, 'EN_RUTA', 'En ruta con cliente', 5, now() - interval '4 days'),
  (7, 'ENTREGADO', 'Pedido entregado', 5, now() - interval '3 days'),

  (8, 'CONFIRMADO', 'Pedido confirmado en Santiago', 3, now() - interval '3 hours'),
  (8, 'PREPARANDO', 'Preparando bolsa', 3, now() - interval '2 hours'),

  (9, 'CONFIRMADO', 'Esperando deposito', 1, now() - interval '1 day'),

  (10, 'CONFIRMADO', 'Pago parcial en efectivo', 3, now() - interval '5 hours'),
  (10, 'LISTO', 'Pedido listo para entrega en Santiago', 3, now() - interval '4 hours'),
  (10, 'ENTREGADO', 'Pedido entregado con saldo pendiente', 3, now() - interval '1 hour'),

  (11, 'CONFIRMADO', 'Pedido confirmado', 1, now() - interval '1 day'),
  (11, 'PREPARANDO', 'Pedido listo', 1, now() - interval '22 hours'),
  (11, 'EN_RUTA', 'Reparto Huehue', 4, now() - interval '12 hours'),
  (11, 'ENTREGADO', 'Entregado y cobrado', 4, now() - interval '10 hours'),

  (12, 'CONFIRMADO', 'Pedido confirmado en Santiago', 3, now() - interval '16 hours'),
  (12, 'LISTO', 'Listo para recoger', 3, now() - interval '15 hours'),
  (12, 'ENTREGADO', 'Entregado y cobrado', 3, now() - interval '12 hours'),

  (13, 'CONFIRMADO', 'Historico de drop cerrado', 1, now() - interval '122 days'),
  (13, 'PREPARANDO', 'Listo para envio', 1, now() - interval '121 days'),
  (13, 'EN_RUTA', 'En ruta', 5, now() - interval '121 days'),
  (13, 'ENTREGADO', 'Entregado', 5, now() - interval '120 days'),

  (14, 'CONFIRMADO', 'Pedido creado y luego cancelado por cliente', 1, now() - interval '1 day'),
  (14, 'CANCELADO', 'Cancelacion registrada; prenda marcada como CANCELADA', 1, now() - interval '22 hours');

-- ------------------------------------------
-- Fin del seed extendido
-- ------------------------------------------
