import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
})
//tự động đính kèm token vào mọi request nếu có
api.interceptors.request.use(
    //configs đối tượng chứa phương thức http và header
    (configs) => {
        //truy cập vào localStroagedđể lấy token
        const token = localStorage.getItem('token');
        if (token) {
            // nếu có token thì tự dán bearer token vào authorzation trong header
            configs.headers.Authorization = `Bearer ${token}`;
        }
        //cho phép đi tiếp cái gì ở đây là configs
        return configs;
    }
);
//backend sẽ xử lí token rồi trả về nếu hết hạn thì 401
//hàm này truyền vào 2 hàm con 1 hàm trả về reposne 1 hàm trả về lỗi
//nếu response.use trả về 200-299 thì đi vào hàm reponse còn lại đi vào reject
api.interceptors.response.use(
    response => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
)
export default api;
