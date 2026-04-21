package vn.edu.ptit.movie_backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.File;

@SpringBootApplication
public class MovieBackendApplication {
	public static void main(String[] args) {
		// Kiểm tra file .env ở thư mục hiện tại hoặc thư mục movie_backend
		String envPath = new File("movie_backend/.env").exists() ? "movie_backend" : "./";

		Dotenv dotenv = Dotenv.configure()
				.directory(envPath)
				.ignoreIfMissing()
				.load();

		dotenv.entries().forEach(entry -> {
			if (System.getProperty(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
			}
		});

		SpringApplication.run(MovieBackendApplication.class, args);
	}
}
