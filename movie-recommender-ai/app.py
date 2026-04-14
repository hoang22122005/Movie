from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)

DB_URL = "postgresql+psycopg2://postgres:E,!kA%40x65J?377f@db.matjcxyattaokehxibbk.supabase.co:5432/postgres"

# Globals
movie_ids = []
content_embeddings = None
directors = []
years = []
genre_sets = []
cf_sim_df = None
user_item_norm = None
user_mean = None
user_std = None
popular_movies = []

# Trọng số cố định (Đồng bộ với evaluate.py)
FIXED_ALPHA = 0.7  # 70% CF, 30% CB
BETA_GENRE = 0.4  # Độ tương tự Thể loại (Jaccard Similarity)
BETA_DESC = 0.3   # Độ tương tự Ngữ nghĩa (Sentence Transformers NLP + Cosine Similarity)
BETA_DIR = 0.2    # Khớp tuyệt đối Đạo diễn (Exact Match)
BETA_DATE = 0.1   # Độ tương tự Thời gian phát hành (Recency Decay)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'cf_model.pkl')

def init_models():
    global movie_ids, content_embeddings, directors, years, genre_sets
    global cf_sim_df, user_item_norm, user_mean, user_std, popular_movies
    print("--- AI System: Loading Advanced Hybrid Models ---")
    try:
        if not os.path.exists(MODEL_PATH):
            print(f"File {MODEL_PATH} not found. Please run train.py first.")
            return

        with open(MODEL_PATH, 'rb') as f:
            model_data = pickle.load(f)
            movie_ids = model_data.get('movie_ids', [])
            content_embeddings = model_data.get('content_embeddings')
            directors = model_data.get('directors', [])
            years = model_data.get('years', [])
            genre_sets = model_data.get('genre_sets', [])
            cf_sim_df = model_data.get('cf_sim_df')
            user_item_norm = model_data.get('user_item_norm')
            user_mean = model_data.get('user_mean')
            user_std = model_data.get('user_std')

        # Fallback: Phim phổ biến (Top ratings)
        engine = create_engine(DB_URL)
        r_df = pd.read_sql('SELECT movie_id, rating_value FROM "ratings"', engine)
        stats = r_df.groupby('movie_id')['rating_value'].agg(['count', 'mean'])
        popular_movies_stats = stats[stats['count'] > 5].sort_values(by='mean', ascending=False).head(20)
        popular_movies = [{"movie_id": int(mid), "predicted_rating": round(float(row['mean']), 2)} 
                          for mid, row in popular_movies_stats.iterrows()]
        
        print("--- AI System: Advanced Hybrid System Ready ---")
        
    except Exception as e:
        print(f"Error during init: {e}")

init_models()

def get_content_score(movie_id, rated_indices, rated_ratings):
    """Tính điểm Content dựa trên 4 thành phần (Genre, Desc, Dir, Date)"""
    if movie_id not in movie_ids: return 0.0
    
    idx_m = movie_ids.index(movie_id)
    rated_ratings = np.array(rated_ratings)
    
    # 1. Genre Score (Jaccard)
    m_g = genre_sets[idx_m]
    sims_genre = np.array([
        len(m_g & genre_sets[i]) / max(len(m_g | genre_sets[i]), 1)
        for i in rated_indices
    ])
    cb_genre = float(np.dot(sims_genre, rated_ratings) / sims_genre.sum()) if sims_genre.sum() > 0 else 0.0

    # 2. Description Score (Semantic)
    vec_m = content_embeddings[idx_m]
    vec_liked = content_embeddings[rated_indices]
    sims_desc = np.dot(vec_liked, vec_m)
    denom_desc = np.abs(sims_desc).sum()
    cb_desc = float(np.dot(sims_desc, rated_ratings) / denom_desc) if denom_desc > 0 else 0.0

    # 3. Director Score (Exact Match)
    m_dir = directors[idx_m]
    sims_dir = np.array([1.0 if directors[i] == m_dir else 0.0 for i in rated_indices])
    cb_dir = float(np.dot(sims_dir, rated_ratings) / sims_dir.sum()) if sims_dir.sum() > 0 else 0.0

    # 4. Release Date Score (Decay)
    m_yr = years[idx_m]
    sims_date = 1.0 / (1.0 + np.abs(np.array([years[i] for i in rated_indices]) - m_yr) / 10.0)
    cb_date = float(np.dot(sims_date, rated_ratings) / sims_date.sum()) if sims_date.sum() > 0 else 0.0

    # Tổng hợp điểm Content
    return (BETA_GENRE * cb_genre + BETA_DESC * cb_desc + BETA_DIR * cb_dir + BETA_DATE * cb_date)

