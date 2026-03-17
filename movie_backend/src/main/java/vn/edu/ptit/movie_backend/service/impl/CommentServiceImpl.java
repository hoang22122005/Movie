package vn.edu.ptit.movie_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.edu.ptit.movie_backend.dto.CommentDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Comment;
import vn.edu.ptit.movie_backend.models.Movie;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.repository.CommentRepository;
import vn.edu.ptit.movie_backend.repository.MovieRepository;
import vn.edu.ptit.movie_backend.repository.UserRepository;
import vn.edu.ptit.movie_backend.service.CommentService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    @Override
    public PageResponse<CommentDTO> getSearchComment(Integer movieId,Pageable pageable) {
        Page<CommentDTO> page;
        page = commentRepository.getSearchComment(movieId,pageable).map(this::toDTO);
        return PageResponse.<CommentDTO>builder()
                .content(page.getContent())
                .pageSize(page.getSize())
                .pageNumber(page.getNumber())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public CommentDTO createComment(CommentDTO dto) {
        Comment comment = new Comment();
        User user = userRepository.findById(dto.getUserId()).orElseThrow(()->new RuntimeException("Không tìm thấy User có id là "+dto.getUserId() ));
        Movie movie = movieRepository.findById(dto.getMovieId()).orElseThrow(()->new RuntimeException("Không tìm thấy phim có id là "+dto.getMovieId()));

        comment.setUser(user);
        comment.setMovie(movie);
        comment.setContent(dto.getContent());
        comment.setCreatedAt(LocalDateTime.now());
        commentRepository.save(comment);

        return toDTO(comment);

    }

    private CommentDTO toDTO(Comment u){
        CommentDTO a = new CommentDTO(u.getCommentId(),u.getUser().getUserId(),u.getMovie().getMoviesId(),u.getContent(),u.getCreatedAt());
        return a;
    }
}
