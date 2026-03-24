package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.dto.PublicDtos;
import gt.edu.miumg.svr.model.DropEntity;
import gt.edu.miumg.svr.model.Prenda;
import gt.edu.miumg.svr.model.PrendaFoto;
import gt.edu.miumg.svr.model.enums.DropEstado;
import gt.edu.miumg.svr.model.enums.PrendaEstado;
import gt.edu.miumg.svr.repository.DropRepository;
import gt.edu.miumg.svr.repository.PrendaFotoRepository;
import gt.edu.miumg.svr.repository.PrendaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
public class PublicCatalogController {

    private final DropRepository dropRepository;
    private final PrendaRepository prendaRepository;
    private final PrendaFotoRepository prendaFotoRepository;

    public PublicCatalogController(DropRepository dropRepository, PrendaRepository prendaRepository, PrendaFotoRepository prendaFotoRepository) {
        this.dropRepository = dropRepository;
        this.prendaRepository = prendaRepository;
        this.prendaFotoRepository = prendaFotoRepository;
    }

    @GetMapping("/drops")
    public List<PublicDtos.PublicDropDto> listDropsPublicados() {
        List<DropEntity> drops = dropRepository.findByEstado(DropEstado.PUBLICADO);
        return drops.stream().map(d -> {
            PublicDtos.PublicDropDto dto = new PublicDtos.PublicDropDto();
            dto.id = d.getId();
            dto.nombre = d.getNombre();
            dto.estado = d.getEstado().name();
            dto.grupoCodigo = d.getGrupo().getCodigo();
            dto.grupoNombre = d.getGrupo().getNombre();
            return dto;
        }).collect(Collectors.toList());
    }

    @GetMapping("/drops/{dropId}/prendas")
    public List<PublicDtos.PublicPrendaDto> listPrendasDisponibles(@PathVariable("dropId") Long dropId) {
        DropEntity d = dropRepository.findById(dropId).orElseThrow(() -> new IllegalArgumentException("Drop no encontrado"));
        List<Prenda> prendas = prendaRepository.findByDropAndEstado(d, PrendaEstado.DISPONIBLE);
        return prendas.stream().map(p -> {
            PublicDtos.PublicPrendaDto dto = new PublicDtos.PublicPrendaDto();
            dto.id = p.getId();
            dto.titulo = p.getTitulo();
            dto.precio = p.getPrecio();
            List<PrendaFoto> fotos = prendaFotoRepository.findByPrendaOrderByOrdenAsc(p);
            dto.firstFotoUrl = fotos.isEmpty() ? null : fotos.get(0).getUrl();
            return dto;
        }).collect(Collectors.toList());
    }
}

