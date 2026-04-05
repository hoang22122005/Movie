package vn.edu.ptit.movie_backend.service;

import vn.edu.ptit.movie_backend.dto.CommentDTO;
import vn.edu.ptit.movie_backend.dto.RatingDTO;

public interface RatingService {
    RatingDTO createRating(RatingDTO dto,Integer userId);
}
