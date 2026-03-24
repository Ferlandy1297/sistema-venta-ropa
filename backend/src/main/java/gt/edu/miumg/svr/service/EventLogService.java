package gt.edu.miumg.svr.service;

import gt.edu.miumg.svr.model.Pedido;
import gt.edu.miumg.svr.model.PedidoEvento;
import gt.edu.miumg.svr.model.Usuario;
import gt.edu.miumg.svr.repository.PedidoEventoRepository;
import gt.edu.miumg.svr.repository.UsuarioRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class EventLogService {
    private final PedidoEventoRepository pedidoEventoRepository;
    private final UsuarioRepository usuarioRepository;

    public EventLogService(PedidoEventoRepository pedidoEventoRepository, UsuarioRepository usuarioRepository) {
        this.pedidoEventoRepository = pedidoEventoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public void log(Pedido pedido, String tipo, String detalle) {
        PedidoEvento ev = new PedidoEvento();
        ev.setPedido(pedido);
        ev.setTipoEvento(tipo);
        ev.setDetalle(detalle);
        ev.setCreadoAt(Instant.now());
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            usuarioRepository.findByUsernameAndActivoTrue(auth.getName()).ifPresent(ev::setCreadoPor);
        }
        pedidoEventoRepository.save(ev);
    }
}

