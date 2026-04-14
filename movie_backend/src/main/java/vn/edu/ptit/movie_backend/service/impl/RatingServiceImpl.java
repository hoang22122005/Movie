package vn.edu.ptit.movie_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.edu.ptit.movie_backend.dto.RatingDTO;
import vn.edu.ptit.movie_backend.models.Movie;
import vn.edu.ptit.movie_backend.models.Rating;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.repository.MovieRepository;
import vn.edu.ptit.movie_backend.repository.RatingRepository;
import vn.edu.ptit.movie_backend.repository.UserRepository;
import vn.edu.ptit.movie_backend.service.RatingService;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {
    private final RatingRepository ratingRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public RatingDTO createRating(RatingDTO dto, Integer userId) {
        vn.edu.ptit.movie_backend.models.RatingId ratingId = new vn.edu.ptit.movie_backend.models.RatingId();
        ratingId.setMovieId(dto.getMovieId());
        ratingId.setUserId(userId);

        Rating rating = ratingRepository.findById(ratingId).orElse(new Rating());
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim có id là " + dto.getMovieId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user có id là " + userId));

        boolean isNew = rating.getId() == null;
        if (isNew) {
            rating.setId(ratingId);
            rating.setUser(user);
            rating.setMovie(movie);
        }

        java.math.BigDecimal oldRating = rating.getRatingValue();
        rating.setRatingValue(dto.getRatingValue());
        rating.setCreatedAt(LocalDateTime.now());
        ratingRepository.save(rating);

        // Update Movie stats
        int count = movie.getCntRating() != null ? movie.getCntRating() : 0;
        float avg = movie.getAvgRating();

        if (isNew) {
            float newAvg = (avg * count + dto.getRatingValue().floatValue()) / (count + 1);
            movie.setAvgRating(newAvg);
            movie.setCntRating(count + 1);
        } else {
            float newAvg = (avg * count - oldRating.floatValue() + dto.getRatingValue().floatValue()) / count;
            movie.setAvgRating(newAvg);
        }
        movieRepository.save(movie);

        return toDTO(rating);
    }

    private RatingDTO toDTO(Rating rating) {
        RatingDTO ratingDTO = new RatingDTO();
        ratingDTO.setRatingValue(rating.getRatingValue());
        ratingDTO.setUserId(rating.getUser().getUserId());
        ratingDTO.setCreatedAt(rating.getCreatedAt());

        return ratingDTO;
    }

}
