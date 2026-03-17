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
import vn.edu.ptit.movie_backend.security.JwtAuthenticationFilter;

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
                // Tắt CSRF (Cross-Site Request Forgery) vì chúng ta dùng JWT (stateless), không
                // dùng Session/Cookie
                .csrf(csrf -> csrf.disable())
                // Cấu hình Session: Luôn ở chế độ STATELESS (không lưu trạng thái) vì JWT mang
                // theo mọi thông tin trong nó rồi
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // Quy định quyền truy cập cho từng đường dẫn (Request)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/movies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/movies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/movies/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/movies/**", "/api/genres/**").permitAll()

                        .requestMatchers("/api/watchlist/**").hasAnyRole("USER", "ADMIN")
                        // Tất cả các yêu cầu (Request) còn lại bắt buộc phải đăng nhập thành công mới
                        // được vào
                        .anyRequest().authenticated())

                // Thêm 'JwtAuthenticationFilter' của bạn đứng trước bộ lọc mặc định của Spring
                // Nó sẽ kiểm tra Token CƯỚC KHI Spring cố gắng xác thực người dùng
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
}
