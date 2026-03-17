package vn.edu.ptit.movie_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WatchListDTO {
    private Integer watchListId;
    private Integer userId;
    private Integer movieId;
    private LocalDateTime addedAt;
}
