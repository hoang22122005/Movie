package vn.edu.ptit.movie_backend.service;

import org.springframework.data.domain.Pageable;
import vn.edu.ptit.movie_backend.dto.MovieDTO;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.models.Movie;
import vn.edu.ptit.movie_backend.dto.WatchListDTO;

public interface WatchListService {
    WatchListDTO postWatchList(WatchListDTO request);

    PageResponse<MovieDTO> getSearchWatchList(Integer userid, String movieName, Pageable pageable);

    void deleteWatchList(Integer WatchListId);
}
