package gt.edu.miumg.svr.service;

import gt.edu.miumg.svr.advice.ConflictException;
import gt.edu.miumg.svr.model.*;
import gt.edu.miumg.svr.model.enums.DropEstado;
import gt.edu.miumg.svr.model.enums.PrendaEstado;
import gt.edu.miumg.svr.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class AdminCatalogService {

    private final GrupoRepository grupoRepository;
    private final DropRepository dropRepository;
    private final PrendaRepository prendaRepository;
    private final PrendaFotoRepository prendaFotoRepository;

    public AdminCatalogService(GrupoRepository grupoRepository, DropRepository dropRepository, PrendaRepository prendaRepository, PrendaFotoRepository prendaFotoRepository) {
        this.grupoRepository = grupoRepository;
        this.dropRepository = dropRepository;
        this.prendaRepository = prendaRepository;
        this.prendaFotoRepository = prendaFotoRepository;
    }

    @Transactional
    public DropEntity createDrop(String grupoCodigo, String nombre, DropEstado estado) {
        Grupo grupo = grupoRepository.findByCodigo(grupoCodigo).orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
        DropEntity d = new DropEntity();
        d.setGrupo(grupo);
        d.setNombre(nombre);
        d.setEstado(estado);
        return dropRepository.save(d);
    }

    public List<DropEntity> listDrops(Optional<String> grupoCodigo, Optional<DropEstado> estado) {
        if (grupoCodigo.isPresent() && estado.isPresent()) {
            Grupo grupo = grupoRepository.findByCodigo(grupoCodigo.get()).orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
            return dropRepository.findByGrupoAndEstado(grupo, estado.get());
        } else if (estado.isPresent()) {
            return dropRepository.findByEstado(estado.get());
        } else if (grupoCodigo.isPresent()) {
            Grupo grupo = grupoRepository.findByCodigo(grupoCodigo.get()).orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));
            return dropRepository.findByGrupo(grupo);
        }
        return dropRepository.findAll();
    }

    @Transactional
    public DropEntity updateDropEstado(Long dropId, DropEstado estado) {
        DropEntity d = dropRepository.findById(dropId).orElseThrow(() -> new IllegalArgumentException("Drop no encontrado"));
        d.setEstado(estado);
        return dropRepository.save(d);
    }

    @Transactional
    public Prenda createPrenda(Long dropId, String titulo, BigDecimal precio, List<String> fotos) {
        DropEntity drop = dropRepository.findById(dropId).orElseThrow(() -> new IllegalArgumentException("Drop no encontrado"));
        Prenda p = new Prenda();
        p.setDrop(drop);
        p.setTitulo(titulo);
        p.setPrecio(precio);
        p.setEstado(PrendaEstado.DISPONIBLE);
        Prenda saved = prendaRepository.save(p);
        List<PrendaFoto> fotosEntities = new ArrayList<>();
        int i = 1;
        if (fotos != null) {
            for (String url : fotos) {
                PrendaFoto pf = new PrendaFoto();
                pf.setPrenda(saved);
                pf.setUrl(url);
                pf.setOrden(i++);
                fotosEntities.add(pf);
            }
            prendaFotoRepository.saveAll(fotosEntities);
        }
        return saved;
    }

    public List<Prenda> listPrendas(Long dropId) {
        DropEntity drop = dropRepository.findById(dropId).orElseThrow(() -> new IllegalArgumentException("Drop no encontrado"));
        return prendaRepository.findByDrop(drop);
    }

    @Transactional
    public Prenda updatePrendaEstado(Long prendaId, PrendaEstado estado) {
        Prenda p = prendaRepository.findById(prendaId).orElseThrow(() -> new IllegalArgumentException("Prenda no encontrada"));
        p.setEstado(estado);
        return prendaRepository.save(p);
    }
}
