package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
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

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {

            //Tạo ra yêu cầu xác thực"(UsernamePasswordAuthenticationToken) chứa Username và Password
            //sẽ gọi đến CustomUserDetailsService.java để xác thực nếu đúng mới cấp token
            // để
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            // 2. Tạo Token
            String jwt = jwtUtils.generateToken(authentication.getName());

            // 3. Lấy thông tin quyền (Role) của User
            String role = authentication.getAuthorities().iterator().next().getAuthority();
            // 4. Trả về JwtResponse chuyên dụng
            JwtResponse response = new JwtResponse(jwt, authentication.getName(), role);

            return ResponseEntity.ok(new ApiResponse<>(true, "Đăng nhập thành công", response));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Tài khoản hoặc mật khẩu không chính xác", null));
        }
    }
}
