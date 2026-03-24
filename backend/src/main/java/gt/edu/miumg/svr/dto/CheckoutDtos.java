package gt.edu.miumg.svr.dto;

import gt.edu.miumg.svr.model.enums.MetodoPago;
import gt.edu.miumg.svr.model.enums.TipoEntrega;
import jakarta.validation.constraints.*;
import java.util.List;

public class CheckoutDtos {
    public static class CheckoutRequest {
        @NotBlank
        public String grupoCodigo;
        @NotNull
        public TipoEntrega tipoEntrega;
        @NotBlank
        public String clienteNombre;
        @NotBlank
        public String telefono;
        public String zona;
        public String direccion;
        public String referencia;
        @NotNull
        public MetodoPago metodoPago;
        public Integer bolsasTotal;
        @NotNull
        @Size(min = 1)
        public List<Long> prendaIds;
    }

    public static class CheckoutResponse {
        public String folio;
        public Long pedidoId;
        public java.math.BigDecimal total;
        public Integer bolsasTotal;
        public String estadoPedido;
        public String estadoPago;
    }
}

