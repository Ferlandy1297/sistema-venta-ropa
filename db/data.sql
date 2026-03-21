-- ==========================================================
-- Datos de ejemplo — MVP 1.0
-- Ejecutar después de db/schema.sql
-- ==========================================================

-- Limpieza
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

-- Reiniciar secuencia de folios
ALTER SEQUENCE pedido_folio_seq RESTART WITH 1;

-- ==========================================================
-- Usuarios
-- ==========================================================
INSERT INTO usuarios (username, password, nombre_completo, rol, activo)
VALUES 
  ('admin', '{noop}admin123', 'Administrador General', 'ADMIN', TRUE),
  ('repartidor_huehue', '{noop}repartidor123', 'Repartidor Huehuetenango', 'REPARTIDOR_HUEHUE', TRUE),
  ('encargado_santiago', '{noop}santiago123', 'Encargado Santiago', 'ENCARGADO_SANTIAGO', TRUE);

-- ==========================================================
-- Grupos
-- ==========================================================
INSERT INTO grupos (codigo, nombre) VALUES
  ('MORFOSIS', 'Morfosis'),
  ('ELITE360', 'Elite 360');

-- ==========================================================
-- Drops (estado: PUBLICADO)
-- ==========================================================
INSERT INTO drops (grupo_id, nombre, estado, published_at)
VALUES
  (1, 'Drop Morfosis Primavera', 'PUBLICADO', now()),
  (2, 'Drop Elite360 Urban', 'PUBLICADO', now());

-- ==========================================================
-- Clientes y direcciones
-- ==========================================================
INSERT INTO clientes (nombre, telefono)
VALUES
  ('Ana López', '502-5551-0001'),
  ('Carlos Pérez', '502-5551-0002'),
  ('María Gómez', '502-5551-0003');

-- Direcciones (opcional)
INSERT INTO clientes_direcciones (cliente_id, municipio, zona, direccion, referencia, es_principal)
VALUES
  (1, 'HUEHUETENANGO', 'Zona 1', '3ra Calle 5-10', 'Frente al parque central', TRUE),
  (2, 'HUEHUETENANGO', 'Zona 3', 'Av. Principal 10-55', 'Cerca del mercado', TRUE),
  (3, 'SANTIAGO_CHIMAL', NULL, 'Plaza Central', 'Kiosko rojo', TRUE);

-- ==========================================================
-- Prendas y fotos (stock=1 por registro)
-- ==========================================================
-- Morfosis (drop_id=1): 5 prendas
INSERT INTO prendas (drop_id, titulo, precio, estado)
VALUES
  (1, 'Blusa floral', 199.00, 'DISPONIBLE'),
  (1, 'Jeans azul', 249.00, 'DISPONIBLE'),
  (1, 'Chaqueta ligera', 329.00, 'DISPONIBLE'),
  (1, 'Falda midi', 179.00, 'DISPONIBLE'),
  (1, 'Camisa blanca', 159.00, 'DISPONIBLE');

-- Elite360 (drop_id=2): 4 prendas
INSERT INTO prendas (drop_id, titulo, precio, estado)
VALUES
  (2, 'Hoodie negro', 289.00, 'DISPONIBLE'),
  (2, 'Jogger gris', 219.00, 'DISPONIBLE'),
  (2, 'Playera oversize', 149.00, 'DISPONIBLE'),
  (2, 'Gorra urbana', 99.00, 'DISPONIBLE');

-- Fotos por prenda (una o dos por prenda)
INSERT INTO prendas_fotos (prenda_id, url, orden)
VALUES
  (1, 'https://picsum.photos/seed/p1a/600/800', 1),
  (1, 'https://picsum.photos/seed/p1b/600/800', 2),
  (2, 'https://picsum.photos/seed/p2/600/800', 1),
  (3, 'https://picsum.photos/seed/p3/600/800', 1),
  (4, 'https://picsum.photos/seed/p4/600/800', 1),
  (5, 'https://picsum.photos/seed/p5/600/800', 1),
  (6, 'https://picsum.photos/seed/p6/600/800', 1),
  (7, 'https://picsum.photos/seed/p7/600/800', 1),
  (8, 'https://picsum.photos/seed/p8/600/800', 1),
  (9, 'https://picsum.photos/seed/p9/600/800', 1);

