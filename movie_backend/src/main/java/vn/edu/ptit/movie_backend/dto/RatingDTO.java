package vn.edu.ptit.movie_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RatingDTO {
    private int userId;
    private int movieId;
    private BigDecimal ratingValue;
    private LocalDateTime createdAt;
}
