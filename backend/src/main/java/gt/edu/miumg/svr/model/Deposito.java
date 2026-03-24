package gt.edu.miumg.svr.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "depositos")
public class Deposito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(name = "monto", nullable = false)
    private BigDecimal monto;

    @Column(name = "referencia", nullable = false)
    private String referencia;

    @Column(name = "fecha_deposito", nullable = false)
    private Instant fechaDeposito;

    @Column(name = "verificado", nullable = false)
    private Boolean verificado = Boolean.FALSE;

    @Column(name = "nota")
    private String nota;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public BigDecimal getMonto() { return monto; }
    public void setMonto(BigDecimal monto) { this.monto = monto; }
    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }
    public Instant getFechaDeposito() { return fechaDeposito; }
    public void setFechaDeposito(Instant fechaDeposito) { this.fechaDeposito = fechaDeposito; }
    public Boolean getVerificado() { return verificado; }
    public void setVerificado(Boolean verificado) { this.verificado = verificado; }
    public String getNota() { return nota; }
    public void setNota(String nota) { this.nota = nota; }
}

