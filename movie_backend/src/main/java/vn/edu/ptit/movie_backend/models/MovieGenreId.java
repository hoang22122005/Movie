package vn.edu.ptit.movie_backend.models;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Embeddable
@Data
public class MovieGenreId implements Serializable {
    private Integer movieId;
    private Integer genreId;
}
