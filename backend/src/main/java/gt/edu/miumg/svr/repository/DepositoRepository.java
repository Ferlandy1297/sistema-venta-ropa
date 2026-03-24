package gt.edu.miumg.svr.repository;

import gt.edu.miumg.svr.model.Deposito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;

public interface DepositoRepository extends JpaRepository<Deposito, Long> {
    @Query(value = "SELECT COALESCE(SUM(monto),0) FROM depositos WHERE DATE(fecha_deposito) = :fecha", nativeQuery = true)
    BigDecimal sumByFecha(@Param("fecha") LocalDate fecha);
}

