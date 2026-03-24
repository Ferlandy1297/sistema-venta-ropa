package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.AdminDtos;
import gt.edu.miumg.svr.model.DropEntity;
import gt.edu.miumg.svr.model.enums.DropEstado;
import gt.edu.miumg.svr.service.AdminCatalogService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin/drops")
public class AdminDropsController {

    private final AdminCatalogService adminCatalogService;

    public AdminDropsController(AdminCatalogService adminCatalogService) {
        this.adminCatalogService = adminCatalogService;
    }

    @PostMapping
    public DropEntity create(@Valid @RequestBody AdminDtos.CreateDropRequest req) {
        return adminCatalogService.createDrop(req.grupoCodigo, req.nombre, req.estado);
    }

    @GetMapping
    public List<DropEntity> list(@RequestParam(name = "grupoCodigo", required = false) String grupoCodigo,
                                 @RequestParam(name = "estado", required = false) DropEstado estado) {
        return adminCatalogService.listDrops(Optional.ofNullable(grupoCodigo), Optional.ofNullable(estado));
    }

    @PatchMapping("/{id}/estado")
    public DropEntity updateEstado(@PathVariable("id") Long id, @Valid @RequestBody AdminDtos.UpdateDropEstadoRequest req) {
        return adminCatalogService.updateDropEstado(id, req.estado);
    }
}

