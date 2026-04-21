import os
import pandas as pd
from sqlalchemy import create_engine
import numpy as np
import pickle
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer

# --- SETTINGS / DB CONNECTION ---
DB_URL = "postgresql+psycopg2://postgres.matjcxyattaokehxibbk:E%2C%21kA%40x65J%3F377f@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# --- THUẬT TOÁN WEIGHTS (ĐỒNG BỘ TỪ EVALUATE.PY) ---
FIXED_ALPHA = 0.7  # 70% CF, 30% CB
BETA_GENRE = 0.4  # Thể loại
BETA_DESC = 0.3   # Mô tả (NLP)
BETA_DIR = 0.2    # Đạo diễn
BETA_DATE = 0.1   # Năm sản xuất

def load_data():
    engine = create_engine(DB_URL)
    # Lấy thêm director và release_date - Dùng nháy kép cho bảng viết HOA
    movies_df = pd.read_sql('SELECT movie_id, title, description, director, release_date FROM "movies"', engine)
    ratings_df = pd.read_sql('SELECT user_id, movie_id, rating_value FROM "ratings"', engine)
    genres_df = pd.read_sql("""
        SELECT mg.movie_id, g.genre_name 
        FROM "movie_genres" mg
        JOIN "genres" g ON mg.genre_id = g.genre_id
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

def compute_prediction(u_id, m_id, model_data):
    """Thuật toán dự đoán Hybrid từ evaluate.py"""
    u_norm     = model_data['user_item_norm']
    u_mean     = model_data['user_mean']
    u_std      = model_data['user_std']
    cf_sim_df  = model_data['cf_sim_df']
    movie_ids  = model_data['movie_ids']
    emb        = model_data['content_embeddings']
    directors  = model_data['directors']
    years      = model_data['years']
    genre_sets = model_data['genre_sets']

    if u_id not in u_mean.index: return 3.0
    u_m = float(u_mean[u_id])
    u_s = float(u_std[u_id]) if u_id in u_std.index else 1.0

    # 1. CF Score
    cf_score = 0.0
    if m_id in cf_sim_df.columns:
        liked_row = u_norm.loc[u_id]
        rated = liked_row[liked_row != 0].index
        if len(rated):
            sims = cf_sim_df.loc[m_id, rated]
            top_k = sims.nlargest(10)
            if top_k.abs().sum() > 0:
                cf_score = float(np.dot(top_k, u_norm.loc[u_id, top_k.index]) / top_k.abs().sum())

    # 2. CB Score
    cb_score = 0.0
    if m_id in movie_ids:
        idx_m = movie_ids.index(m_id)
        liked_ratings = u_norm.loc[u_id][u_norm.loc[u_id] > 0]
        v_idx = [movie_ids.index(lid) for lid in liked_ratings.index if lid in movie_ids]
        v_rat = np.array([liked_ratings[movie_ids[i]] for i in v_idx], dtype=float)
        
        if v_idx:
            # Genre (Jaccard)
            mg = genre_sets[idx_m]
            jac = np.array([len(mg & genre_sets[i]) / max(len(mg | genre_sets[i]), 1) for i in v_idx])
            s_genre = float(np.dot(jac, v_rat) / jac.sum()) if jac.sum() > 0 else 0.0
            # Desc (Semantic)
            d = np.dot(emb[v_idx], emb[idx_m])
            s_desc = float(np.dot(d, v_rat) / np.abs(d).sum()) if np.abs(d).sum() > 0 else 0.0
            # Dir (Exact)
            md = directors[idx_m]
            dm = np.array([1.0 if directors[i] == md else 0.0 for i in v_idx])
            s_dir = float(np.dot(dm, v_rat) / dm.sum()) if dm.sum() > 0 else 0.0
            # Date (Decay)
            my = years[idx_m]
            yd = 1.0 / (1.0 + np.abs(np.array([years[i] for i in v_idx]) - my) / 10.0)
            s_date = float(np.dot(yd, v_rat) / yd.sum()) if yd.sum() > 0 else 0.0
            
            cb_score = (BETA_GENRE * s_genre + BETA_DESC * s_desc + BETA_DIR * s_dir + BETA_DATE * s_date)

    hybrid = FIXED_ALPHA * cf_score + (1 - FIXED_ALPHA) * cb_score
    return max(1.0, min(5.0, u_m + u_s * hybrid))

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

    # 4. Đánh giá nhanh (Quick Validation)
    print("\n" + "-"*10 + " KIỂM CHỨNG MÔ HÌNH (QUICK EVAL) " + "-"*10)
    test_users = ratings_df['user_id'].unique()[:5] # Test nhanh 5 user
    for uid in test_users:
        u_data = ratings_df[ratings_df['user_id'] == uid].iloc[0] # Lấy 1 phim đã xem
        pred = compute_prediction(uid, u_data['movie_id'], model_package)
        print(f"User {uid} - Phim {u_data['movie_id']}: Thực tế {u_data['rating_value']} | Dự đoán {pred:.2f}")

if __name__ == "__main__":
    build_main_model()
