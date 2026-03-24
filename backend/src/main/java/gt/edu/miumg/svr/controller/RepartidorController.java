package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.OperacionDtos;
import gt.edu.miumg.svr.model.Pedido;
import gt.edu.miumg.svr.service.OperacionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/repartidor")
public class RepartidorController {
    private final OperacionService operacionService;

    public RepartidorController(OperacionService operacionService) {
        this.operacionService = operacionService;
    }

    @GetMapping("/pedidos")
    public List<Pedido> misPedidos(Authentication authentication) {
        return operacionService.repartidorMisPedidos(authentication.getName());
    }

    @PatchMapping("/pedidos/{pedidoId}/en-ruta")
    public Pedido enRuta(@PathVariable Long pedidoId, Authentication authentication) {
        return operacionService.repartidorEnRuta(pedidoId, authentication.getName());
    }

    @PatchMapping("/pedidos/{pedidoId}/entregar")
    public Pedido entregar(@PathVariable Long pedidoId, @Valid @RequestBody OperacionDtos.RepartidorEntregaRequest req, Authentication authentication) {
        return operacionService.repartidorEntregar(pedidoId, authentication.getName(), req.efectivoCobrado, req.efectivoMonto);
    }
}

