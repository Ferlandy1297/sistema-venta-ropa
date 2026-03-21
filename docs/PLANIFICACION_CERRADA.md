MVP 1.0 — Alcance Cerrado

Resumen de alcance
- Drops: creación, activación por ventana (fechas), catálogo asignado, estado (borrador/activo/cerrado).
- Checkout-first: la reserva de inventario se confirma al finalizar el checkout.
- Empaque: bolsas por N unidades (configurable por drop), preparación y control por pedido.
- Logística: rutas/recogidas para entregas locales (Huehuetenango / Santiago Atitlán).
- Finanzas: seguimiento de cobrado vs depositado; cálculo de comisión del 10%.
- Documentos: generación de etiquetas térmicas para pedidos/bolsas.

Reglas clave
- No sobreventa: si no hay stock disponible al checkout, rechazar o esperar reposición.
- Consistencia: una orden pertenece a un único drop; no mezclar drops en el mismo pedido.
- Estados de pedido: creado → pagado → en preparación → listo → entregado → cerrado.
- Conciliación: "cobrado" (confirmación de pago) debe cuadrar con "depositado" (banco); diferencias quedan en pendientes.
- Comisión: 10% aplicado sobre el monto cobrado (definición exacta de base imponible a validar para add-ons/envíos).
- Cortes operativos: horarios de corte por día/ciudad para planificación de rutas.
- Auditoría mínima: trazabilidad de cambios de estado y usuario responsable.

Fuera de alcance (MVP)
- Devoluciones/garantías complejas (solo registro básico de incidencia).
- Inventario avanzado multi-almacén (por ahora inventario simple por drop).
- Integraciones externas (pagos/envíos) más allá de placeholders.

