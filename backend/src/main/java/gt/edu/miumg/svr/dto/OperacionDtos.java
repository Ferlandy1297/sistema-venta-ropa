package gt.edu.miumg.svr.dto;

import gt.edu.miumg.svr.model.enums.EstadoPago;
import gt.edu.miumg.svr.model.enums.EstadoPedido;
import gt.edu.miumg.svr.model.enums.TipoEntrega;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class OperacionDtos {

    public static class AdminPedidoItem {
        public Long pedidoId;
        public String folio;
        public String grupoCodigo;
        public String clienteNombre;
        public String telefono;
        public String tipoEntrega;
        public BigDecimal total;
        public String metodoPago;
        public String estadoPago;
        public String estadoPedido;
        public Integer bolsasTotal;
        public String repartidorUsername;
    }

    public static class UpdateEstadoRequest {
        @NotNull
        public EstadoPedido estadoPedido;
        public String incidenciaTipo;
        public String incidenciaNota;
    }

    public static class AsignarRepartidorRequest {
        @NotBlank
        public String repartidorUsername;
    }

    public static class AdminPagoRequest {
        @NotNull
        public EstadoPago estadoPago;
        public String nota;
    }

    public static class RepartidorEntregaRequest {
        public boolean efectivoCobrado;
        @DecimalMin(value = "0.0", inclusive = true)
        public BigDecimal efectivoMonto;
    }

    public static class SantiagoRecogerRequest {
        public boolean efectivoCobrado;
        @DecimalMin(value = "0.0", inclusive = true)
        public BigDecimal efectivoMonto;
    }

    public static class DepositoCreateRequest {
        @NotNull
        @DecimalMin(value = "0.01", inclusive = true)
        public BigDecimal monto;
        @NotBlank
        public String referencia;
    }

    public static class DepositoVerificarRequest {
        @NotNull
        public Boolean verificado;
        public String nota;
    }
}

