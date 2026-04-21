package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.JwtResponse;
import vn.edu.ptit.movie_backend.dto.auth.LoginRequest;
import vn.edu.ptit.movie_backend.security.JwtUtils;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final vn.edu.ptit.movie_backend.repository.UserRepository userRepository;

    @Value("${google.client-id}")
    private String googleClientId;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            vn.edu.ptit.movie_backend.models.User user = (vn.edu.ptit.movie_backend.models.User) authentication
                    .getPrincipal();
            String jwt = jwtUtils.generateToken(user.getUsername(), user.getUserId());
            String role = authentication.getAuthorities().iterator().next().getAuthority();
            JwtResponse response = new JwtResponse(jwt, authentication.getName(), role);
            return ResponseEntity.ok(new ApiResponse<>(true, "Đăng nhập thành công", response));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Tài khoản hoặc mật khẩu không chính xác", null));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Hệ thống xảy ra lỗi: " + e.getMessage(), null));
        }
    }

    @PostMapping("/google-login")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(
            @RequestBody vn.edu.ptit.movie_backend.dto.auth.GoogleLoginRequest request) {
        try {
            com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier verifier = new com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier.Builder(
                    new com.google.api.client.http.javanet.NetHttpTransport(),
                    new com.google.api.client.json.gson.GsonFactory())
                    .setAudience(java.util.Collections
                            .singletonList(googleClientId))
                    .build();

            com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken != null) {
                com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String pictureUrl = (String) payload.get("picture");

                vn.edu.ptit.movie_backend.models.User user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                    user = new vn.edu.ptit.movie_backend.models.User();
                    user.setEmail(email);
                    user.setUsername(email); // Use email as username for google login
                    user.setRole("USER");
                    user.setStatus(true);
                    user.setUrlAvt(pictureUrl);
                    userRepository.save(user);
                }

                String jwt = jwtUtils.generateToken(user.getUsername(), user.getUserId());
                JwtResponse response = new JwtResponse(jwt, user.getUsername(), "ROLE_" + user.getRole());
                return ResponseEntity.ok(new ApiResponse<>(true, "Đăng nhập bằng Google thành công", response));
            } else {
                return ResponseEntity.status(401).body(new ApiResponse<>(false, "Token Google không hợp lệ", null));
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(new ApiResponse<>(false, "Lỗi xác thực Google: " + e.getMessage(), null));
        }
    }
}
