package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.service.MovieService;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class MovieController {
    private final MovieService movieService;

    @GetMapping("/public/movies")
    public ResponseEntity<ApiResponse<PageResponse<MovieDTO>>> getSearchMovie(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "genreId", required = false) Integer genreId,
            Pageable pageable) {
        PageResponse<MovieDTO> result = movieService.getSearchMovie(title, genreId, pageable);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phim thành công", result));
    }

    @GetMapping("/public/movies/{id}")
    public ResponseEntity<ApiResponse<MovieDTO>> getMovieById(@PathVariable("id") Integer id) {
        MovieDTO result = movieService.getMovieById(id);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thông tin phim thành công", result));
    }

    @GetMapping("/movies/recommendations")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<MovieDTO>>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        vn.edu.ptit.movie_backend.models.User user = (vn.edu.ptit.movie_backend.models.User) userDetails;
        List<MovieDTO> result = movieService.getRecommendations(user.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách gợi ý phim thành công", result));
    }
}
