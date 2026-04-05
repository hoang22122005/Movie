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
    public RatingDTO createRating(RatingDTO dto, Integer userId){
        Rating rating = new Rating();
        Movie movie = movieRepository.findById(dto.getMovieId())
                .orElseThrow(()->new RuntimeException("Không tìm thấy phim có id là " + dto.getMovieId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user có id là " + userId));
        rating.setCreatedAt(LocalDateTime.now());
        rating.setUser(user);
        rating.setMovie(movie);

        ratingRepository.save(rating);
        return toDTO(rating);
    }

    private RatingDTO toDTO(Rating rating){
        RatingDTO ratingDTO = new RatingDTO();
        ratingDTO.setRatingValue(rating.getRatingValue());
        ratingDTO.setUserId(rating.getUser().getUserId());
        ratingDTO.setCreatedAt(rating.getCreatedAt());

        return ratingDTO;
    }

}
