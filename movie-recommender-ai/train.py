import os
import pandas as pd
from sqlalchemy import create_engine
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# --- SETTINGS / DB CONNECTION ---
DB_URL = "mssql+pyodbc://Web:123456@localhost:1433/Movie?driver=ODBC+Driver+17+for+SQL+Server"

def load_data():
    engine = create_engine(DB_URL)
    movies_df = pd.read_sql("SELECT movie_id, title, description FROM MOVIES", engine)
    ratings_df = pd.read_sql("SELECT user_id, movie_id, rating_value FROM RATINGS", engine)
    genres_df = pd.read_sql("""
        SELECT mg.movie_id, g.genre_name 
        FROM MOVIE_GENRES mg
        JOIN GENRES g ON mg.genre_id = g.genre_id
    """, engine)
    return movies_df, ratings_df, genres_df

def preprocess_data(movies_df, ratings_df, genres_df):
    movies_df['title'] = movies_df['title'].fillna('').astype(str)
    movies_df['description'] = movies_df['description'].fillna('').astype(str)
    
    if not genres_df.empty:
        genres_grouped = genres_df.groupby('movie_id')['genre_name'].apply(lambda x: ' '.join(x)).reset_index()
        movies_df = movies_df.merge(genres_grouped, on='movie_id', how='left')
    else:
        movies_df['genre_name'] = ''
        
    movies_df['genre_name'] = movies_df['genre_name'].fillna('')
    
    # tạo chuỗi văn bản giàu ngữ nghĩa cho Sentence Transformer
    movies_df['semantic_text'] = (
        "Movie Title: " + movies_df['title'] + 
        ". Genres: " + movies_df['genre_name'] + 
        ". Overview: " + movies_df['description']
    )
    return movies_df, ratings_df

def train_content_based_semantic(movies_df):
    """SỬ DỤNG SENTENCE TRANSFORMER"""
    print("Đang tải mô hình Sentence Transformer (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Đang tạo Semantic Embeddings cho danh sách phim...")
    # đọc từng dòng trong cột semantic_text để nó biến thành vector 384 chiều (mô hình all-MiniLM-L6-v2 tạo ra vector 384 chiều)
    embeddings = model.encode(movies_df['semantic_text'].tolist(), show_progress_bar=True)
    
    # Chuẩn hóa vector (L2 normalization) để tính Cosine Similarity bằng Dot Product (axis=1 là tính toán theo hàng, keepdims là giữ trạng thái bảng)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    #chia vector cho độ dài của nó để độ dài vector = 1 tính độ giống nhau giữa các vector bằng hướng (direction)
    embeddings = embeddings / (norms + 1e-10)
    
    return embeddings

def compute_cf_matrices(df):
    """Collaborative Filtering (Z-score)"""
    print("Đang tính toán ma trận Collaborative Filtering (Z-score)...")
    if df.empty: return None
    user_item_matrix = df.pivot(index='user_id', columns='movie_id', values='rating_value')
    user_mean = user_item_matrix.mean(axis=1)
    #tính độ lệch chuẩn trên thang điểm của người chấm nếu độ lệch chuẩn bằng 0 thì thay bằng 1 để chia
    user_std = user_item_matrix.std(axis=1).replace(0, 1.0).fillna(1.0)
    #điểm sau khi chuẩn hoá sẽ là điểm - trùng bình chia lệch chuẩn (lấp khoảng trống với phim người dùng chưa đánh giá)
    user_item_norm = user_item_matrix.sub(user_mean, axis=0).div(user_std, axis=0).fillna(0)
    
    # Tính Item-Item Similarity
    item_user_matrix = user_item_norm.T
    
    #dùng cosine để chuẩn hoá cos(θ)=(A⋅B)​∣A∣∣B∣
    #tạo ma trận vuông và tính toán độ tương đồng theo rating (numpy array)
    cf_similarity = cosine_similarity(item_user_matrix)
    cf_sim_df = pd.DataFrame(cf_similarity, index=item_user_matrix.index, columns=item_user_matrix.index)
    
    return {'cf_sim_df': cf_sim_df, 'user_item_norm': user_item_norm, 'user_mean': user_mean, 'user_std': user_std}

def build_main_model():
    print("\n" + "="*20 + " HUẤN LUYỆN HỆ THỐNG GỢI Ý SEMANTIC HYBRID " + "="*20)
    movies_df, ratings_df, genres_df = load_data()
    movies_df, ratings_df = preprocess_data(movies_df, ratings_df, genres_df)
    
    # 1. Huấn luyện Content-Based Semantic (Chỉ lấy Embeddings)
    embeddings = train_content_based_semantic(movies_df)
    
    # 2. Huấn luyện Collaborative Filtering
    cf_data = compute_cf_matrices(ratings_df)
    
    # 3. Đóng gói mô hình
    model_package = {
        'movie_ids': movies_df['movie_id'].tolist(),
        'content_embeddings': embeddings,
        'cf_sim_df': cf_data['cf_sim_df'],
        'user_item_norm': cf_data['user_item_norm'],
        'user_mean': cf_data['user_mean'],
        'user_std': cf_data['user_std']
    }
    #lưu từ từ điển model này thành 1 file
    with open('cf_model.pkl', 'wb') as f:
        pickle.dump(model_package, f)
    
    # Lưu thêm một file CSV chứa ID và tên phim để dùng làm mapping
    movies_df[['movie_id', 'title']].to_csv('movies_metadata.csv', index=False)
    print("--- HOÀN TẤT: Mô hình Semantic Hybrid đã sẵn sàng! ---")

if __name__ == "__main__":
    build_main_model()
