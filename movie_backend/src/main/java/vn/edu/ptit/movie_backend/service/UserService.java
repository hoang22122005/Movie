package vn.edu.ptit.movie_backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.dto.UserDTO;
import vn.edu.ptit.movie_backend.dto.auth.RegisterRequest;
import vn.edu.ptit.movie_backend.models.User;

public interface UserService {


    UserDTO getUserById(Integer id);

    PageResponse<UserDTO> getSearchUser(String username, String email, Pageable pageable);

    UserDTO createUser(RegisterRequest dto);

    void deleteUser(Integer id);
}
