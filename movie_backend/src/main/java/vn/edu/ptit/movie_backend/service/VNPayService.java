package vn.edu.ptit.movie_backend.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.edu.ptit.movie_backend.config.VNPayConfig;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {
    private final VNPayConfig vnPayConfig;

    public String createPaymentUrl(long amount, String orderInfo, String txnRef) {
        // DEBUG: in ra key đang sử dụng
        String rawSecret = vnPayConfig.getVnp_HashSecret();
        String trimmedSecret = rawSecret != null ? rawSecret.trim() : "NULL";
        log.info("=== VNPay DEBUG ===");
        log.info("TmnCode: [{}]", vnPayConfig.getVnp_TmnCode());
        log.info("HashSecret length: {}", trimmedSecret.length());
        log.info("HashSecret: [{}]", trimmedSecret);
        log.info("ReturnUrl: [{}]", vnPayConfig.getVnp_ReturnUrl());

        Map<String, String> vnp_Params = new TreeMap<>(); // TreeMap tự sort
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getVnp_TmnCode().trim());
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl().trim());
        vnp_Params.put("vnp_IpAddr", "127.0.0.1");

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", formatter.format(cld.getTime()));

        // Build hashData (RAW - không encode) và query (encode URL)
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        boolean first = true;
        for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if (fieldValue != null && !fieldValue.isEmpty()) {
                if (!first) {
                    hashData.append('&');
                    query.append('&');
                }
                // hashData dùng URLEncoder với US_ASCII (dấu cách → +), giống PHP urlencode
                hashData.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // query dùng UTF_8 và thay + thành %20 cho URL chuẩn
                query.append(URLEncoder.encode(fieldName, StandardCharsets.UTF_8).replace("+", "%20"))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8).replace("+", "%20"));
                first = false;
            }
        }

        log.info("HashData string: [{}]", hashData);
        String vnp_SecureHash = hmacSHA512(trimmedSecret, hashData.toString());
        log.info("Computed hash: [{}]", vnp_SecureHash);

        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        String finalUrl = vnPayConfig.getVnp_Url().trim() + "?" + query;
        log.info("Final URL: [{}]", finalUrl);
        return finalUrl;
    }

    public int validateCallback(HttpServletRequest request) {
        Map<String, String> fields = new HashMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                fields.put(fieldName, fieldValue);
            }
        }

        String vnp_SecureHash = request.getParameter("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        fields.remove("vnp_SecureHash");

        List<String> fieldNames = new ArrayList<>(fields.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        boolean first = true;
        for (String fieldName : fieldNames) {
            String fieldValue = fields.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                if (!first)
                    hashData.append('&');
                // VNPay sign callback bằng URLEncoder (PHP urlencode) - spaces → +
                hashData.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII))
                        .append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                first = false;
            }
        }

        log.info("=== VNPay CALLBACK DEBUG ===");
        log.info("Received hash: [{}]", vnp_SecureHash);
        log.info("Callback hashData: [{}]", hashData);
        String signValue = hmacSHA512(vnPayConfig.getVnp_HashSecret().trim(), hashData.toString());
        log.info("Computed sign: [{}]", signValue);
        log.info("Match: {}", signValue.equalsIgnoreCase(vnp_SecureHash));
        if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
            return "00".equals(request.getParameter("vnp_ResponseCode")) ? 1 : 0;
        }
        return -1;
    }

    private String hmacSHA512(final String key, final String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result)
                sb.append(String.format("%02x", b & 0xff));
            return sb.toString();
        } catch (Exception ex) {
            log.error("HMAC error", ex);
            return "";
        }
    }
}