-- ==========================================================
-- Pedidos de ejemplo
-- Nota: el folio se genera automáticamente por trigger
-- ==========================================================

-- 1) Huehue + EFECTIVO + 2 bolsas
-- Detalles: usaremos prendas id (1) 199.00 y (2) 249.00 => total 448.00
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  repartidor_id, efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 1, 1, 'HUEHUE_DELIVERY', 'Zona 1', '3ra Calle 5-10', 'Frente al parque central',
  448.00, 'EFECTIVO', 'PAGADO', 'PREPARANDO', 2,
  2, TRUE, 448.00, 2, now()
);

-- 2) Huehue + TRANSFERENCIA (pendiente de pago) + 1 bolsa
-- Detalle: prenda id (3) 329.00 => total 329.00
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega, zona, direccion, referencia,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total
) VALUES (
  NULL, 1, 2, 'HUEHUE_DELIVERY', 'Zona 3', 'Av. Principal 10-55', 'Cerca del mercado',
  329.00, 'TRANSFERENCIA', 'PENDIENTE', 'CONFIRMADO', 1
);

-- 3) Santiago + EFECTIVO + 3 bolsas (bolsas con checklist)
-- Detalles: prendas id (6) 289.00, (7) 219.00, (8) 149.00 => total 657.00 (ojo: precio de (7) es 219, suma 289+219+149=657)
INSERT INTO pedidos (
  folio, grupo_id, cliente_id, tipo_entrega,
  total, metodo_pago, estado_pago, estado_pedido, bolsas_total,
  efectivo_cobrado, efectivo_monto, efectivo_cobrado_por, efectivo_cobrado_at
) VALUES (
  NULL, 2, 3, 'SANTIAGO_PICKUP',
  657.00, 'EFECTIVO', 'PAGADO', 'LISTO', 3,
  TRUE, 657.00, 3, now()
);

-- Detalles por pedido (los pedidos generados arriba deberían ser ids 1,2,3)
INSERT INTO pedido_detalle (pedido_id, prenda_id, precio) VALUES
  (1, 1, 199.00),
  (1, 2, 249.00),
  (2, 3, 329.00),
  (3, 6, 289.00),
  (3, 7, 219.00),
  (3, 8, 149.00);

-- Marcar prendas como vendidas cuando aparecen en un pedido
UPDATE prendas SET estado = 'VENDIDA' WHERE id IN (1,2,3,6,7,8);

-- Bolsas
-- Pedido 1: 2 bolsas (sin entregar)
INSERT INTO bolsas (pedido_id, numero, entregada)
VALUES (1, 1, FALSE), (1, 2, FALSE);

-- Pedido 2: 1 bolsa (sin entregar)
INSERT INTO bolsas (pedido_id, numero, entregada)
VALUES (2, 1, FALSE);

-- Pedido 3: 3 bolsas (simular checklist: 1 y 2 entregadas por encargado Santiago)
INSERT INTO bolsas (pedido_id, numero, entregada, entregada_por, entregada_at)
VALUES 
  (3, 1, TRUE, 3, now()),
  (3, 2, TRUE, 3, now()),
  (3, 3, FALSE, NULL, NULL);

-- Depósito de repartidor Huehue correspondiente al pedido 1
INSERT INTO depositos (usuario_id, monto, referencia, verificado, nota)
VALUES (2, 448.00, 'DEP-TEST-001', FALSE, 'Depósito de cierre de ruta');

-- Eventos de pedidos (auditoría mínima)
INSERT INTO pedido_eventos (pedido_id, tipo_evento, detalle, creado_por)
VALUES
  (1, 'CONFIRMADO', 'Pedido confirmado por sistema', 1),
  (1, 'PREPARANDO', 'Pedido en preparación', 1),
  (2, 'CONFIRMADO', 'Pedido confirmado, esperando transferencia', 1),
  (3, 'CONFIRMADO', 'Pedido confirmado en Santiago', 1),
  (3, 'LISTO', 'Pedido listo para entrega en punto de recogida', 3);
