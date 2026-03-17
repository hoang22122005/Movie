package vn.edu.ptit.movie_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            //Trích xuất chuỗi JWT từ trong Header Authorization ra
            String jwt = getJwtFromRequest(request);

            //Nếu tìm thấy JWT và JWT đó là thật (validateToken = true)
            if (StringUtils.hasText(jwt) && jwtUtils.validateToken(jwt)) {
                //Đọc ruột của JWT để lấy tên Username
                String username = jwtUtils.getUserNameFromJwt(jwt);

                //Nhờ 'userDetailsService' tải lại đầy đủ thông tin User (Role, Entity)
                // từ DB
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                //Tạo một "Thẻ VIP" xác thực dựa trên thông tin vừa lấy được
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());

                //Đính kèm thông tin yêu cầu (IP, Device...) vào thẻ xác thực này
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                //Cất "Thẻ VIP" vào két sắt an ninh trung tâm (SecurityContextHolder)
                // Từ lúc này, Spring Security sẽ cho phép bạn đi qua các API bị khóa
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // Nếu có lỗi (Token lén lút sửa chẳng hạn), ghi Log lỗi ra Console
            logger.error("Không thể thiết lập xác thực người dùng trong Security Context", ex);
        }
        // Bước cuối: Luôn luôn gọi filterChain để request tiếp tục hành trình đến cửa tiếp theo ở đây là Controller
        filterChain.doFilter(request, response);
    }

    // Lấy JWT token từ HTTP request (header Authorization)
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
