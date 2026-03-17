package vn.edu.ptit.movie_backend.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Genre;
import vn.edu.ptit.movie_backend.models.MovieGenre;
import vn.edu.ptit.movie_backend.models.MovieGenreId;
import vn.edu.ptit.movie_backend.repository.GenreMovieRepository;
import vn.edu.ptit.movie_backend.repository.GenreRepository;
import vn.edu.ptit.movie_backend.repository.MovieRepository;
import vn.edu.ptit.movie_backend.service.MovieService;
import vn.edu.ptit.movie_backend.models.Movie;
import java.util.List;

import java.util.Map;
import java.util.stream.Collectors;
import vn.edu.ptit.movie_backend.service.RecommendationClient;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {
    private final MovieRepository movieRepository;
    private final GenreMovieRepository genreMovieRepository;
    private final GenreRepository genreRepository;
    private final RestClient.Builder restClientBuilder;
    private final RecommendationClient recommendationClient;

    @Override
    public MovieDTO getMovieById(Integer id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found movie with id: " + id));
        return toDTO(movie);
    }

    @Override
    public PageResponse<MovieDTO> getSearchMovie(String title, Integer genreId, Pageable pageable) {

        Page<MovieDTO> page;
        boolean hasTitle = title != null && !title.trim().isEmpty();
        boolean hasGenre = genreId != null;

        if (hasTitle && hasGenre) {
            page = movieRepository.findMovieByGenreAndTitle(title, genreId, pageable).map(this::toDTO);
        } else if (hasTitle) {
            page = movieRepository.findByTitleContainingIgnoreCase(title, pageable).map(this::toDTO);
        } else if (hasGenre) {
            page = movieRepository.findMoviesByGenre(genreId, pageable).map(this::toDTO);
        } else {
            page = movieRepository.findAll(pageable).map(this::toDTO);
        }

        return PageResponse.<MovieDTO>builder()
                .content(page.getContent())
                .pageSize(page.getSize())
                .pageNumber(page.getNumber())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public void deleteMovie(Integer id) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new RuntimeException("không tìm thấy phim này"));
        movieRepository.delete(movie);
    }

    @Override
    public List<MovieDTO> getRecommendations(Integer userId) {
        List<Map<String, Object>> recommendedData = recommendationClient.getRecommendations(userId);
        List<MovieDTO> recommendedMovies = new ArrayList<>();
        if (recommendedData != null && !recommendedData.isEmpty()) {
            for (Map<String, Object> data : recommendedData) {
                try {
                    Integer movieId = (Integer) data.get("movie_id");
                    Double predictedRating = (Double) data.get("predicted_rating");

                    MovieDTO movie = getMovieById(movieId);
                    movie.setPredictedRating(predictedRating);
                    recommendedMovies.add(movie);
                } catch (Exception e) {
                    // ignore if movie doesn't exist anymore
                }
            }
        }
        return recommendedMovies;
    }

    @Override
    public MovieDTO createMovie(MovieDTO dto, List<Integer> genreId) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty())
            throw new RuntimeException("Bạn chưa nhập tên phim");

        // if(!movieRepository.findByTrailerUrl(dto.getTrailerUrl())) throw new
        // RuntimeException("Phim này đã tồn tại");

        if (dto.getPosterUrl() == null || dto.getPosterUrl().trim().isEmpty())
            throw new RuntimeException("Bạn chưa nhập poster");

        Movie movie = new Movie();
        movie.setTitle(dto.getTitle());
        movie.setReleaseDate(dto.getReleaseDate());
        movie.setPosterUrl(dto.getPosterUrl());
        movie.setTrailerUrl(dto.getTrailerUrl());
        movie.setDescription(dto.getDescription());
        movie.setDirector(dto.getDirector());
        movie.setDuration(dto.getDuration());
        movie.setViewCount(0);

        movieRepository.save(movie);
        saveGenre(movie, genreId);

        return toDTO(movie);
    }

    private void saveGenre(Movie movie, List<Integer> genresId) {
        if (genresId == null)
            return;

        for (Integer genreId : genresId) {
            Genre genre = genreRepository.findById(genreId)
                    .orElseThrow(() -> new RuntimeException("Không tim thấy id thể loại phim này" + genreId));

            MovieGenreId movieGenreId = new MovieGenreId();
            movieGenreId.setGenreId(genreId);
            movieGenreId.setMovieId(movie.getMoviesId());

            MovieGenre movieGenre = new MovieGenre();
            movieGenre.setId(movieGenreId);
            movieGenre.setMovie(movie);
            movieGenre.setGenre(genre);

            genreMovieRepository.save(movieGenre);
        }
    }

    private List<String> getGenreNamesByMovieId(Integer movieId) {
        return genreMovieRepository.findByMovie_MoviesId(movieId).stream()
                .map(movieGenre -> movieGenre.getGenre().getGenreName()).collect(Collectors.toList());
    }

    private MovieDTO toDTO(Movie movie) {
        if (movie == null) {
            return null;
        }
        MovieDTO dto = new MovieDTO();
        dto.setMovieId(movie.getMoviesId());
        dto.setTitle(movie.getTitle());
        dto.setReleaseDate(movie.getReleaseDate());
        dto.setPosterUrl(movie.getPosterUrl());
        dto.setViewCount(movie.getViewCount());
        dto.setDirector(movie.getDirector());
        dto.setDuration(movie.getDuration());

        dto.setGenres(getGenreNamesByMovieId(movie.getMoviesId()));
        return dto;
    }
}