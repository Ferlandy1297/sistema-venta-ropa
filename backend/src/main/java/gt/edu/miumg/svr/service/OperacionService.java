package gt.edu.miumg.svr.service;

import gt.edu.miumg.svr.config.Roles;
import gt.edu.miumg.svr.dto.OperacionDtos;
import gt.edu.miumg.svr.model.*;
import gt.edu.miumg.svr.model.enums.*;
import gt.edu.miumg.svr.repository.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class OperacionService {
    private final PedidoRepository pedidoRepository;
    private final BolsaRepository bolsaRepository;
    private final UsuarioRepository usuarioRepository;
    private final DepositoRepository depositoRepository;
    private final GrupoRepository grupoRepository;
    private final EventLogService eventLogService;

    @PersistenceContext
    private EntityManager em;

    public OperacionService(PedidoRepository pedidoRepository, BolsaRepository bolsaRepository, UsuarioRepository usuarioRepository, DepositoRepository depositoRepository, GrupoRepository grupoRepository, EventLogService eventLogService) {
        this.pedidoRepository = pedidoRepository;
        this.bolsaRepository = bolsaRepository;
        this.usuarioRepository = usuarioRepository;
        this.depositoRepository = depositoRepository;
        this.grupoRepository = grupoRepository;
        this.eventLogService = eventLogService;
    }

    public List<OperacionDtos.AdminPedidoItem> adminListPedidos(Optional<LocalDate> fechaOpt, Optional<String> grupoCodigo, Optional<TipoEntrega> tipoEntrega, Optional<EstadoPedido> estadoPedido, Optional<EstadoPago> estadoPago) {
        LocalDate fecha = fechaOpt.orElse(LocalDate.now());
        StringBuilder jpql = new StringBuilder("select p from Pedido p join fetch p.grupo g join fetch p.cliente c left join p.repartidor r where function('DATE', p.createdAt) = :fecha");
        Map<String, Object> params = new HashMap<>();
        params.put("fecha", fecha);
        grupoCodigo.ifPresent(gc -> { jpql.append(" and g.codigo = :gc"); params.put("gc", gc); });
        tipoEntrega.ifPresent(te -> { jpql.append(" and p.tipoEntrega = :te"); params.put("te", te); });
        estadoPedido.ifPresent(ep -> { jpql.append(" and p.estadoPedido = :ep"); params.put("ep", ep); });
        estadoPago.ifPresent(ePg -> { jpql.append(" and p.estadoPago = :ePg"); params.put("ePg", ePg); });
        jpql.append(" order by p.createdAt desc");
        TypedQuery<Pedido> q = em.createQuery(jpql.toString(), Pedido.class);
        params.forEach(q::setParameter);
        return q.getResultList().stream().map(p -> {
            OperacionDtos.AdminPedidoItem d = new OperacionDtos.AdminPedidoItem();
            d.pedidoId = p.getId();
            d.folio = p.getFolio();
            d.grupoCodigo = p.getGrupo().getCodigo();
            d.clienteNombre = p.getCliente().getNombre();
            d.telefono = p.getCliente().getTelefono();
            d.tipoEntrega = p.getTipoEntrega().name();
            d.total = p.getTotal();
            d.metodoPago = p.getMetodoPago().name();
            d.estadoPago = p.getEstadoPago().name();
            d.estadoPedido = p.getEstadoPedido().name();
            d.bolsasTotal = p.getBolsasTotal();
            d.repartidorUsername = p.getRepartidor() != null ? p.getRepartidor().getUsername() : null;
            return d;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Pedido adminUpdateEstado(Long pedidoId, EstadoPedido nuevo, String incidenciaTipo, String incidenciaNota) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (nuevo == EstadoPedido.INCIDENCIA) {
            if (isBlank(incidenciaTipo) || isBlank(incidenciaNota)) {
                throw new IllegalArgumentException("incidenciaTipo y incidenciaNota son requeridos para INCIDENCIA");
            }
            p.setIncidenciaTipo(incidenciaTipo);
            p.setIncidenciaNota(incidenciaNota);
        }
        if (p.getTipoEntrega() == TipoEntrega.SANTIAGO_PICKUP && nuevo == EstadoPedido.ENTREGADO) {
            // require all bolsas delivered
            long total = p.getBolsasTotal() == null ? 0 : p.getBolsasTotal();
            long delivered = bolsaRepository.findAll().stream().filter(b -> b.getPedido().getId().equals(p.getId()) && Boolean.TRUE.equals(b.getEntregada())).count();
            if (total > 0 && delivered < total) {
                throw new IllegalArgumentException("Todas las bolsas deben estar entregadas antes de marcar ENTREGADO");
            }
            p.setEntregadoAt(Instant.now());
        }
        p.setEstadoPedido(nuevo);
        Pedido saved = pedidoRepository.save(p);
        eventLogService.log(saved, "ESTADO_UPDATE", "Estado a " + nuevo.name());
        return saved;
    }

    @Transactional
    public Pedido adminAsignarRepartidor(Long pedidoId, String repartidorUsername) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (p.getTipoEntrega() != TipoEntrega.HUEHUE_DELIVERY) {
            throw new IllegalArgumentException("Solo aplica para HUEHUE_DELIVERY");
        }
        Usuario u = usuarioRepository.findByUsernameAndActivoTrue(repartidorUsername).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado o inactivo"));
        if (u.getRol() != Roles.REPARTIDOR_HUEHUE) {
            throw new IllegalArgumentException("Usuario no es REPARTIDOR_HUEHUE");
        }
        p.setRepartidor(u);
        Pedido saved = pedidoRepository.save(p);
        eventLogService.log(saved, "ASIGNAR_REPARTIDOR", "Asignado a " + u.getUsername());
        return saved;
    }

    public List<Bolsa> adminListBolsas(Long pedidoId) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        return bolsaRepository.findAll().stream().filter(b -> b.getPedido().getId().equals(p.getId())).sorted(Comparator.comparing(Bolsa::getNumero)).collect(Collectors.toList());
    }

    @Transactional
    public Pedido adminPago(Long pedidoId, EstadoPago estadoPago, String nota) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        p.setEstadoPago(estadoPago);
        Pedido saved = pedidoRepository.save(p);
        eventLogService.log(saved, "PAGO_UPDATE", "Pago: " + estadoPago.name() + (nota != null ? (" - " + nota) : ""));
        return saved;
    }

    public List<Pedido> repartidorMisPedidos(String username) {
        return pedidoRepository.findByRepartidorUsernameAndTipo(username, TipoEntrega.HUEHUE_DELIVERY);
    }

    @Transactional
    public Pedido repartidorEnRuta(Long pedidoId, String username) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (p.getRepartidor() == null || !p.getRepartidor().getUsername().equals(username)) {
            throw new IllegalArgumentException("No asignado a este repartidor");
        }
        p.setEstadoPedido(EstadoPedido.EN_RUTA);
        p.setEnRutaAt(Instant.now());
        Pedido saved = pedidoRepository.save(p);
        eventLogService.log(saved, "EN_RUTA", "Pedido en ruta");
        return saved;
    }

    @Transactional
    public Pedido repartidorEntregar(Long pedidoId, String username, boolean efectivoCobrado, java.math.BigDecimal efectivoMonto) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (p.getRepartidor() == null || !p.getRepartidor().getUsername().equals(username)) {
            throw new IllegalArgumentException("No asignado a este repartidor");
        }
        p.setEstadoPedido(EstadoPedido.ENTREGADO);
        p.setEntregadoAt(Instant.now());
        // marcar todas las bolsas entregadas
        List<Bolsa> bolsas = bolsaRepository.findAll().stream().filter(b -> b.getPedido().getId().equals(p.getId())).collect(Collectors.toList());
        Usuario current = usuarioRepository.findByUsernameAndActivoTrue(username).orElse(null);
        for (Bolsa b : bolsas) {
            b.setEntregada(Boolean.TRUE);
            b.setEntregadaAt(Instant.now());
            b.setEntregadaPor(current);
        }
        bolsaRepository.saveAll(bolsas);
        if (efectivoCobrado) {
            p.setEfectivoCobrado(Boolean.TRUE);
            p.setEfectivoMonto(efectivoMonto);
            p.setEfectivoCobradoPor(current);
            p.setEfectivoCobradoAt(Instant.now());
            p.setEstadoPago(EstadoPago.PAGADO);
            eventLogService.log(p, "EFECTIVO_COBRADO", "Monto: " + efectivoMonto);
        }
        Pedido saved = pedidoRepository.save(p);
        eventLogService.log(saved, "ENTREGADO", "Pedido entregado por " + username);
        return saved;
    }

    public List<Pedido> santiagoListPedidos(Optional<EstadoPedido> estado) {
        String jpql = "select p from Pedido p where p.tipoEntrega = :te" + (estado.isPresent() ? " and p.estadoPedido = :ep" : "") + " order by p.createdAt desc";
        TypedQuery<Pedido> q = em.createQuery(jpql, Pedido.class);
        q.setParameter("te", TipoEntrega.SANTIAGO_PICKUP);
        estado.ifPresent(e -> q.setParameter("ep", e));
        return q.getResultList();
    }

    public List<Bolsa> santiagoListBolsas(Long pedidoId) {
        return adminListBolsas(pedidoId);
    }

    @Transactional
    public Bolsa santiagoEntregarBolsa(Long pedidoId, Integer numero, String username) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        Optional<Bolsa> bolsaOpt = bolsaRepository.findAll().stream().filter(b -> b.getPedido().getId().equals(p.getId()) && b.getNumero().equals(numero)).findFirst();
        Bolsa b = bolsaOpt.orElseThrow(() -> new IllegalArgumentException("Bolsa no encontrada"));
        Usuario u = usuarioRepository.findByUsernameAndActivoTrue(username).orElse(null);
        b.setEntregada(Boolean.TRUE);
        b.setEntregadaAt(Instant.now());
        b.setEntregadaPor(u);
        Bolsa saved = bolsaRepository.save(b);
        eventLogService.log(p, "BOLSA_ENTREGADA", "Bolsa #" + numero);
        return saved;
    }

    @Transactional
    public Pedido santiagoRecoger(Long pedidoId, boolean efectivoCobrado, java.math.BigDecimal efectivoMonto, String username) {
        Pedido p = pedidoRepository.findById(pedidoId).orElseThrow(() -> new IllegalArgumentException("Pedido no encontrado"));
        if (p.getTipoEntrega() != TipoEntrega.SANTIAGO_PICKUP) {
            throw new IllegalArgumentException("Solo aplica para SANTIAGO_PICKUP");
        }
        long total = p.getBolsasTotal() == null ? 0 : p.getBolsasTotal();
        long delivered = bolsaRepository.findAll().stream().filter(b -> b.getPedido().getId().equals(p.getId()) && Boolean.TRUE.equals(b.getEntregada())).count();
        if (total > 0 && delivered < total) {
            throw new IllegalArgumentException("Todas las bolsas deben estar entregadas");
        }
        p.setEstadoPedido(EstadoPedido.ENTREGADO);
        p.setEntregadoAt(Instant.now());
        if (efectivoCobrado) {
            Usuario u = usuarioRepository.findByUsernameAndActivoTrue(username).orElse(null);
            p.setEfectivoCobrado(Boolean.TRUE);
            p.setEfectivoMonto(efectivoMonto);
            p.setEfectivoCobradoPor(u);
            p.setEfectivoCobradoAt(Instant.now());
            p.setEstadoPago(EstadoPago.PAGADO);
            eventLogService.log(p, "EFECTIVO_COBRADO", "Monto: " + efectivoMonto);
        }
        Pedido saved = pedidoRepository.save(p);
        eventLogService.log(saved, "PICKUP_ENTREGADO", "Recogido en Santiago");
        return saved;
    }

    @Transactional
    public Deposito crearDeposito(java.math.BigDecimal monto, String referencia, String username) {
        Usuario u = usuarioRepository.findByUsernameAndActivoTrue(username).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        Deposito d = new Deposito();
        d.setUsuario(u);
        d.setMonto(monto);
        d.setReferencia(referencia);
        d.setFechaDeposito(Instant.now());
        d.setVerificado(Boolean.FALSE);
        return depositoRepository.save(d);
    }

    @Transactional
    public Deposito adminVerificarDeposito(Long id, boolean verificado, String nota) {
        Deposito d = depositoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Depósito no encontrado"));
        d.setVerificado(verificado);
        d.setNota(nota);
        return depositoRepository.save(d);
    }

    public Map<String, java.math.BigDecimal> adminConciliacion(LocalDate fecha) {
        java.math.BigDecimal totalEfectivo = pedidoRepository.sumEfectivoCobradoByFecha(fecha);
        java.math.BigDecimal totalDepositado = depositoRepository.sumByFecha(fecha);
        java.math.BigDecimal pendiente = totalEfectivo.subtract(totalDepositado);
        Map<String, java.math.BigDecimal> res = new HashMap<>();
        res.put("totalEfectivoCobrado", totalEfectivo);
        res.put("totalDepositado", totalDepositado);
        res.put("totalPendienteDeposito", pendiente);
        return res;
    }

    private boolean isBlank(String s) { return s == null || s.trim().isEmpty(); }
}

