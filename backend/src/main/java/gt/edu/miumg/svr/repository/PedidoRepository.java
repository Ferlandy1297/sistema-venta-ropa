package gt.edu.miumg.svr.repository;

import gt.edu.miumg.svr.model.Pedido;
import gt.edu.miumg.svr.model.enums.TipoEntrega;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    @Query("select p from Pedido p where p.repartidor.username = :username and p.tipoEntrega = :tipoEntrega")
    List<Pedido> findByRepartidorUsernameAndTipo(@Param("username") String username, @Param("tipoEntrega") TipoEntrega tipoEntrega);

    @Query(value = "SELECT COALESCE(SUM(efectivo_monto),0) FROM pedidos WHERE efectivo_cobrado = true AND DATE(efectivo_cobrado_at) = :fecha", nativeQuery = true)
    BigDecimal sumEfectivoCobradoByFecha(@Param("fecha") LocalDate fecha);
}
