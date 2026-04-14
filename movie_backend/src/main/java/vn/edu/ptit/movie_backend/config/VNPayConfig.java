package vn.edu.ptit.movie_backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Data
public class VNPayConfig {
    private String vnp_TmnCode;
    private String vnp_HashSecret;
    private String vnp_Url;
    private String vnp_ReturnUrl;
}
