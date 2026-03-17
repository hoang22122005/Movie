package vn.edu.ptit.movie_backend.service.impl;

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
    public WatchListDTO postWatchList(WatchListDTO request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với id: " + request.getUserId()));

        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với id: " + request.getMovieId()));

        if(watchListRepository.existsByUser_UserIdAndMovie_MoviesId(request.getUserId(), request.getMovieId())) throw new RuntimeException("Phim này đã có trong danh sách");

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
    public void deleteWatchList(Integer watchListId) {
        if (!watchListRepository.existsByWatchListId(watchListId))
            throw new RuntimeException("Không tìm thấy phim có id là " + watchListId);
        watchListRepository.deleteByWatchListId(watchListId);
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
