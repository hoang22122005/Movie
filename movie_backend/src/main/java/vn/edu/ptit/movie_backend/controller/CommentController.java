package vn.edu.ptit.movie_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.CommentDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Comment;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.service.CommentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/public/comments/{movieId}")
    public ResponseEntity<ApiResponse<PageResponse<CommentDTO>>> getSearchComment(
            @PathVariable("movieId") Integer movieId, Pageable pageable) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy thành công danh sách comment của movie " + movieId,
                commentService.getSearchComment(movieId, pageable)));
    }

    @PostMapping("/users/comments")
    public ResponseEntity<ApiResponse<CommentDTO>> createComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CommentDTO dto) {
        User user = (User) userDetails;
        CommentDTO result = commentService.createComment(dto, user.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã thêm bình luận thành công", result));
    }

    @PutMapping("/users/comments")
    public ResponseEntity<ApiResponse<CommentDTO>> updateComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CommentDTO dto) {
        User user = (User) userDetails;
        CommentDTO result = commentService.updateComment(dto, user.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã chỉnh sửa bình luận thành công", result));
    }

    @DeleteMapping("/users/comments/{commentId}")
    public ResponseEntity<ApiResponse<String>> deleteComment(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Integer commentId) {
        User user = (User) userDetails;
        commentService.deleteComment(commentId, user.getUserId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã xóa bình luận thành công", null));
    }

}
