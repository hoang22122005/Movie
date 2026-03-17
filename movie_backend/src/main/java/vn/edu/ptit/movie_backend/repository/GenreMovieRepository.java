package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.ptit.movie_backend.models.MovieGenre;
import vn.edu.ptit.movie_backend.models.MovieGenreId;

import java.util.List;

public interface GenreMovieRepository extends JpaRepository<MovieGenre, MovieGenreId> {
    List<MovieGenre> findByMovie_MoviesId(Integer movieId);

    List<MovieGenre> findByGenre_GenreId(Integer genreId);
}
