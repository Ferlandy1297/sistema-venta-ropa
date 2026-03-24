package gt.edu.miumg.svr.service;

import gt.edu.miumg.svr.advice.ConflictException;
import gt.edu.miumg.svr.dto.CheckoutDtos;
import gt.edu.miumg.svr.model.*;
import gt.edu.miumg.svr.model.enums.*;
import gt.edu.miumg.svr.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CheckoutService {

    private final GrupoRepository grupoRepository;
    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final PedidoDetalleRepository pedidoDetalleRepository;
    private final BolsaRepository bolsaRepository;
    private final PrendaRepository prendaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public CheckoutService(GrupoRepository grupoRepository, ClienteRepository clienteRepository, PedidoRepository pedidoRepository, PedidoDetalleRepository pedidoDetalleRepository, BolsaRepository bolsaRepository, PrendaRepository prendaRepository) {
        this.grupoRepository = grupoRepository;
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
        this.pedidoDetalleRepository = pedidoDetalleRepository;
        this.bolsaRepository = bolsaRepository;
        this.prendaRepository = prendaRepository;
    }

    @Transactional
    public CheckoutDtos.CheckoutResponse checkout(CheckoutDtos.CheckoutRequest req) {
        if (req.tipoEntrega == TipoEntrega.HUEHUE_DELIVERY) {
            if (isBlank(req.zona) || isBlank(req.direccion) || isBlank(req.referencia)) {
                throw new IllegalArgumentException("zona, direccion y referencia son requeridos para HUEHUE_DELIVERY");
            }
        }

        Grupo grupo = grupoRepository.findByCodigo(req.grupoCodigo).orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado"));

        Cliente cliente = clienteRepository.findByTelefono(req.telefono)
                .map(c -> {
                    c.setNombre(req.clienteNombre);
                    return c;
                })
                .orElseGet(() -> {
                    Cliente c = new Cliente();
                    c.setNombre(req.clienteNombre);
                    c.setTelefono(req.telefono);
                    return clienteRepository.save(c);
                });

        Pedido pedido = new Pedido();
        pedido.setGrupo(grupo);
        pedido.setCliente(cliente);
        pedido.setTipoEntrega(req.tipoEntrega);
        pedido.setZona(req.zona);
        pedido.setDireccion(req.direccion);
        pedido.setReferencia(req.referencia);
        pedido.setMetodoPago(req.metodoPago);
        pedido.setEstadoPedido(EstadoPedido.CONFIRMADO);
        pedido.setEstadoPago(req.metodoPago == MetodoPago.EFECTIVO ? EstadoPago.CONTRAENTREGA : EstadoPago.PENDIENTE);
        int bolsas = (req.bolsasTotal != null && req.bolsasTotal > 0) ? req.bolsasTotal : 1;
        pedido.setBolsasTotal(bolsas);
        pedido.setTotal(BigDecimal.ZERO);
        pedido = pedidoRepository.save(pedido);
        // Ensure DB trigger-generated folio is loaded
        pedidoRepository.flush();
        entityManager.refresh(pedido);

        BigDecimal total = BigDecimal.ZERO;
        for (Long prendaId : req.prendaIds) {
            Prenda prenda = prendaRepository.findById(prendaId).orElseThrow(() -> new IllegalArgumentException("Prenda no encontrada: " + prendaId));
            if (prenda.getEstado() != PrendaEstado.DISPONIBLE) {
                throw new ConflictException("La prenda ya no está disponible: " + prendaId);
            }
            PedidoDetalle det = new PedidoDetalle();
            det.setPedido(pedido);
            det.setPrenda(prenda);
            det.setPrecio(prenda.getPrecio());
            pedidoDetalleRepository.save(det);

            prenda.setEstado(PrendaEstado.VENDIDA);
            prendaRepository.save(prenda);
            total = total.add(prenda.getPrecio());
        }

        pedido.setTotal(total);
        pedido = pedidoRepository.save(pedido);

        for (int i = 1; i <= bolsas; i++) {
            Bolsa b = new Bolsa();
            b.setPedido(pedido);
            b.setNumero(i);
            b.setEntregada(Boolean.FALSE);
            bolsaRepository.save(b);
        }

        CheckoutDtos.CheckoutResponse res = new CheckoutDtos.CheckoutResponse();
        res.folio = pedido.getFolio();
        res.pedidoId = pedido.getId();
        res.total = pedido.getTotal();
        res.bolsasTotal = pedido.getBolsasTotal();
        res.estadoPedido = pedido.getEstadoPedido().name();
        res.estadoPago = pedido.getEstadoPago().name();
        return res;
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}
