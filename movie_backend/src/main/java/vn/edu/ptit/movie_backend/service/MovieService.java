package vn.edu.ptit.movie_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Movie;

import java.util.List;

public interface MovieService {
    MovieDTO getMovieById(Integer id);

    PageResponse<MovieDTO> getSearchMovie(String movieName, Integer genreId, Pageable pageable);

    MovieDTO createMovie(MovieDTO dto, List<Integer> genreId);

    void deleteMovie(Integer id);

    List<MovieDTO> getRecommendations(Integer userId);
}
