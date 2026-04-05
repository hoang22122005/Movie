package vn.edu.ptit.movie_backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import vn.edu.ptit.movie_backend.security.JwtAuthenticationFilter;

import java.util.List;

// @Configuration: Đánh dấu class này là nơi định nghĩa các Bean (đối tượng cấu hình) cho Spring Boot
@Configuration
// @EnableWebSecurity: Kích hoạt hệ thống bảo mật Web của Spring Security
@EnableWebSecurity
// @EnableMethodSecurity: Cho phép sử dụng các chú thích như @PreAuthorize trên
// các hàm trong Controller để phân quyền
@EnableMethodSecurity
// @RequiredArgsConstructor: Tự động tạo Constructor cho các biến 'final' (ở đây
// là nạp JwtAuthenticationFilter)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    // SecurityFilterChain: Trái tim của cấu hình, nơi định nghĩa các quy định ra
    // vào cổng API
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Kích hoạt cấu hình CORS đã định nghĩa bên dưới
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Tắt CSRF (Cross-Site Request Forgery) vì chúng ta dùng JWT (stateless), không
                // dùng Session/Cookie
                .csrf(csrf -> csrf.disable())
                // Cấu hình Session: Luôn ở chế độ STATELESS (không lưu trạng thái) vì JWT mang
                // theo mọi thông tin trong nó rồi
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Quy định quyền truy cập cho từng đường dẫn (Request)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers("/api/rating").hasAnyRole("USER", "ADMIN")

                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/movies/**", "/api/genres/**").permitAll()
                        .anyRequest().authenticated())

                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(401);
                            response.getWriter().write(
                                    "{ \"success\": false, \"message\": \"Bạn cần đăng nhập để thực hiện hành động này\", \"data\": null }");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(403);
                            response.getWriter().write(
                                    "{ \"success\": false, \"message\": \"Hành động này bị chặn: Bạn không có quyền truy cập\", \"data\": null }");
                        }))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // Trả về đối tượng cấu hình hoàn chỉnh cho Spring Security
        return http.build();
    }

    // AuthenticationManager: Bean trung tâm quản lý toàn bộ quá trình xác thực
    // (ID/Pass)
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        // Lấy bộ quản lý mặc định của Spring
        return config.getAuthenticationManager();
    }

    // PasswordEncoder: Bean quy định thuật toán mã hóa mật khẩu trong dự án
    @Bean
    public PasswordEncoder passwordEncoder() {
        // Sử dụng thuật toán BCrypt (Băm an toàn nhất hiện nay, tự động sinh muối -
        // salt)
        return new BCryptPasswordEncoder();
    }

    // Cấu hình CORS chi tiết tại đây
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Cho phép các nguồn (Origin) cụ thể gọi API (React 3000, Vite 5173, và LAN IP)
        configuration.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://172.20.10.4:5173",
                "http://172.17.43.4:5173"));
        // Cho phép các phương thức HTTP
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Cho phép các Header quan trọng (đặc biệt là Authorization cho JWT)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Cache-Control"));
        // Cho phép gửi kèm Credentials (như Cookie nếu cần)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Áp dụng cấu hình này cho tất cả các đường dẫn API
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
