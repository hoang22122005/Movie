package vn.edu.ptit.movie_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.edu.ptit.movie_backend.models.Movie;
import vn.edu.ptit.movie_backend.models.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

    Page<User> findByUsernameContainingIgnoreCaseAndEmailContainingIgnoreCase(String username, String email,
            Pageable pageable);

    Page<User> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    Optional<User> findByUsername(String username);

    Optional<User> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByUserId(int userId);

    boolean existsByEmail(String email);

}
