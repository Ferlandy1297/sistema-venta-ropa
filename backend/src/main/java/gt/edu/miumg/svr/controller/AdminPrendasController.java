package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.AdminDtos;
import gt.edu.miumg.svr.model.Prenda;
import gt.edu.miumg.svr.model.enums.PrendaEstado;
import gt.edu.miumg.svr.service.AdminCatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping
public class AdminPrendasController {

    private final AdminCatalogService adminCatalogService;

    public AdminPrendasController(AdminCatalogService adminCatalogService) {
        this.adminCatalogService = adminCatalogService;
    }

    @PostMapping("/api/admin/drops/{dropId}/prendas")
    public Prenda create(@PathVariable("dropId") Long dropId, @Valid @RequestBody AdminDtos.CreatePrendaRequest req) {
        return adminCatalogService.createPrenda(dropId, req.titulo, req.precio, req.fotos);
    }

    @GetMapping("/api/admin/drops/{dropId}/prendas")
    public List<Prenda> list(@PathVariable("dropId") Long dropId) {
        return adminCatalogService.listPrendas(dropId);
    }

    @PatchMapping("/api/admin/prendas/{id}/estado")
    public Prenda updateEstado(@PathVariable("id") Long id, @Valid @RequestBody AdminDtos.UpdatePrendaEstadoRequest req) {
        return adminCatalogService.updatePrendaEstado(id, req.estado);
    }
}

