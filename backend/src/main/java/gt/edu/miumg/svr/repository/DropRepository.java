package gt.edu.miumg.svr.repository;

import gt.edu.miumg.svr.model.DropEntity;
import gt.edu.miumg.svr.model.Grupo;
import gt.edu.miumg.svr.model.enums.DropEstado;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DropRepository extends JpaRepository<DropEntity, Long> {
    List<DropEntity> findByGrupoAndEstado(Grupo grupo, DropEstado estado);
    List<DropEntity> findByEstado(DropEstado estado);
    List<DropEntity> findByGrupo(Grupo grupo);
}
