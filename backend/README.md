Backend (Spring Boot)

Overview
- Java 17 + Spring Boot 3.x
- Modules to be added later: auth, drops, products, orders, deliveries, deposits.
- Security: only GET /api/health is public; all else requires authentication (skeleton).

Prerequisites
- Java 17 (JDK 17) installed and on PATH
- PostgreSQL accessible at:
  - host: localhost, port: 5433
  - database: sistema_venta_ropa
  - username: svr_user, password: svr_pass

Run (dev)
- Linux/macOS: `cd backend && ./mvnw spring-boot:run`
- Windows: `cd backend && mvnw.cmd spring-boot:run`

Config
- Default datasource is set in `backend/src/main/resources/application.yml`.
- You can override via environment variables:
  - `SPRING_DATASOURCE_URL`
  - `SPRING_DATASOURCE_USERNAME`
  - `SPRING_DATASOURCE_PASSWORD`

Endpoint
- Health: `GET http://localhost:8080/api/health` → `{ "status":"ok", "app":"svr-backend", "timestamp":"..." }`

Notes
- JPA `ddl-auto: validate` expects the DB schema to exist; integration with Flyway can be added later.

