package gt.edu.miumg.svr.model;

import gt.edu.miumg.svr.model.enums.EstadoPago;
import gt.edu.miumg.svr.model.enums.EstadoPedido;
import gt.edu.miumg.svr.model.enums.MetodoPago;
import gt.edu.miumg.svr.model.enums.TipoEntrega;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "pedidos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "folio", nullable = false, unique = true, insertable = false, updatable = false)
    private String folio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "grupo_id")
    private Grupo grupo;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrega", nullable = false)
    private TipoEntrega tipoEntrega;

    @Column(name = "zona")
    private String zona;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "referencia")
    private String referencia;

    @Column(name = "total", nullable = false)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false)
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pago", nullable = false)
    private EstadoPago estadoPago;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pedido", nullable = false)
    private EstadoPedido estadoPedido = EstadoPedido.CONFIRMADO;

    @Column(name = "bolsas_total", nullable = false)
    private Integer bolsasTotal = 1;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @ManyToOne
    @JoinColumn(name = "repartidor_id")
    private Usuario repartidor;

    @Column(name = "efectivo_cobrado", nullable = false)
    private Boolean efectivoCobrado = Boolean.FALSE;

    @Column(name = "efectivo_monto")
    private java.math.BigDecimal efectivoMonto;

    @ManyToOne
    @JoinColumn(name = "efectivo_cobrado_por")
    private Usuario efectivoCobradoPor;

    @Column(name = "efectivo_cobrado_at")
    private Instant efectivoCobradoAt;

    @Column(name = "incidencia_tipo")
    private String incidenciaTipo;

    @Column(name = "incidencia_nota")
    private String incidenciaNota;

    @Column(name = "preparado_at")
    private Instant preparadoAt;

    @Column(name = "en_ruta_at")
    private Instant enRutaAt;

    @Column(name = "entregado_at")
    private Instant entregadoAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFolio() { return folio; }
    public void setFolio(String folio) { this.folio = folio; }
    public Grupo getGrupo() { return grupo; }
    public void setGrupo(Grupo grupo) { this.grupo = grupo; }
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    public TipoEntrega getTipoEntrega() { return tipoEntrega; }
    public void setTipoEntrega(TipoEntrega tipoEntrega) { this.tipoEntrega = tipoEntrega; }
    public String getZona() { return zona; }
    public void setZona(String zona) { this.zona = zona; }
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }
    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }
    public MetodoPago getMetodoPago() { return metodoPago; }
    public void setMetodoPago(MetodoPago metodoPago) { this.metodoPago = metodoPago; }
    public EstadoPago getEstadoPago() { return estadoPago; }
    public void setEstadoPago(EstadoPago estadoPago) { this.estadoPago = estadoPago; }
    public EstadoPedido getEstadoPedido() { return estadoPedido; }
    public void setEstadoPedido(EstadoPedido estadoPedido) { this.estadoPedido = estadoPedido; }
    public Integer getBolsasTotal() { return bolsasTotal; }
    public void setBolsasTotal(Integer bolsasTotal) { this.bolsasTotal = bolsasTotal; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public Usuario getRepartidor() { return repartidor; }
    public void setRepartidor(Usuario repartidor) { this.repartidor = repartidor; }
    public Boolean getEfectivoCobrado() { return efectivoCobrado; }
    public void setEfectivoCobrado(Boolean efectivoCobrado) { this.efectivoCobrado = efectivoCobrado; }
    public java.math.BigDecimal getEfectivoMonto() { return efectivoMonto; }
    public void setEfectivoMonto(java.math.BigDecimal efectivoMonto) { this.efectivoMonto = efectivoMonto; }
    public Usuario getEfectivoCobradoPor() { return efectivoCobradoPor; }
    public void setEfectivoCobradoPor(Usuario efectivoCobradoPor) { this.efectivoCobradoPor = efectivoCobradoPor; }
    public Instant getEfectivoCobradoAt() { return efectivoCobradoAt; }
    public void setEfectivoCobradoAt(Instant efectivoCobradoAt) { this.efectivoCobradoAt = efectivoCobradoAt; }
    public String getIncidenciaTipo() { return incidenciaTipo; }
    public void setIncidenciaTipo(String incidenciaTipo) { this.incidenciaTipo = incidenciaTipo; }
    public String getIncidenciaNota() { return incidenciaNota; }
    public void setIncidenciaNota(String incidenciaNota) { this.incidenciaNota = incidenciaNota; }
    public Instant getPreparadoAt() { return preparadoAt; }
    public void setPreparadoAt(Instant preparadoAt) { this.preparadoAt = preparadoAt; }
    public Instant getEnRutaAt() { return enRutaAt; }
    public void setEnRutaAt(Instant enRutaAt) { this.enRutaAt = enRutaAt; }
    public Instant getEntregadoAt() { return entregadoAt; }
    public void setEntregadoAt(Instant entregadoAt) { this.entregadoAt = entregadoAt; }

    @PrePersist
    public void prePersist() {
        Instant now = Instant.now();
        if (this.createdAt == null) this.createdAt = now;
        if (this.updatedAt == null) this.updatedAt = now;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }
}
