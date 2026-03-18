package vn.edu.ptit.movie_backend.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import vn.edu.ptit.movie_backend.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    //valid ở not blank
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return ResponseEntity.badRequest().body(new ApiResponse<>(false, message, null));
    }
    //lỗi quyền kh được phép ở phân quyền
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(403)
                .body(new ApiResponse<>(false, "Bạn không có quyền thực hiện hành động này", null));
    }
    //lỗi ném mesage khi dùng throw
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntime(RuntimeException ex) {
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, ex.getMessage(), null));
    }

    //bắt tất cả loại lỗi
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAny(Exception ex) {
        return ResponseEntity.internalServerError()
                .body(new ApiResponse<>(false, "Hệ thống xảy ra lỗi: " + ex.getMessage(), null));
    }
}
