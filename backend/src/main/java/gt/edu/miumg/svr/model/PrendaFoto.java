package gt.edu.miumg.svr.model;

import jakarta.persistence.*;

@Entity
@Table(name = "prendas_fotos")
public class PrendaFoto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "prenda_id")
    private Prenda prenda;

    @Column(name = "url", nullable = false)
    private String url;

    @Column(name = "orden", nullable = false)
    private Integer orden = 1;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Prenda getPrenda() { return prenda; }
    public void setPrenda(Prenda prenda) { this.prenda = prenda; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }
}

