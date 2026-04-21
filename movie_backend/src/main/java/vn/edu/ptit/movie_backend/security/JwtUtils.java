package vn.edu.ptit.movie_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {
    @Value("${jwt.secret}")
    private String salt;

    @Value("${jwt.expiration}")
    private long jwtEXPIRATION;

    // getSignKey: Chuyển chuỗi Salt thành mã dạng Key để thuật toán JWT có thể hiểu
    // được
    private Key getSignKey() {
        return Keys.hmacShaKeyFor(salt.getBytes());
    }

    // Tạo phiếu thông hành gồm mỗi chuỗi header.payload.signature được mã hoá
    // header tên thuật toán mã hoá ở đây là hs256 - encode Base64URL
    // payload là username,thời gian tạo,thời gian hết hạnở dưới kìa - encode
    // Base64URL
    // signature là HMAC_SHA256(header + payload + salt)
    // generateToken: Hàm "đúc" ra một chuỗi JWT khi đăng nhập thành công
    public String generateToken(String usename, Integer userId) {
        Date now = new Date(); // Thời gian hiện tại
        Date expiryDate = new Date(now.getTime() + jwtEXPIRATION); // Thời gian 7 ngày tới
        return Jwts.builder()
                .setSubject(usename) // Gắn tên username vào 'bụng' (payload) của Token
                .setIssuedAt(now) // Gắn ngày cấp phát
                .claim("userId", userId)
                .setExpiration(expiryDate) // Gắn ngày hết hạn
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // "Ký tên" bằng Salt + Thuật toán HS256
                .compact(); // Đóng gói thành chuỗi Dạng header.payload.signature
    }

    // nhận username từ token
    public String getUserNameFromJwt(String token) {
        // parserBuilder() đọc token
        Claims claims = Jwts.parserBuilder()
                // gán salt
                .setSigningKey(getSignKey())
                // hoàn thành máy đọc
                .build()
                // kiếm tra signature đúng chưa và hết hạn chưa
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Lấy ID người dùng từ Token
    public Integer getUserIdFromJwt(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("userId", Integer.class);
    }

    // validateToken: Kiểm tra xem thẻ VIP (Token) có hợp lệ không
    public boolean validateToken(String token) {
        try {
            // Thử đọc Token bằng Salt đã khai báo, nếu đọc được và không lỗi thì Token là
            // thật
            Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            throw new RuntimeException("Token hết hạn vui lòng đăng nhập lại");
        } catch (MalformedJwtException ex) {
            throw new RuntimeException("Token không đúng hoặc đã bị sửa");
        } catch (Exception ex) {
            throw new RuntimeException("Lỗi ở trong class token");
        }
    }

}
