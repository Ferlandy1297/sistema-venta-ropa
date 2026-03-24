package gt.edu.miumg.svr.controller;

import gt.edu.miumg.svr.config.Roles;
import gt.edu.miumg.svr.model.Usuario;
import gt.edu.miumg.svr.repository.UsuarioRepository;
import gt.edu.miumg.svr.security.JwtService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public static class LoginRequest {
        @NotBlank
        public String username;
        @NotBlank
        public String password;
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<Usuario> userOpt = usuarioRepository.findByUsernameAndActivoTrue(request.username);
        if (userOpt.isEmpty()) {
            return unauthorized("Invalid credentials");
        }
        Usuario user = userOpt.get();
        if (!passwordEncoder.matches(request.password, user.getPassword())) {
            return unauthorized("Invalid credentials");
        }
        String token = jwtService.generateToken(user.getUsername(), user.getRol());
        Map<String, Object> body = new HashMap<>();
        body.put("accessToken", token);
        body.put("tokenType", "Bearer");
        body.put("expiresInSeconds", jwtService.getExpirationSeconds());
        body.put("username", user.getUsername());
        body.put("rol", user.getRol().name());
        return ResponseEntity.ok(body);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> body = new HashMap<>();
        String username = authentication.getName();
        String rol = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .map(a -> a.substring("ROLE_".length()))
                .orElse("UNKNOWN");
        body.put("username", username);
        body.put("rol", rol);
        body.put("authenticated", true);
        return body;
    }

    private ResponseEntity<Map<String, Object>> unauthorized(String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", message);
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }
}

