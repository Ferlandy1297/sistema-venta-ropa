package gt.edu.miumg.svr.model;

import jakarta.persistence.*;

@Entity
@Table(name = "bolsas")
public class Bolsa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "pedido_id")
    private Pedido pedido;

    @Column(name = "numero", nullable = false)
    private Integer numero;

    @Column(name = "entregada", nullable = false)
    private Boolean entregada = Boolean.FALSE;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    public Integer getNumero() { return numero; }
    public void setNumero(Integer numero) { this.numero = numero; }
    public Boolean getEntregada() { return entregada; }
    public void setEntregada(Boolean entregada) { this.entregada = entregada; }
}

