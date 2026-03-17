package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.ptit.movie_backend.models.Movie;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.models.WatchList;

public interface WatchListRepository extends JpaRepository<WatchList,Integer> {

    boolean existsByWatchListId(Integer watchListId);

    @Query("select distinct m from Movie m join WatchList w on w.movie.moviesId = m.moviesId where w.user.userId = :userId and lower(m.title) like concat('%',:movieName,'%') ")
    Page<Movie> getMovieInWatchListWithMovieName(@Param("userId") Integer userId, @Param("movieName") String movieName, Pageable pageable);

    @Query("select distinct m from Movie m join WatchList wc on wc.movie.moviesId = m.moviesId where wc.user.userId = :userId")
    Page<Movie> getMovieInWatchList(@Param("userId") Integer userId,Pageable pageable);

    void deleteByWatchListId(Integer watchListId);

    boolean existsByUser_UserIdAndMovie_MoviesId(Integer userId,Integer movieId);
}
