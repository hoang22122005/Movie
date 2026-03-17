package vn.edu.ptit.movie_backend.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.edu.ptit.movie_backend.dto.ApiResponse;
import vn.edu.ptit.movie_backend.dto.CommentDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Comment;
import vn.edu.ptit.movie_backend.service.CommentService;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/comment")
public class CommentController {
    private final CommentService commentService;
    @GetMapping("/{movieId}")
    public ResponseEntity<ApiResponse<PageResponse<CommentDTO>>> getSearchComment(@PathVariable("movieId") Integer movieId, Pageable pageable){
        return ResponseEntity.ok(new ApiResponse<>(true,"Lấy thành công danh sách comment của movie " + movieId,commentService.getSearchComment(movieId,pageable)));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<CommentDTO>> createComment(@RequestBody CommentDTO dto){
        commentService.createComment(dto);
        return ResponseEntity.ok(new ApiResponse<>(true,"Đã thêm bình luận thành công",null));
    }
}
