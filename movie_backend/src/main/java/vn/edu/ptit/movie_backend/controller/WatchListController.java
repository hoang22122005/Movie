package vn.edu.ptit.movie_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.dto.WatchListDTO;
import vn.edu.ptit.movie_backend.models.WatchList;
import vn.edu.ptit.movie_backend.service.WatchListService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/watchlist")
public class WatchListController {
    private final WatchListService watchListService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MovieDTO>>> getSearchWatchList(
            @RequestParam(required = false, value = "userId") Integer userid,
            @RequestParam(required = false, value = "movieName") String movieName, Pageable pageable) {
        return ResponseEntity
                .ok(new ApiResponse<>(true, "Lấy thành công danh sách phim yêu thích của user có id là " + userid,
                        watchListService.getSearchWatchList(userid, movieName, pageable)));
    }

    @PostMapping("/post")
    public ResponseEntity<ApiResponse<WatchListDTO>> postWatchList(@RequestBody WatchListDTO request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã thêm thành công phim vào danh sách yêu thích",
                watchListService.postWatchList(request)));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<String>> deletWatchList(@PathVariable("id") Integer watchListId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã xoá thành công", null));
    }

}
