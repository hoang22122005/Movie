package vn.edu.ptit.movie_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.RatingDTO;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.service.RatingService;

@RestController
@RequestMapping("/api/rating")
@RequiredArgsConstructor
public class RatingController {
    private final RatingService ratingService;
    @PostMapping()
    public ResponseEntity<ApiResponse<RatingDTO>> createRating(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody RatingDTO dto){
        User user = (User) userDetails;
        RatingDTO ratingDTO = ratingService.createRating(dto, user.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true,"Đã tạo thành công đánh giá phim",ratingDTO));
    }

}
