package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.service.MovieService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/movie")
public class MovieController {
    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MovieDTO>>> getSearchMovie(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "genreId", required = false) Integer genreId,
            Pageable pageable) {
        PageResponse<MovieDTO> result = movieService.getSearchMovie(title, genreId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phim thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieDTO>> getMovieById(@PathVariable("id") Integer id) {
        MovieDTO result = movieService.getMovieById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin phim thành công", result));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<MovieDTO>> createMovie(@RequestBody @Valid MovieDTO dto) {
        MovieDTO result = movieService.createMovie(dto, dto.getGenresId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm phim mới thành công", result));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<String>> deleteMovie(@PathVariable("id") Integer id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã xoá thành công movie " + id, null));
    }

    @GetMapping("/recommendations/{userId}")
    public ResponseEntity<ApiResponse<List<MovieDTO>>> getRecommendations(@PathVariable("userId") Integer userId) {
        List<MovieDTO> result = movieService.getRecommendations(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gợi ý phim thành công", result));
    }
}
