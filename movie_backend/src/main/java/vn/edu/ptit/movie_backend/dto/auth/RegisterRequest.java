package vn.edu.ptit.movie_backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String username;


    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Độ dài mật khẩu không đủ")
    private String password;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Email
    private String email;
}
