package vn.edu.ptit.movie_backend.models;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "WATCHEDLIST")
public class Watched {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "watched_id")
    private int watchedId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Column(name = "watched_at")
    private LocalDateTime watchedAt;
    private int progress;
}
