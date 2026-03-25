package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.edu.ptit.movie_backend.models.Movie;

public interface MovieRepository extends JpaRepository<Movie, Integer> {

        Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

        boolean findByTrailerUrl(String trailerUrl);

        @Query("SELECT DISTINCT m FROM Movie m " +
                        "JOIN MovieGenre mg ON m.moviesId = mg.movie.moviesId " +
                        "WHERE mg.genre.genreId = :genreId")
        Page<Movie> findMoviesByGenre(@Param("genreId") Integer genreId, Pageable pageable);

        @Query("select distinct m from Movie m join MovieGenre mg on m.moviesId = mg.movie.moviesId " +
                        "where lower(m.title) like lower(concat('%', :title, '%')) and mg.genre.genreId = :genreId")
        Page<Movie> findMovieByGenreAndTitle(@Param("title") String movieName, @Param("genreId") Integer genreId,
                        Pageable pageable);

        @Query("select distinct m from Movie m join Watched wa on wa.movie.moviesId = m.moviesId join User u on u.userId = wa.user.userId where u.userId = :userId")
        Page<Movie> findWatchedList(@Param("userId") Integer userId, Pageable pageable);
}
