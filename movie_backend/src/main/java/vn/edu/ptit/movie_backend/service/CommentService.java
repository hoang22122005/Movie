package vn.edu.ptit.movie_backend.service;

import org.springframework.data.domain.Pageable;
import vn.edu.ptit.movie_backend.dto.CommentDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Comment;

public interface CommentService {
    PageResponse<CommentDTO> getSearchComment(Integer movieId,Pageable pageable);
    CommentDTO createComment(CommentDTO dto);
}
