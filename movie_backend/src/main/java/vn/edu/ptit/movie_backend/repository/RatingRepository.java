package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vn.edu.ptit.movie_backend.models.Rating;
import vn.edu.ptit.movie_backend.models.RatingId;

public interface RatingRepository extends JpaRepository<Rating, RatingId> {

}

