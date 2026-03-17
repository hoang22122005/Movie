package vn.edu.ptit.movie_backend.models;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;

@Data
@Embeddable
public class RatingId implements Serializable {
    private Integer movieId;
    private Integer userId;
}
