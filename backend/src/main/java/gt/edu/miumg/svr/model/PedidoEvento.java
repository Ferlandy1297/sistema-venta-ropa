package gt.edu.miumg.svr.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pedido_eventos")
public class PedidoEvento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @Column(name = "tipo_evento", nullable = false)
    private String tipoEvento;

    @Column(name = "detalle")
    private String detalle;

    @ManyToOne
    @JoinColumn(name = "creado_por")
    private Usuario creadoPor;

    @Column(name = "creado_at", nullable = false)
    private Instant creadoAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public String getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(String tipoEvento) { this.tipoEvento = tipoEvento; }
    public String getDetalle() { return detalle; }
    public void setDetalle(String detalle) { this.detalle = detalle; }
    public Usuario getCreadoPor() { return creadoPor; }
    public void setCreadoPor(Usuario creadoPor) { this.creadoPor = creadoPor; }
    public Instant getCreadoAt() { return creadoAt; }
    public void setCreadoAt(Instant creadoAt) { this.creadoAt = creadoAt; }
}

