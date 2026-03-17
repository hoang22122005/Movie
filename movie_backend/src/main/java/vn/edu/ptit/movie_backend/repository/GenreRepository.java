package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.ptit.movie_backend.models.Genre;

public interface GenreRepository extends JpaRepository<Genre,Integer> {

    boolean existsByGenreId(Integer genreId);
}
