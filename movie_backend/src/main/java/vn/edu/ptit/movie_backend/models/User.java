package vn.edu.ptit.movie_backend.models;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "USERS")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private int userId;
    private int age;
    private String gender;
    private String occupation;

    @Column(name = "zip_code")
    private String zipCode;

    private String username;
    @Column(name = "password_hash")
    private String password;
    private String email;
    private String role;
    private boolean status;
}
