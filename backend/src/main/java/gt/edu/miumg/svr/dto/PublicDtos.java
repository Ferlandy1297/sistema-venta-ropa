package gt.edu.miumg.svr.dto;

import java.math.BigDecimal;

public class PublicDtos {
    public static class PublicDropDto {
        public Long id;
        public String nombre;
        public String estado;
        public String grupoCodigo;
        public String grupoNombre;
    }

    public static class PublicPrendaDto {
        public Long id;
        public String titulo;
        public BigDecimal precio;
        public String firstFotoUrl;
    }
}

