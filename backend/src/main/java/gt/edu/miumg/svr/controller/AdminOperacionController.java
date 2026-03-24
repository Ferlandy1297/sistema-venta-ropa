package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.OperacionDtos;
import gt.edu.miumg.svr.model.Bolsa;
import gt.edu.miumg.svr.model.Pedido;
import gt.edu.miumg.svr.model.enums.EstadoPago;
import gt.edu.miumg.svr.model.enums.EstadoPedido;
import gt.edu.miumg.svr.model.enums.TipoEntrega;
import gt.edu.miumg.svr.service.OperacionService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminOperacionController {

    private final OperacionService operacionService;

    public AdminOperacionController(OperacionService operacionService) {
        this.operacionService = operacionService;
    }

    @GetMapping("/pedidos")
    public List<OperacionDtos.AdminPedidoItem> listPedidos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) String grupoCodigo,
            @RequestParam(required = false) TipoEntrega tipoEntrega,
            @RequestParam(required = false) EstadoPedido estadoPedido,
            @RequestParam(required = false) EstadoPago estadoPago
    ) {
        return operacionService.adminListPedidos(Optional.ofNullable(fecha), Optional.ofNullable(grupoCodigo), Optional.ofNullable(tipoEntrega), Optional.ofNullable(estadoPedido), Optional.ofNullable(estadoPago));
    }

    @PatchMapping("/pedidos/{pedidoId}/estado")
    public Pedido updateEstado(@PathVariable Long pedidoId, @Valid @RequestBody OperacionDtos.UpdateEstadoRequest req) {
        return operacionService.adminUpdateEstado(pedidoId, req.estadoPedido, req.incidenciaTipo, req.incidenciaNota);
    }

    @PatchMapping("/pedidos/{pedidoId}/asignar-repartidor")
    public Pedido asignarRepartidor(@PathVariable Long pedidoId, @Valid @RequestBody OperacionDtos.AsignarRepartidorRequest req) {
        return operacionService.adminAsignarRepartidor(pedidoId, req.repartidorUsername);
    }

    @GetMapping("/pedidos/{pedidoId}/bolsas")
    public List<Bolsa> verBolsas(@PathVariable Long pedidoId) {
        return operacionService.adminListBolsas(pedidoId);
    }

    @PatchMapping("/pedidos/{pedidoId}/pago")
    public Pedido actualizarPago(@PathVariable Long pedidoId, @Valid @RequestBody OperacionDtos.AdminPagoRequest req) {
        return operacionService.adminPago(pedidoId, req.estadoPago, req.nota);
    }

    @GetMapping("/conciliacion")
    public Map<String, java.math.BigDecimal> conciliacion(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return operacionService.adminConciliacion(fecha);
    }
}

