package vn.edu.ptit.movie_backend.dto.auth;

import lombok.Data;

@Data
public class GoogleLoginRequest {
    private String idToken;
}
