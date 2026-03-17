package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.ptit.movie_backend.models.Comment;

public interface CommentRepository extends JpaRepository<Comment,Integer> {
    @Query("select distinct c from Comment c join Movie m on m.moviesId = c.movie.moviesId where c.movie.moviesId = :movieId")
    Page<Comment> getSearchComment(@Param(value = "movieId") Integer movieId,Pageable pageable);
}
