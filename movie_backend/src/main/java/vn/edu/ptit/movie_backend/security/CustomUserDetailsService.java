package vn.edu.ptit.movie_backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import vn.edu.ptit.movie_backend.models.User;
import vn.edu.ptit.movie_backend.repository.UserRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy user " + username));

        String role = user.getRole() != null ? user.getRole() : "USER";
        String roleName = role.startsWith("ROLE_") ? role : "ROLE_" + role;

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                //lấy password trong db ra so sánh
                user.getPassword(),
                //lấy ra được đối tượng vài role
                Collections.singleton(new SimpleGrantedAuthority(roleName))
        );
    }
}
