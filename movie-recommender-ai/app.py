from flask import Flask, jsonify, request
import pandas as pd
import numpy as np
from sqlalchemy import create_engine
from flask_cors import CORS
import pickle

app = Flask(__name__)
CORS(app)

DB_URL = "mssql+pyodbc://Web:123456@localhost:1433/Movie?driver=ODBC+Driver+17+for+SQL+Server"

# Globals
movie_ids = []
content_embeddings = None
cf_sim_df = None
user_item_norm = None
user_mean = None
user_std = None
popular_movies = []

def init_models():
    global movie_ids, content_embeddings, cf_sim_df, user_item_norm, user_mean, user_std, popular_movies
    print("--- AI System: Loading Semantic Hybrid Models ---")
    try:
        if not os.path.exists('cf_model.pkl'):
            print("File cf_model.pkl not found. Please run train.py first.")
            return

        with open('cf_model.pkl', 'rb') as f:
            model_data = pickle.load(f)
            movie_ids = model_data.get('movie_ids', [])
            content_embeddings = model_data.get('content_embeddings')
            cf_sim_df = model_data.get('cf_sim_df')
            user_item_norm = model_data.get('user_item_norm')
            user_mean = model_data.get('user_mean')
            user_std = model_data.get('user_std')

        # Fallback: Popular movies
        engine = create_engine(DB_URL)
        r_df = pd.read_sql("SELECT movie_id, rating_value FROM RATINGS", engine)
        stats = r_df.groupby('movie_id')['rating_value'].agg(['count', 'mean'])
        popular_movies_stats = stats[stats['count'] > 5].sort_values(by='mean', ascending=False).head(20)
        popular_movies = [{"movie_id": int(mid), "predicted_rating": round(float(row['mean']), 2)} 
                          for mid, row in popular_movies_stats.iterrows()]
        
        print("--- AI System: Semantic Hybrid System Ready ---")
    except Exception as e:
        print(f"Error during init: {e}")

import os
init_models()

def get_content_similarity(movie_id, liked_items):
    """Tính độ tương đồng nội dung bằng dot product trực tiếp (không dùng FAISS)"""
    if content_embeddings is None or movie_id not in movie_ids:
        return 0.0
    
    try:
        idx_m = movie_ids.index(movie_id)
        vec_m = content_embeddings[idx_m]
        
        # Lấy vector các phim user đã thích kèm theo rating
        valid_indices = []
        valid_ratings = []
        for lid, rating in liked_items.items():
            if lid in movie_ids:
                valid_indices.append(movie_ids.index(lid))
                valid_ratings.append(rating)
                
        if not valid_indices: return 0.0
        
        vec_liked = content_embeddings[valid_indices]
        valid_ratings = np.array(valid_ratings)
        
        # Độ tương đồng = dot product (vì embeddings đã được normalize L2 trong train.py)
        sims = np.dot(vec_liked, vec_m)
        
        # Tính điểm có trọng số (Weighted Average) dựa trên rating
        return float(np.sum(sims * valid_ratings) / np.sum(valid_ratings))
    except:
        return 0.0

def predict_rating_hybrid(user_id, movie_id, k=10):
    try:
        if user_id not in user_mean.index: return 0.0
        
        u_ratings = user_item_norm.loc[user_id]
        rated_ids = u_ratings[u_ratings != 0].index
        
        # 1. Collaborative Filtering Score
        cf_score = 0
        if cf_sim_df is not None and movie_id in cf_sim_df.columns:
            sims_cf = cf_sim_df.loc[movie_id, rated_ids]
            top_k_cf = sims_cf.sort_values(ascending=False).head(k)
            if top_k_cf.abs().sum() > 0:
                cf_score = np.dot(top_k_cf, u_ratings[top_k_cf.index]) / top_k_cf.abs().sum()

        # 2. Semantic Content-Based Score
        cb_score = 0
        liked_items = u_ratings[u_ratings > 0]
        if len(liked_items) > 0:
            cb_score = get_content_similarity(movie_id, liked_items)

        # 3. Hybrid Combination (70% Hành vi + 30% Nội dung)
        hybrid_norm_score = 0.7 * cf_score + 0.3 * cb_score
        
        # 4. Denormalize
        u_std = user_std[user_id] if user_std is not None else 1.0
        final_pred = user_mean[user_id] + u_std * hybrid_norm_score
        
        return round(float(max(1.0, min(5.0, final_pred))), 2)
    except:
        return round(float(user_mean[user_id]), 2) if user_id in user_mean.index else 0.0

def recommend_for_user(user_id, top_k=10):
    user_id = int(user_id)
    if user_mean is None or user_id not in user_mean.index:
        return popular_movies[:top_k]
        
    u_ratings = user_item_norm.loc[user_id]
    rated_movie_ids = u_ratings[u_ratings != 0].index.tolist()
    
    # Lấy toàn bộ danh sách movie_id từ mô hình
    unrated_movies = [mid for mid in movie_ids if mid not in rated_movie_ids]
    
    predictions = []
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
