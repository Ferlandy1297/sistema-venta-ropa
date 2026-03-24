package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.OperacionDtos;
import gt.edu.miumg.svr.model.Bolsa;
import gt.edu.miumg.svr.model.Pedido;
import gt.edu.miumg.svr.model.enums.EstadoPedido;
import gt.edu.miumg.svr.service.OperacionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/santiago")
public class SantiagoController {
    private final OperacionService operacionService;

    public SantiagoController(OperacionService operacionService) {
        this.operacionService = operacionService;
    }

    @GetMapping("/pedidos")
    public List<Pedido> listar(@RequestParam(required = false) EstadoPedido estadoPedido) {
        return operacionService.santiagoListPedidos(Optional.ofNullable(estadoPedido));
    }

    @GetMapping("/pedidos/{pedidoId}/bolsas")
    public List<Bolsa> bolsas(@PathVariable Long pedidoId) {
        return operacionService.santiagoListBolsas(pedidoId);
    }

    @PatchMapping("/pedidos/{pedidoId}/bolsas/{numero}/entregar")
    public Bolsa entregarBolsa(@PathVariable Long pedidoId, @PathVariable Integer numero, Authentication authentication) {
        return operacionService.santiagoEntregarBolsa(pedidoId, numero, authentication.getName());
    }

    @PatchMapping("/pedidos/{pedidoId}/recoger")
    public Pedido recoger(@PathVariable Long pedidoId, @Valid @RequestBody OperacionDtos.SantiagoRecogerRequest req, Authentication authentication) {
        return operacionService.santiagoRecoger(pedidoId, req.efectivoCobrado, req.efectivoMonto, authentication.getName());
    }
}

