package vn.edu.ptit.movie_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.dto.WatchListDTO;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.models.WatchList;
import vn.edu.ptit.movie_backend.service.WatchListService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user/watchlists")
public class WatchListController {
    private final WatchListService watchListService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MovieDTO>>> getSearchWatchList(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false, value = "movieName") String movieName, Pageable pageable) {

        User user = (User) userDetails;
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Lấy thành công danh sách phim yêu thích của user có id là " + user.getUserId(),
                        watchListService.getSearchWatchList(user.getUserId(), movieName, pageable)));
    }

    @PostMapping("/{movieId}")
    public ResponseEntity<ApiResponse<WatchListDTO>> postWatchList(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer movieId
    ) {

        User user = (User) userDetails;
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã thêm thành công phim vào danh sách yêu thích",
                watchListService.postWatchList(user.getUserId(),movieId)));
    }

    @DeleteMapping("/{movieId}")
    public ResponseEntity<ApiResponse<String>> deletWatchList(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer movieId
    ) {
        User user = (User) userDetails;
        watchListService.deleteWatchList(user.getUserId(),movieId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã xoá thành công", null));
    }

}
