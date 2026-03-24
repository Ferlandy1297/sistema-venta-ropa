package gt.edu.miumg.svr.repository;

import gt.edu.miumg.svr.model.Grupo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GrupoRepository extends JpaRepository<Grupo, Long> {
    Optional<Grupo> findByCodigo(String codigo);
}

