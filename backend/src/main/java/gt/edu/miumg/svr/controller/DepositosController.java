package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.OperacionDtos;
import gt.edu.miumg.svr.model.Deposito;
import gt.edu.miumg.svr.service.OperacionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class DepositosController {
    private final OperacionService operacionService;

    public DepositosController(OperacionService operacionService) {
        this.operacionService = operacionService;
    }

    @PostMapping("/depositos")
    public Deposito crear(@Valid @RequestBody OperacionDtos.DepositoCreateRequest req, Authentication auth) {
        return operacionService.crearDeposito(req.monto, req.referencia, auth.getName());
    }

    @PatchMapping("/admin/depositos/{depositoId}/verificar")
    public Deposito verificar(@PathVariable Long depositoId, @Valid @RequestBody OperacionDtos.DepositoVerificarRequest req) {
        return operacionService.adminVerificarDeposito(depositoId, req.verificado, req.nota);
    }
}

