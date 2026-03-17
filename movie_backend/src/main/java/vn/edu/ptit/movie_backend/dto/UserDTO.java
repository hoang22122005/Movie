package vn.edu.ptit.movie_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Integer userId;
    private String username;
    private String email;
    private String role;
    private boolean status;
    private Integer age;
    private String gender;
    private String occupation;
    private String zipCode;

}
