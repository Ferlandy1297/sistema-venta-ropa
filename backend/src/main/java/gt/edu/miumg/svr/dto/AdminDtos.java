package gt.edu.miumg.svr.dto;

import gt.edu.miumg.svr.model.enums.DropEstado;
import gt.edu.miumg.svr.model.enums.PrendaEstado;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class AdminDtos {
    public static class CreateDropRequest {
        @NotBlank
        public String grupoCodigo;
        @NotBlank
        public String nombre;
        @NotNull
        public DropEstado estado;
    }

    public static class UpdateDropEstadoRequest {
        @NotNull
        public DropEstado estado;
    }

    public static class CreatePrendaRequest {
        @NotBlank
        public String titulo;
        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        public BigDecimal precio;
        public List<@NotBlank String> fotos;
    }

    public static class UpdatePrendaEstadoRequest {
        @NotNull
        public PrendaEstado estado;
    }
}

