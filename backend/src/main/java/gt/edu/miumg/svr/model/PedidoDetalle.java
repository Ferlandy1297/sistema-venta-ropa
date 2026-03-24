package gt.edu.miumg.svr.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pedido_detalle")
public class PedidoDetalle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prenda_id")
    private Prenda prenda;

    @Column(name = "precio", nullable = false)
    private BigDecimal precio;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public Prenda getPrenda() { return prenda; }
    public void setPrenda(Prenda prenda) { this.prenda = prenda; }
    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }
}

