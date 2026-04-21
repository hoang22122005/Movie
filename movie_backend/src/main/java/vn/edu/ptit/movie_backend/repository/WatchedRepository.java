package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.ptit.movie_backend.models.Watched;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.models.Movie;
import java.util.Optional;

public interface WatchedRepository extends JpaRepository<Watched, Integer> {
    Optional<Watched> findByUserAndMovie(User user, Movie movie);
}
