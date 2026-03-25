package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.ChangePasswordRequest;
import vn.edu.ptit.movie_backend.dto.UserDTO;
import vn.edu.ptit.movie_backend.dto.auth.RegisterRequest;
import vn.edu.ptit.movie_backend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class UserController {

    private final UserService userService;

    @PostMapping("/auth/register")
    public ResponseEntity<ApiResponse<UserDTO>> register(@RequestBody @Valid RegisterRequest dto) {
        UserDTO result = userService.createUser(dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đăng ký tài khoản thành công", result));
    }

    @GetMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserDTO>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        vn.edu.ptit.movie_backend.models.User user = (vn.edu.ptit.movie_backend.models.User) userDetails;
        UserDTO result = userService.getUserById(user.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin profile thành công", result));
    }

    @PutMapping("/users/profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UserDTO dto) {
        vn.edu.ptit.movie_backend.models.User user = (vn.edu.ptit.movie_backend.models.User) userDetails;
        UserDTO result = userService.updateProfile(user.getUserId(), dto);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật profile thành công", result));
    }

    @PutMapping("/users/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody ChangePasswordRequest request) {
        vn.edu.ptit.movie_backend.models.User user = (vn.edu.ptit.movie_backend.models.User) userDetails;
        userService.changePassword(user.getUserId(), request.getNewPassword(), request.getOldPassword());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đổi mật khẩu thành công " + user.getUserId(), null));
    }
}
