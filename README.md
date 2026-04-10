# Sistema de Venta de Ropa

Repositorio monorepo del sistema de operación comercial para **Morfosis / Elite 360**, enfocado en la gestión de drops, checkout de prendas únicas, operación de pedidos y control de entregas locales.

El proyecto está preparado para una **demo funcional** con frontend estático, backend REST y base de datos PostgreSQL en Docker. Actualmente cubre el flujo público de compra y los flujos operativos principales para administración, reparto en Huehuetenango y recogidas en Santiago Chimaltenango.

## Descripción General

El sistema permite:

- publicar y consultar drops por grupo de negocio (`MORFOSIS` y `ELITE360`)
- mostrar catálogo público de prendas disponibles
- realizar checkout sin login para cliente final
- evitar doble venta mediante la lógica de `checkout-first`
- operar pedidos por estado, pago, entrega y conciliación
- gestionar entrega local en Huehuetenango
- gestionar recogida y control de bolsas en Santiago Chimaltenango
- registrar depósitos asociados a efectivo cobrado

## Flujos de Negocio Cubiertos

### Cliente

- navegación entre Morfosis y Elite 360 mediante tema/grupo activo
- visualización de drops publicados
- visualización de prendas disponibles por drop
- carrito simple en frontend
- checkout público sin autenticación
- selección de tipo de entrega:
  - `HUEHUE_DELIVERY`
  - `SANTIAGO_PICKUP`
- selección de método de pago:
  - `EFECTIVO`
  - `TRANSFERENCIA`
  - `DEPOSITO`
- creación del pedido con folio y bolsas

### Admin

- login con JWT
- consulta de pedidos operativos
- filtros por grupo, tipo de entrega, estado del pedido y estado de pago
- cambio manual de estado del pedido
- asignación de repartidor para pedidos de Huehuetenango
- vista de conciliación diaria:
  - total de efectivo cobrado
  - total depositado
  - total pendiente de depósito

### Repartidor Huehuetenango

- login con JWT
- consulta de pedidos asignados
- filtrado por estado de pedido y pago
- marcar pedido como `EN_RUTA`
- marcar pedido como `ENTREGADO`
- registrar cobro en efectivo para contraentrega
- registrar depósitos

### Santiago Chimaltenango

- login con JWT
- consulta de pedidos para recogida
- visualización y control de bolsas por pedido
- entrega de bolsas una por una
- validación para marcar recogido solo cuando todas las bolsas están entregadas
- registro de cobro en efectivo al momento de la recogida
- registro de depósitos

## Módulos y Funcionalidades Implementadas

- autenticación JWT por roles (`ADMIN`, `REPARTIDOR_HUEHUE`, `ENCARGADO_SANTIAGO`)
- catálogo público por drops publicados
- checkout público con reserva de inventario al confirmar
- generación de folio por tipo de entrega
- creación automática de bolsas por pedido
- API administrativa para drops y prendas
- operación de pedidos por estados
- conciliación básica de efectivo vs depósitos
- registro de eventos básicos de pedidos en base de datos
- frontend estático en HTML/CSS/JS consumiendo la API REST del backend

## Stack Tecnológico

### Frontend

- HTML
- CSS
- JavaScript vanilla
- consumo de API con `fetch()`
- páginas estáticas servidas con Live Server o cualquier servidor estático

### Backend

- Java 17
- Spring Boot 3
- Spring Web
- Spring Security
- JWT
- Spring Data JPA / Hibernate

### Base de Datos

- PostgreSQL
- scripts SQL versionados en `db/schema.sql`, `db/data.sql` y `db/data_big.sql`

### Docker

- Docker Compose para entorno local de PostgreSQL
- volumen persistente `svr_pgdata`

## Estado Actual del Proyecto

### Ya funciona

- base de datos local dockerizada para desarrollo
- backend Spring Boot compilando y exponiendo la API en `/api`
- integración frontend local -> backend local ya configurada
- CORS habilitado para `localhost` y `127.0.0.1`
- login por rol con tokens JWT
- catálogo público y checkout funcionales
- flujo operativo principal de admin, repartidor y Santiago funcional en frontend
- seeds de demo disponibles:
  - `db/data.sql` para dataset pequeño
  - `db/data_big.sql` para dataset más amplio de demo

### Pendiente o mejora futura

- exponer en frontend la gestión administrativa completa de drops, prendas y verificación de depósitos
- generación e impresión de etiquetas térmicas
- suite de pruebas automatizadas
- endurecimiento de configuración para despliegue productivo
- migraciones versionadas de base de datos (por ejemplo, Flyway)

## Setup Local

### Requisitos

