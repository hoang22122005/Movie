package vn.edu.ptit.movie_backend.models;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "MOVIES")
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "movie_id")
    private Integer moviesId;

    private String title;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster_url")
    private String posterUrl;

    @Column(name = "trailer_url")
    private String trailerUrl;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "views_count")
    private Integer viewCount;

    private String director;
    private Integer duration;

    @Column(name = "avg_rating")
    private float avgRating;

    @Column(name = "cnt_rating")
    private Integer cntRating;
}
