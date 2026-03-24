package gt.edu.miumg.svr.repository;

import gt.edu.miumg.svr.model.DropEntity;
import gt.edu.miumg.svr.model.Prenda;
import gt.edu.miumg.svr.model.enums.PrendaEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrendaRepository extends JpaRepository<Prenda, Long> {
    List<Prenda> findByDrop(DropEntity drop);
    List<Prenda> findByDropAndEstado(DropEntity drop, PrendaEstado estado);
}

