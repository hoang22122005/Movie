package vn.edu.ptit.movie_backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "MOVIE_GENRES")
public class MovieGenre {
    @EmbeddedId
    private MovieGenreId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("movieId")
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("genreId")
    @JoinColumn(name = "genre_id")
    private Genre genre;
}
