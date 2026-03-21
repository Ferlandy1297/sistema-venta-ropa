-- ==========================================================
-- Sistema de venta de ropa (Morfosis / Elite 360)
-- PostgreSQL Schema — MVP 1.0
-- ==========================================================
-- Cómo ejecutar en DBeaver (desarrollo):
-- 1) Crear la base de datos (si no existe):
--    CREATE DATABASE morfosis_elite360 WITH ENCODING 'UTF8';
-- 2) Conectarse a la base de datos morfosis_elite360.
-- 3) Ejecutar este archivo: db/schema.sql
-- 4) Ejecutar luego: db/data.sql
-- Nota: Este script es re-ejecutable; borra y recrea objetos.

-- ==========================================================
-- Limpieza (re-ejecutable)
-- ==========================================================
DROP TABLE IF EXISTS pedido_eventos CASCADE;
DROP TABLE IF EXISTS depositos CASCADE;
DROP TABLE IF EXISTS bolsas CASCADE;
DROP TABLE IF EXISTS pedido_detalle CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS prendas_fotos CASCADE;
DROP TABLE IF EXISTS prendas CASCADE;
DROP TABLE IF EXISTS drops CASCADE;
DROP TABLE IF EXISTS clientes_direcciones CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS grupos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

DROP FUNCTION IF EXISTS set_updated_at() CASCADE;
DROP FUNCTION IF EXISTS gen_pedido_folio() CASCADE;
DROP SEQUENCE IF EXISTS pedido_folio_seq CASCADE;

-- ==========================================================
-- Tablas base
-- ==========================================================
CREATE TABLE usuarios (
  id           BIGSERIAL PRIMARY KEY,
  username     VARCHAR(50) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  rol          VARCHAR(50) NOT NULL,
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_rol_chk CHECK (rol IN ('ADMIN','REPARTIDOR_HUEHUE','ENCARGADO_SANTIAGO'))
);

