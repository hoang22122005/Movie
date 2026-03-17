import os
import pandas as pd
from sqlalchemy import create_engine
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sentence_transformers import SentenceTransformer
import pickle

# --- KẾT NỐI DATABASE ---
DB_URL = "mssql+pyodbc://Web:123456@localhost:1433/Movie?driver=ODBC+Driver+17+for+SQL+Server"

def load_data():
    engine = create_engine(DB_URL)
    movies_df = pd.read_sql("SELECT movie_id, title, description FROM MOVIES", engine)
    ratings_df = pd.read_sql("SELECT user_id, movie_id, rating_value FROM RATINGS", engine)
    genres_df = pd.read_sql("""
        SELECT mg.movie_id, g.genre_name FROM MOVIE_GENRES mg
        JOIN GENRES g ON mg.genre_id = g.genre_id
    """, engine)
    return movies_df, ratings_df, genres_df

def get_semantic_model(movies_df):
    """Tạo Embeddings phục vụ đánh giá """
    print("Đang chuẩn bị Semantic Model cho quá trình đánh giá...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    text_data = ("Movie Title: " + movies_df['title'].fillna('') + 
                 ". Genres: " + movies_df['genre_name'].fillna('') + 
                 ". Overview: " + movies_df['description'].fillna(''))
    embeddings = model.encode(text_data.tolist(), show_progress_bar=False)
    # Normalize L2
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / (norms + 1e-10)
    return movies_df['movie_id'].tolist(), embeddings

def compute_hybrid_prediction(u_id, m_id, model_data):
    """Dự đoán Hybrid: CF + Semantic"""
    cf_sim = model_data['cf_sim_df']
    u_norm = model_data['user_item_norm']
    u_mean = model_data['user_mean']
    u_std = model_data['user_std']
    
    cf_score = 0
    if u_id in u_mean.index and m_id in cf_sim.columns:
        u_ratings = u_norm.loc[u_id]
        rated_ids = u_ratings[u_ratings != 0].index
        if len(rated_ids) > 0:
            sims = cf_sim.loc[m_id, rated_ids]
            top_k = sims.sort_values(ascending=False).head(10)
            if top_k.abs().sum() > 0:
                cf_score = np.dot(top_k, u_norm.loc[u_id, top_k.index]) / top_k.abs().sum()

    # 2. Semantic Score
    cb_score = 0
    movie_ids = model_data['movie_ids']
    embeddings = model_data['embeddings']
    if m_id in movie_ids:
        idx_m = movie_ids.index(m_id)
        u_liked = u_norm.loc[u_id]
        liked_items = u_liked[u_liked > 0]
        
        valid_liked_indices = []
        valid_liked_ratings = []
        for lid, rating in liked_items.items():
            if lid in movie_ids:
                valid_liked_indices.append(movie_ids.index(lid))
                valid_liked_ratings.append(rating)
                
        if valid_liked_indices:
            valid_liked_ratings = np.array(valid_liked_ratings)
            # Dot product (Cosine sim)
            sims_cb = np.dot(embeddings[valid_liked_indices], embeddings[idx_m])
            # Weighted average based on cosine similarities
            if np.sum(np.abs(sims_cb)) > 0:
                cb_score = np.sum(sims_cb * valid_liked_ratings) / np.sum(np.abs(sims_cb))

    # 3. Combine
    hybrid_score = 0.8 * cf_score + 0.2 * cb_score
    u_std_val = u_std[u_id] if u_id in u_std.index else 1.0
    u_mean_val = u_mean[u_id] if u_mean is not None and u_id in u_mean.index else 3.0
    
    return max(1, min(5, u_mean_val + u_std_val * hybrid_score))

def run_evaluation(user_id=1):
    print(f"\n" + "="*15 + f" ĐÁNH GIÁ SEMANTIC HYBRID (KHÔNG FAISS) - USER ID: {user_id} " + "="*15)
    
    movies_df, ratings_df, genres_df = load_data()
    # Merge genres
    genres_grouped = genres_df.groupby('movie_id')['genre_name'].apply(lambda x: ' '.join(x)).reset_index()
    movies_df = movies_df.merge(genres_grouped, on='movie_id', how='left')
    
    # Chuẩn bị Content Model
    m_ids, embs = get_semantic_model(movies_df)
    
    user_data = ratings_df[ratings_df['user_id'] == user_id]
    other_data = ratings_df[ratings_df['user_id'] != user_id]
    
    if len(user_data) < 2:
        print("Không đủ dữ liệu.")
        return

    u_train, u_test = train_test_split(user_data, test_size=0.2, random_state=42)
    full_train = pd.concat([u_train, other_data])
    
    # Huấn luyện CF
    u_i_matrix = full_train.pivot(index='user_id', columns='movie_id', values='rating_value')
    u_mean = u_i_matrix.mean(axis=1)
    u_std = u_i_matrix.std(axis=1).replace(0, 1.0).fillna(1.0)
    u_norm = u_i_matrix.sub(u_mean, axis=0).div(u_std, axis=0).fillna(0)
    cf_sim = cosine_similarity(u_norm.T)
    cf_sim_df = pd.DataFrame(cf_sim, index=u_norm.columns, columns=u_norm.columns)
    
    model_data = {
        'cf_sim_df': cf_sim_df, 'user_item_norm': u_norm, 
        'user_mean': u_mean, 'user_std': u_std,
        'movie_ids': m_ids, 'embeddings': embs
    }
    
    results = []
    print(f"Đang kiểm tra độ hiệu quả trên {len(u_test)} phim ẩn...")
    for _, row in u_test.iterrows():
        pred = compute_hybrid_prediction(user_id, row['movie_id'], model_data)
        title = movies_df[movies_df['movie_id'] == row['movie_id']]['title'].values[0]
        results.append({'id': row['movie_id'], 'title': title, 'actual': row['rating_value'], 'pred': pred})
        
    res_df = pd.DataFrame(results).sort_values(by='pred', ascending=False)
    
    print("\n" + "-"*85)
    print(f"{'ID':<8} | {'Tên Phim (AI chưa nhìn thấy điểm)':<35} | {'Dự Đoán':<8} | {'Thực Tế'}")
    print("-" * 85)
    for _, r in res_df.iterrows():
        print(f"{int(r['id']):<8} | {r['title'][:35]:<35} | {r['pred']:<8.2f} | {r['actual']:.1f}")
    print("-" * 85)
    
    mae = abs(res_df['pred'] - res_df['actual']).mean()
    rmse = np.sqrt(((res_df['pred'] - res_df['actual']) ** 2).mean())
    
    print(f"==> Sai số tuyệt đối trung bình (MAE): {mae:.4f}")
    print(f"==> Lỗi bình phương trung bình căn (RMSE): {rmse:.4f}")
    print("="*85)

if __name__ == "__main__":
    run_evaluation(user_id=1)
