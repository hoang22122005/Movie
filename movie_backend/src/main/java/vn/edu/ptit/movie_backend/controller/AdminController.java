package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.dto.UserDTO;
import vn.edu.ptit.movie_backend.dto.auth.RegisterRequest;
import vn.edu.ptit.movie_backend.service.MovieService;
import vn.edu.ptit.movie_backend.service.UserService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {

    private final UserService userService;
    private final MovieService movieService;

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getSearchUser(
            @RequestParam(required = false, value = "username") String username,
            @RequestParam(required = false, value = "email") String email,
            Pageable pageable) {
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy dữ liệu thành công",
                        userService.getSearchUser(username, email, pageable)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getById(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping("/movies")
    public ResponseEntity<ApiResponse<MovieDTO>> createMovie(@RequestBody @Valid MovieDTO dto) {
        MovieDTO result = movieService.createMovie(dto, dto.getGenresId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm phim mới thành công", result));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleleUser(@PathVariable("id") Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Delete success");
    }

    @DeleteMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMovie(@PathVariable("id") Integer id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã xoá thành công movie " + id, null));
    }

    @PutMapping("/movies/{movieId}")
    public ResponseEntity<ApiResponse<MovieDTO>> updateMovie(@PathVariable(value = "movieId") Integer movieId,
            @RequestBody MovieDTO dto) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Cập nhật phim thành công", movieService.updateMovie(movieId, dto)));
    }
}