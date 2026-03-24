package gt.edu.miumg.svr.repository;

import gt.edu.miumg.svr.model.Prenda;
import gt.edu.miumg.svr.model.PrendaFoto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PrendaFotoRepository extends JpaRepository<PrendaFoto, Long> {
    List<PrendaFoto> findByPrendaOrderByOrdenAsc(Prenda prenda);
}

