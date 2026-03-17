package vn.edu.ptit.movie_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class RecommendationClient {

    private final RestTemplate restTemplate;

    @Value("${flask.api.url:http://localhost:5000}")
    private String flaskApiUrl;

    //dùng restTemple gửi yêu cầu ngầm đến api của flask
    public RecommendationClient() {
        this.restTemplate = new RestTemplate();
    }

    public List<Map<String, Object>> getRecommendations(Integer userId) {
        String url = flaskApiUrl + "/predict?user_id=" + userId;
        try {
            //spring hiểu chính xác rằng nó cần dịch (parse) file JSON trả về từ Flask thành một cấu trúc Map<String, Object> chứ không phải là một Object chung chung
            ParameterizedTypeReference<Map<String, Object>> responseType = new ParameterizedTypeReference<Map<String, Object>>() {
            };
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, null, responseType);

            if (response.getBody() != null && response.getBody().containsKey("recommendations")) {
                //lấy dữ liệu có thuộc tính là recommendations
                return (List<Map<String, Object>>) response.getBody().get("recommendations");
            }
        } catch (Exception e) {
            System.err.println("Error calling Flask API: " + e.getMessage());
        }
        return List.of();
    }
}