- Java 17+
- Docker Desktop
- PostgreSQL vía Docker Compose
- VS Code con Live Server o cualquier servidor estático

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd "Sistema Venta de Ropa"
```

### 2. Crear el archivo `.env`

Copiar el ejemplo y revisar el puerto de PostgreSQL.

```powershell
Copy-Item .env.example .env
```

Importante:

- el backend actual está configurado por defecto para usar `localhost:5433`
- por eso, en el entorno actual de este repositorio conviene dejar:

```env
POSTGRES_DB=sistema_venta_ropa
POSTGRES_USER=svr_user
POSTGRES_PASSWORD=svr_pass
POSTGRES_PORT=5433
```

Si prefieres usar otro puerto, debes ajustar la conexión del backend mediante variables `SPRING_DATASOURCE_*` o modificando `backend/src/main/resources/application.yml`.

### 3. Levantar PostgreSQL con Docker Compose

```bash
docker compose up -d
```

### 4. Ejecutar `db/schema.sql`

Puedes hacerlo con DBeaver, `psql` o copiando el archivo al contenedor:

```bash
docker compose cp db/schema.sql svr_postgres:/tmp/schema.sql
docker compose exec svr_postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/schema.sql'
```

### 5. Cargar datos de demo

Dataset base:

```bash
docker compose cp db/data.sql svr_postgres:/tmp/data.sql
docker compose exec svr_postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/data.sql'
```

Dataset más grande para demo:

```bash
docker compose cp db/data_big.sql svr_postgres:/tmp/data_big.sql
docker compose exec svr_postgres sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -f /tmp/data_big.sql'
```

Recomendación:

- usa `db/data.sql` para una carga rápida
- usa `db/data_big.sql` si quieres una demo más rica con más pedidos, depósitos, estados y casos operativos

### 6. Ejecutar el backend

Windows:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

macOS / Linux:

```bash
cd backend
./mvnw spring-boot:run
```

El backend queda disponible en:

```text
http://localhost:8080
```

### 7. Abrir el frontend

- abre la carpeta `frontend/` con VS Code
- inicia Live Server
- navega a las páginas del sistema desde el navegador

No hay proceso de build para el frontend. Es una aplicación estática HTML/CSS/JS que consume directamente la API del backend.

## Credenciales de Demo

Disponibles tanto en `db/data.sql` como en `db/data_big.sql`.

| Rol | Usuario | Contraseña | Página recomendada |
| --- | --- | --- | --- |
| Admin | `admin` | `admin123` | `frontend/admin.html` |
| Repartidor Huehuetenango | `repartidor_huehue` | `repartidor123` | `frontend/repartidor.html` |
| Encargado Santiago | `encargado_santiago` | `santiago123` | `frontend/santiago.html` |

## Páginas de Demo

- `frontend/index.html`: home de presentación, branding y navegación principal
- `frontend/cliente.html`: catálogo público y checkout
- `frontend/admin.html`: dashboard de operación admin
- `frontend/repartidor.html`: operación del repartidor Huehuetenango
- `frontend/santiago.html`: operación de recogida y control de bolsas en Santiago Chimaltenango

## Flujo de Demo Recomendado

1. Abrir `frontend/index.html` y explicar el cambio entre Morfosis y Elite 360.
2. Ir a `frontend/cliente.html`, cargar un drop publicado y crear un pedido.
3. Entrar a `frontend/admin.html` con el usuario `admin` para mostrar filtros, estados y conciliación.
4. Si el pedido es de Huehuetenango, asignar repartidor y luego abrir `frontend/repartidor.html`.
5. En `frontend/repartidor.html`, marcar `EN_RUTA`, entregar y registrar depósito.
6. Si deseas mostrar el flujo de recogida, abrir `frontend/santiago.html` con `encargado_santiago` y demostrar la entrega de bolsas y el cierre del pedido.
7. Volver a admin para revisar el impacto operativo y la conciliación.

Para demos de varios roles y más casos listos para usar, se recomienda cargar `db/data_big.sql`.

## Estructura del Repositorio

```text
backend/     API Spring Boot
db/          esquema SQL y datasets de demo
docs/        contexto y documentación del proyecto
frontend/    aplicación estática HTML/CSS/JS
postman/     colección y environment para pruebas manuales
.env.example ejemplo de variables locales
docker-compose.yml entorno local de PostgreSQL
```

## Notas de Desarrollo y Testing

- el frontend usa `http://localhost:8080` como base de API
- la integración local con Live Server ya está contemplada mediante configuración CORS en el backend
- el backend usa `spring.jpa.hibernate.ddl-auto=validate`, por lo que la base debe existir antes de iniciar la aplicación
- el seed `db/schema.sql` es re-ejecutable y recrea el esquema completo
- `db/data_big.sql` es el dataset recomendado para demos funcionales más completas
- la carpeta `postman/` incluye archivos para pruebas manuales de la API
- actualmente no existe `backend/src/test`, por lo que no hay suite automatizada en el repositorio

## Alcance del Frontend Actual

El frontend actual está construido como una interfaz estática conectada al backend. No requiere Node.js ni bundler. Las pantallas operativas ya consumen endpoints reales, pero el panel administrativo visual todavía está centrado en operación diaria y conciliación, no en una gestión completa de catálogo.

## Observación Final

Este repositorio representa el estado actual funcional del proyecto para demo, revisión técnica y evolución incremental. Está orientado a mostrar el flujo completo de venta y operación local, manteniendo una base simple de ejecutar en desarrollo.
