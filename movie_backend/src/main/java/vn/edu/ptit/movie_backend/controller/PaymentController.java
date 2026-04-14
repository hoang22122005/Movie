package vn.edu.ptit.movie_backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.repository.UserRepository;
import vn.edu.ptit.movie_backend.service.VNPayService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final VNPayService vnPayService;
    private final UserRepository userRepository;

    @GetMapping("/create-vip-payment")
    public ResponseEntity<ApiResponse<String>> createVipPayment(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        String txnRef = "VIP_" + user.getUserId() + "_" + System.currentTimeMillis();
        String paymentUrl = vnPayService.createPaymentUrl(50000, "Đăng ký VIP cho " + user.getUsername(), txnRef);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo URL thanh toán thành công", paymentUrl));
    }

    @GetMapping("/vnpay-callback")
    public ResponseEntity<ApiResponse<String>> vnpayCallback(HttpServletRequest request) {
        int result = vnPayService.validateCallback(request);
        if (result == 1) {
            String txnRef = request.getParameter("vnp_TxnRef");
            if (txnRef != null && txnRef.startsWith("VIP_")) {
                String[] parts = txnRef.split("_");
                int userId = Integer.parseInt(parts[1]);
                User user = userRepository.findById(userId).orElseThrow();
                user.setVip(true);
                // Extend VIP for 30 days
                LocalDateTime currentExpiration = user.getVipExpiration();
                if (currentExpiration != null && currentExpiration.isAfter(LocalDateTime.now())) {
                    user.setVipExpiration(currentExpiration.plusDays(30));
                } else {
                    user.setVipExpiration(LocalDateTime.now().plusDays(30));
                }
                userRepository.save(user);
                return ResponseEntity.ok(new ApiResponse<>(true, "Thanh toán thành công, bạn đã là VIP", null));
            }
        }
        return ResponseEntity.status(400).body(new ApiResponse<>(false, "Thanh toán thất bại hoặc không hợp lệ", null));
    }
}
