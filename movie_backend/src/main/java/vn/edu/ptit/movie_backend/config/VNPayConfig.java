package vn.edu.ptit.movie_backend.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class VNPayConfig {
    @Value("${VNP_TMN_CODE}")
    private String vnp_TmnCode;

    @Value("${VNP_HASH_SECRET}")
    private String vnp_HashSecret;

    @Value("${VNP_URL}")
    private String vnp_Url;

    @Value("${VNP_RETURN_URL}")
    private String vnp_ReturnUrl;
}