CREATE TABLE clientes (
  id           BIGSERIAL PRIMARY KEY,
  nombre       VARCHAR(150) NOT NULL,
  telefono     VARCHAR(25) NOT NULL UNIQUE,
  created_at   TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE clientes_direcciones (
  id            BIGSERIAL PRIMARY KEY,
  cliente_id    BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  municipio     VARCHAR(50) NOT NULL,
  zona          VARCHAR(50),
  direccion     VARCHAR(255),
  referencia    VARCHAR(255),
  es_principal  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE grupos (
  id           BIGSERIAL PRIMARY KEY,
  codigo       VARCHAR(50) NOT NULL UNIQUE,
  nombre       VARCHAR(100) NOT NULL
);

CREATE TABLE drops (
  id           BIGSERIAL PRIMARY KEY,
  grupo_id     BIGINT NOT NULL REFERENCES grupos(id) ON DELETE RESTRICT,
  nombre       VARCHAR(150) NOT NULL,
  estado       VARCHAR(20) NOT NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  published_at TIMESTAMP,
  closed_at    TIMESTAMP,
  CONSTRAINT drops_estado_chk CHECK (estado IN ('BORRADOR','PUBLICADO','CERRADO'))
);

CREATE TABLE prendas (
  id           BIGSERIAL PRIMARY KEY,
  drop_id      BIGINT NOT NULL REFERENCES drops(id) ON DELETE CASCADE,
  titulo       VARCHAR(200) NOT NULL,
  precio       NUMERIC(10,2) NOT NULL,
  estado       VARCHAR(20) NOT NULL DEFAULT 'DISPONIBLE',
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  updated_at   TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT prendas_estado_chk CHECK (estado IN ('DISPONIBLE','VENDIDA','CANCELADA'))
);

CREATE TABLE prendas_fotos (
  id         BIGSERIAL PRIMARY KEY,
  prenda_id  BIGINT NOT NULL REFERENCES prendas(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  orden      INT NOT NULL DEFAULT 1,
  CONSTRAINT prendas_fotos_unique UNIQUE (prenda_id, orden)
);

CREATE TABLE pedidos (
  id                 BIGSERIAL PRIMARY KEY,
  folio              VARCHAR(20) NOT NULL UNIQUE,
  grupo_id           BIGINT NOT NULL REFERENCES grupos(id) ON DELETE RESTRICT,
  cliente_id         BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  tipo_entrega       VARCHAR(30) NOT NULL,
  zona               VARCHAR(50),
  direccion          VARCHAR(255),
  referencia         VARCHAR(255),
  total              NUMERIC(10,2) NOT NULL,
  metodo_pago        VARCHAR(20) NOT NULL,
  estado_pago        VARCHAR(20) NOT NULL,
  estado_pedido      VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO',
  bolsas_total       INT NOT NULL DEFAULT 1,
  repartidor_id      BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  efectivo_cobrado   BOOLEAN NOT NULL DEFAULT FALSE,
  efectivo_monto     NUMERIC(10,2),
  efectivo_cobrado_por BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  efectivo_cobrado_at TIMESTAMP,
  incidencia_tipo    VARCHAR(100),
  incidencia_nota    VARCHAR(255),
  created_at         TIMESTAMP NOT NULL DEFAULT now(),
  updated_at         TIMESTAMP NOT NULL DEFAULT now(),
  preparado_at       TIMESTAMP,
  en_ruta_at         TIMESTAMP,
  entregado_at       TIMESTAMP,
  CONSTRAINT pedidos_tipo_entrega_chk CHECK (tipo_entrega IN ('HUEHUE_DELIVERY','SANTIAGO_PICKUP')),
  CONSTRAINT pedidos_metodo_pago_chk CHECK (metodo_pago IN ('EFECTIVO','TRANSFERENCIA','DEPOSITO')),
  CONSTRAINT pedidos_estado_pago_chk CHECK (estado_pago IN ('PENDIENTE','PAGADO','CONTRAENTREGA','PARCIAL')),
  CONSTRAINT pedidos_estado_pedido_chk CHECK (estado_pedido IN ('CONFIRMADO','PREPARANDO','LISTO','EN_RUTA','ENTREGADO','INCIDENCIA','CANCELADO')),
  CONSTRAINT pedidos_entrega_huehue_chk CHECK (
    (tipo_entrega = 'HUEHUE_DELIVERY' AND zona IS NOT NULL AND direccion IS NOT NULL AND referencia IS NOT NULL)
    OR (tipo_entrega = 'SANTIAGO_PICKUP')
  )
);

CREATE TABLE pedido_detalle (
  id         BIGSERIAL PRIMARY KEY,
  pedido_id  BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  prenda_id  BIGINT NOT NULL REFERENCES prendas(id) ON DELETE RESTRICT,
  precio     NUMERIC(10,2) NOT NULL,
  CONSTRAINT pedido_detalle_prenda_unique UNIQUE (prenda_id)
);

CREATE TABLE bolsas (
  id             BIGSERIAL PRIMARY KEY,
  pedido_id      BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  numero         INT NOT NULL,
  entregada      BOOLEAN NOT NULL DEFAULT FALSE,
  entregada_por  BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  entregada_at   TIMESTAMP,
  CONSTRAINT bolsas_unique UNIQUE (pedido_id, numero)
);

CREATE TABLE depositos (
  id              BIGSERIAL PRIMARY KEY,
  usuario_id      BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  monto           NUMERIC(10,2) NOT NULL,
  referencia      VARCHAR(100) NOT NULL,
  fecha_deposito  TIMESTAMP NOT NULL DEFAULT now(),
  verificado      BOOLEAN NOT NULL DEFAULT FALSE,
  nota            VARCHAR(255)
);

CREATE TABLE pedido_eventos (
  id           BIGSERIAL PRIMARY KEY,
  pedido_id    BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
  tipo_evento  VARCHAR(100) NOT NULL,
  detalle      VARCHAR(255),
  creado_por   BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
  creado_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- ==========================================================
-- Secuencias, funciones y triggers
-- ==========================================================
-- Trigger genérico de updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON prendas
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON pedidos
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Secuencia y trigger para generar folio en pedidos
CREATE SEQUENCE pedido_folio_seq START 1;

CREATE OR REPLACE FUNCTION gen_pedido_folio()
RETURNS TRIGGER AS $$
DECLARE
  next_no BIGINT;
  prefix  TEXT;
BEGIN
  IF NEW.folio IS NULL OR NEW.folio = '' THEN
    next_no := nextval('pedido_folio_seq');
    IF NEW.tipo_entrega = 'HUEHUE_DELIVERY' THEN
      prefix := 'HUE-';
    ELSE
      prefix := 'SCL-';
    END IF;
    NEW.folio := prefix || lpad(next_no::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pedidos_before_insert_folio
BEFORE INSERT ON pedidos
FOR EACH ROW EXECUTE FUNCTION gen_pedido_folio();

-- ==========================================================
-- Índices recomendados
-- ==========================================================
-- pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pedido ON pedidos(estado_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago ON pedidos(estado_pago);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo_entrega ON pedidos(tipo_entrega);
CREATE INDEX IF NOT EXISTS idx_pedidos_repartidor ON pedidos(repartidor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos(created_at);

-- prendas
CREATE INDEX IF NOT EXISTS idx_prendas_estado ON prendas(estado);
CREATE INDEX IF NOT EXISTS idx_prendas_drop_id ON prendas(drop_id);

-- clientes
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

-- drops
CREATE INDEX IF NOT EXISTS idx_drops_grupo ON drops(grupo_id);

-- pedido_detalle
CREATE INDEX IF NOT EXISTS idx_pedido_detalle_pedido ON pedido_detalle(pedido_id);
