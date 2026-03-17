package vn.edu.ptit.movie_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class MovieBackendApplication {
	public static void main(String[] args) {
		SpringApplication.run(MovieBackendApplication.class, args);
	}
}
