package vn.edu.ptit.movie_backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieDTO {
    private Integer movieId;
    private String title;
    private LocalDate releaseDate;
    private String posterUrl;
    private String trailerUrl;
    private String description;
    private Integer viewCount;
    private String director;
    private Integer duration;
    private List<Integer> genresId;
    private List<String> genres;
    private Double predictedRating;
    private float avgRating;
    private Integer cntRating;
    @JsonProperty("isVip")
    private boolean isVip;
}