def predict_rating_hybrid(user_id, movie_id, k=10):
    try:
        if user_id not in user_mean.index: return 0.0
        
        u_ratings = user_item_norm.loc[user_id]
        liked_ratings = u_ratings[u_ratings > 0]
        rated_ids = u_ratings[u_ratings != 0].index
        
        # 1. Collaborative Filtering Score
        cf_score = 0
        if cf_sim_df is not None and movie_id in cf_sim_df.columns:
            sims_cf = cf_sim_df.loc[movie_id, rated_ids]
            top_k_cf = sims_cf.sort_values(ascending=False).head(k)
            if top_k_cf.abs().sum() > 0:
                cf_score = np.dot(top_k_cf, u_ratings[top_k_cf.index]) / top_k_cf.abs().sum()

        # 2. Advanced Content-Based Score
        cb_score = 0
        if len(liked_ratings) > 0:
            rated_indices = [movie_ids.index(lid) for lid in liked_ratings.index if lid in movie_ids]
            rated_vals = [liked_ratings[movie_ids[i]] for i in rated_indices]
            if rated_indices:
                cb_score = get_content_score(movie_id, rated_indices, rated_vals)

        # 3. Hybrid Combination (70% CF + 30% CB)
        hybrid_norm_score = FIXED_ALPHA * cf_score + (1 - FIXED_ALPHA) * cb_score
        
        # 4. Denormalize
        u_std_val = user_std[user_id] if user_std is not None else 1.0
        final_pred = user_mean[user_id] + u_std_val * hybrid_norm_score
        
        return round(float(max(1.0, min(5.0, final_pred))), 2)
    except Exception as e:
        print(f"Prediction error for M{movie_id}: {e}")
        return round(float(user_mean[user_id]), 2) if user_id in user_mean.index else 0.0

def recommend_for_user(user_id, top_k=8):
    user_id = int(user_id)
    if user_mean is None or user_id not in user_mean.index:
        return popular_movies[:top_k]
        
    u_ratings = user_item_norm.loc[user_id]
    rated_movie_ids = u_ratings[u_ratings != 0].index.tolist()
    unrated_movies = [mid for mid in movie_ids if mid not in rated_movie_ids]
    
    predictions = []
    # Chỉ predict những phim có dữ liệu content hoặc cf
    for m_id in unrated_movies:
        score = predict_rating_hybrid(user_id, m_id)
        predictions.append({"movie_id": int(m_id), "predicted_rating": score})
        
    predictions.sort(key=lambda x: x['predicted_rating'], reverse=True)
    res = predictions[:top_k]
    return res if res else popular_movies[:top_k]

@app.route('/predict', methods=['GET'])
def predict_endpoint():
    u_id = request.args.get('user_id')
    if not u_id: return jsonify({"error": "Missing user_id"}), 400
    try:
        recs = recommend_for_user(int(u_id))
        return jsonify({"user_id": int(u_id), "recommendations": recs})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

import os

if __name__ == '__main__':
    # Render sẽ cấp port qua biến môi trường PORT, mặc định là 5000 nếu chạy local
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
