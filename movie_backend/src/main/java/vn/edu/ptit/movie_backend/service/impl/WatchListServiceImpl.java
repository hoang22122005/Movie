package vn.edu.ptit.movie_backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Movie;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.models.WatchList;
import vn.edu.ptit.movie_backend.repository.*;
import vn.edu.ptit.movie_backend.service.WatchListService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import vn.edu.ptit.movie_backend.dto.WatchListDTO;

@Service
@RequiredArgsConstructor
public class WatchListServiceImpl implements WatchListService {
    private final WatchListRepository watchListRepository;
    private final GenreMovieRepository genreMovieRepository;
    private final GenreRepository genreRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @Override
    public WatchListDTO postWatchList(Integer userId,Integer movieId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + userId));

        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với id: " + movieId));

        if(watchListRepository.existsByUser_UserIdAndMovie_MoviesId(userId, movieId)) throw new RuntimeException("Phim này đã có trong danh sách");

        WatchList watchList = new WatchList();
        watchList.setUser(user);
        watchList.setMovie(movie);
        watchList.setAddedAt(LocalDateTime.now());

        WatchList saved = watchListRepository.save(watchList);

        return WatchListDTO.builder()
                .watchListId(saved.getWatchListId())
                .userId(saved.getUser().getUserId())
                .movieId(saved.getMovie().getMoviesId())
                .addedAt(saved.getAddedAt())
                .build();
    }

    @Override
    public PageResponse<MovieDTO> getSearchWatchList(Integer userid, String movieName, Pageable pageable) {
        Page<MovieDTO> page;
        if (!userRepository.existsByUserId(userid))
            throw new RuntimeException("Id này không tồn tại");
        if (movieName == null || movieName.trim().isEmpty())
            page = watchListRepository.getMovieInWatchList(userid, pageable).map(this::toDTO);
        else
            page = watchListRepository.getMovieInWatchListWithMovieName(userid, movieName, pageable).map(this::toDTO);

        return PageResponse.<MovieDTO>builder()
                .content(page.getContent())
                .pageSize(page.getSize())
                .pageNumber(page.getNumber())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public void deleteWatchList(Integer userId,Integer movieId) {
        WatchList watchList = watchListRepository.findFirstByUser_UserIdAndMovie_MoviesId(userId,movieId).orElseThrow(()->new RuntimeException("Không tìm thấy phim có id là"+movieId));
        watchListRepository.deleteByWatchListId(watchList.getWatchListId());
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
        dto.setAvgRating(movie.getAvgRating());
        dto.setCntRating(movie.getCntRating());

        dto.setGenres(getGenreNamesByMovieId(movie.getMoviesId()));
        return dto;
    }
}
