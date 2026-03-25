package vn.edu.ptit.movie_backend.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import vn.edu.ptit.movie_backend.dto.PageResponse;
import vn.edu.ptit.movie_backend.dto.UserDTO;
import vn.edu.ptit.movie_backend.dto.auth.RegisterRequest;
import vn.edu.ptit.movie_backend.repository.UserRepository;
import vn.edu.ptit.movie_backend.service.UserService;
import vn.edu.ptit.movie_backend.models.User;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDTO createUser(RegisterRequest dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("User name đã tồn tại");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole("USER");
        user.setStatus(true);

        return toDTO(userRepository.save(user));
    }

    @Override
    public UserDTO getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + id));
        return toDTO(user);
    }

    @Override
    public PageResponse<UserDTO> getSearchUser(String username, String email, Pageable pageable) {
        Page<UserDTO> users;
        if (username != null && email != null) {
            users = userRepository
                    .findByUsernameContainingIgnoreCaseAndEmailContainingIgnoreCase(username, email, pageable)
                    .map(this::toDTO);
        } else if (username != null)
            users = userRepository.findByUsernameContainingIgnoreCase(username, pageable).map(this::toDTO);
        else if (email != null)
            users = users = userRepository.findByEmailContainingIgnoreCase(email, pageable).map(this::toDTO);
        else
            users = userRepository.findAll(pageable).map(this::toDTO);

        return PageResponse.<UserDTO>builder()
                .content(users.getContent())
                .pageNumber(users.getNumber())
                .pageSize(users.getSize())
                .totalPages(users.getTotalPages())
                .totalElements(users.getTotalElements())
                .build();
    }

    @Override
    @Transactional
    public UserDTO updateProfile(Integer userId, UserDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + userId));

        user.setAge(dto.getAge());
        user.setGender(dto.getGender());
        user.setOccupation(dto.getOccupation());
        user.setZipCode(dto.getZipCode());
        user.setEmail(dto.getEmail());

        return toDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Khong tim thay User co id la" + id));
        user.setStatus(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void changePassword(Integer userId, String newPassword, String oldPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy user với id: " + userId));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng với mật khẩu cũ");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }
        UserDTO dto = new UserDTO();
        dto.setUserId(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.isStatus());
        dto.setAge(user.getAge());
        dto.setGender(user.getGender());
        dto.setOccupation(user.getOccupation());
        dto.setZipCode(user.getZipCode());

        return dto;
    }
}
