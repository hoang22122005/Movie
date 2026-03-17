package vn.edu.ptit.movie_backend.controller;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.edu.ptit.movie_backend.dto.UserDTO;
import vn.edu.ptit.movie_backend.dto.auth.RegisterRequest;
import vn.edu.ptit.movie_backend.service.UserService;

@RestController
@AllArgsConstructor
@RequestMapping("api/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/create")
    public ResponseEntity<UserDTO> createUser(@RequestBody @Valid RegisterRequest dto){
        return ResponseEntity.ok(userService.createUser(dto));
    }

}
