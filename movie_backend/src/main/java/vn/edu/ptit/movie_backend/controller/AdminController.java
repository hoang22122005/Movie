package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.dto.UserDTO;
import vn.edu.ptit.movie_backend.dto.auth.RegisterRequest;
import vn.edu.ptit.movie_backend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;

    @GetMapping("/user")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getSearchUser(
            @RequestParam(required = false,value = "username") String username,
            @RequestParam(required = false,value = "email") String email,
            Pageable pageable
    ){
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy dữ liệu thành công",
                        userService.getSearchUser(username,email,pageable)
                )
        );
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @DeleteMapping("/delete/user/{id}")
    public ResponseEntity<String> deleleUser(@PathVariable("id") Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Delete success");
    }
}