package vn.edu.ptit.movie_backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.repository.UserRepository;
import vn.edu.ptit.movie_backend.service.VNPayService;

import java.io.IOException;
import java.time.LocalDateTime;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final VNPayService vnPayService;
    private final UserRepository userRepository;

    private static final String FRONTEND_URL = "http://localhost:5173";

    @GetMapping("/create-vip-payment")
    public ResponseEntity<ApiResponse<String>> createVipPayment(@AuthenticationPrincipal UserDetails userDetails) {
        User user = (User) userDetails;
        String txnRef = "VIP_" + user.getUserId() + "_" + System.currentTimeMillis();
        String paymentUrl = vnPayService.createPaymentUrl(50000, "Dang ky VIP - User " + user.getUserId(), txnRef);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo URL thanh toán thành công", paymentUrl));
    }

    /**
     * VNPay sẽ redirect browser THẲNG vào endpoint này sau khi thanh toán.
     * Backend validate xong thì redirect về Frontend để hiển thị kết quả.
     */
    @GetMapping("/vnpay-callback")
    public void vnpayCallback(HttpServletRequest request, HttpServletResponse response) throws IOException {
        log.info("=== VNPay Callback received ===");
        int result = vnPayService.validateCallback(request);
        log.info("Validation result: {}", result);

        if (result == 1) {
            String txnRef = request.getParameter("vnp_TxnRef");
            log.info("TxnRef: {}", txnRef);
            if (txnRef != null && txnRef.startsWith("VIP_")) {
                try {
                    String[] parts = txnRef.split("_");
                    int userId = Integer.parseInt(parts[1]);
                    User user = userRepository.findById(userId).orElseThrow();
                    user.setVip(true);
                    LocalDateTime currentExpiration = user.getVipExpiration();
                    if (currentExpiration != null && currentExpiration.isAfter(LocalDateTime.now())) {
                        user.setVipExpiration(currentExpiration.plusDays(30));
                    } else {
                        user.setVipExpiration(LocalDateTime.now().plusDays(30));
                    }
                    userRepository.save(user);
                    log.info("User {} upgraded to VIP successfully", userId);
                    // Redirect về frontend trang thành công
                    response.sendRedirect(FRONTEND_URL + "/payment-callback?status=success");
                    return;
                } catch (Exception e) {
                    log.error("Error upgrading user to VIP", e);
                }
            }
        }
        // Redirect về frontend trang thất bại
        String responseCode = request.getParameter("vnp_ResponseCode");
        response.sendRedirect(FRONTEND_URL + "/payment-callback?status=failed&code="
                + (responseCode != null ? responseCode : "unknown"));
    }
}
