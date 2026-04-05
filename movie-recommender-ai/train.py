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
    # Lấy thêm director và release_date
    movies_df = pd.read_sql("SELECT movie_id, title, description, director, release_date FROM MOVIES", engine)
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
    movies_df['director'] = movies_df['director'].fillna('Unknown').astype(str)
    
    # Xử lý Năm sản xuất
    movies_df['year'] = pd.to_datetime(movies_df['release_date'], errors='coerce').dt.year.fillna(2000).astype(int)
    
    # Xử lý Thể loại (Genre Sets cho Jaccard)
    if not genres_df.empty:
        genres_grouped = genres_df.groupby('movie_id')['genre_name'].apply(lambda x: ' '.join(x)).reset_index()
        movies_df = movies_df.merge(genres_grouped, on='movie_id', how='left')
    else:
        movies_df['genre_name'] = ''
        
    movies_df['genre_name'] = movies_df['genre_name'].fillna('')
    movies_df['genre_set'] = movies_df['genre_name'].apply(lambda x: set(x.split()) if x else set())
    
    # Chỉ dùng description cho Semantic Transformer (theo yêu cầu mới nhất)
    movies_df['semantic_text'] = movies_df['description'].fillna('Movie description not available.')
    
    return movies_df, ratings_df

def train_content_based_semantic(movies_df):
    print("Đang tải mô hình Sentence Transformer (all-MiniLM-L6-v2)...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Đang tạo Semantic Embeddings cho Descriptions...")
    embeddings = model.encode(movies_df['semantic_text'].tolist(), show_progress_bar=True)
    
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / (norms + 1e-10)
    
    return embeddings

def compute_cf_matrices(df):
    print("Đang tính toán ma trận Collaborative Filtering (Z-score)...")
    if df.empty: return None
    user_item_matrix = df.pivot(index='user_id', columns='movie_id', values='rating_value')
    user_mean = user_item_matrix.mean(axis=1)
    user_std = user_item_matrix.std(axis=1).replace(0, 1.0).fillna(1.0)
    user_item_norm = user_item_matrix.sub(user_mean, axis=0).div(user_std, axis=0).fillna(0)
    
    cf_similarity = cosine_similarity(user_item_norm.T)
    cf_sim_df = pd.DataFrame(cf_similarity, index=user_item_norm.columns, columns=user_item_norm.columns)
    
    return {'cf_sim_df': cf_sim_df, 'user_item_norm': user_item_norm, 'user_mean': user_mean, 'user_std': user_std}

def build_main_model():
    print("\n" + "="*20 + " HUẤN LUYỆN HỆ THỐNG GỢI Ý HYBRID OPTIMIZED " + "="*20)
    movies_df, ratings_df, genres_df = load_data()
    movies_df, ratings_df = preprocess_data(movies_df, ratings_df, genres_df)
    
    # 1. Embeddings (Description only)
    embeddings = train_content_based_semantic(movies_df)
    
    # 2. Collaborative Filtering
    cf_data = compute_cf_matrices(ratings_df)
    
    # 3. Đóng gói mô hình với đầy đủ metadata
    model_package = {
        'movie_ids': movies_df['movie_id'].tolist(),
        'content_embeddings': embeddings,
        'directors': movies_df['director'].tolist(),
        'years': movies_df['year'].tolist(),
        'genre_sets': movies_df['genre_set'].tolist(),
        'cf_sim_df': cf_data['cf_sim_df'],
        'user_item_norm': cf_data['user_item_norm'],
        'user_mean': cf_data['user_mean'],
        'user_std': cf_data['user_std']
    }

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    PKL_PATH = os.path.join(BASE_DIR, 'cf_model.pkl')
    CSV_PATH = os.path.join(BASE_DIR, 'movies_metadata.csv')

    with open(PKL_PATH, 'wb') as f:
        pickle.dump(model_package, f)
    
    movies_df[['movie_id', 'title']].to_csv(CSV_PATH, index=False)
    print(f"--- HOÀN TẤT: Mô hình đã được lưu tại {PKL_PATH} ---")

if __name__ == "__main__":
    build_main_model()
