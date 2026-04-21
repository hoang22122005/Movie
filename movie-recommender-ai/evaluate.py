import pandas as pd
from sqlalchemy import create_engine
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sentence_transformers import SentenceTransformer

DB_URL = "postgresql+psycopg2://postgres.matjcxyattaokehxibbk:E%2C%21kA%40x65J%3F377f@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres"

# --- TRONG SO CO DINH ---
FIXED_ALPHA = 0.7  # 70% CF, 30% CB
BETA_GENRE = 0.4  # Độ tương tự Thể loại (Jaccard Similarity)
BETA_DESC = 0.3   # Độ tương tự Ngữ nghĩa (Sentence Transformers NLP + Cosine Similarity)
BETA_DIR = 0.2    # Khớp tuyệt đối Đạo diễn (Exact Match)
BETA_DATE = 0.1   # Độ tương tự Thời gian phát hành (Recency Decay)

def load_data():
    engine = create_engine(DB_URL)
    movies_df  = pd.read_sql('SELECT movie_id, title, description, director, release_date FROM "movies"', engine)
    ratings_df = pd.read_sql('SELECT user_id, movie_id, rating_value FROM "ratings"', engine)
    genres_df  = pd.read_sql("""
        SELECT mg.movie_id, g.genre_name FROM "movie_genres" mg
        JOIN "genres" g ON mg.genre_id = g.genre_id
    """, engine)
    return movies_df, ratings_df, genres_df

def build_content_model(movies_df):
    print("Preparing Content Model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    text  = movies_df['description'].fillna('Movie description not available.')
    emb   = model.encode(text.tolist(), show_progress_bar=False)
    emb   = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-10)

    directors  = movies_df['director'].fillna('Unknown').tolist()
    years      = pd.to_datetime(movies_df['release_date'], errors='coerce').dt.year.fillna(2000).astype(int).tolist()
    genre_sets = [set(str(g).split()) if pd.notna(g) else set() for g in movies_df['genre_name']]
    return movies_df['movie_id'].tolist(), emb, directors, years, genre_sets

def compute_prediction(u_id, m_id, model_data):
    u_norm     = model_data['u_norm']
    u_mean     = model_data['u_mean']
    u_std      = model_data['u_std']
    cf_sim_df  = model_data['cf_sim_df']
    movie_ids  = model_data['movie_ids']
    emb        = model_data['emb']
    directors  = model_data['directors']
    years      = model_data['years']
    genre_sets = model_data['genre_sets']

    u_m = float(u_mean.get(u_id, 3.0))
    u_s = float(u_std.get(u_id, 1.0))

    # CF
    cf_score = 0.0
    if u_id in u_norm.index and m_id in cf_sim_df.columns:
        liked_row = u_norm.loc[u_id]
        rated = liked_row[liked_row != 0].index
        if len(rated):
            sims = cf_sim_df.loc[m_id, rated]
            top_k = sims.nlargest(10)
            if top_k.abs().sum() > 0:
                cf_score = float(np.dot(top_k, u_norm.loc[u_id, top_k.index]) / top_k.abs().sum())

    # CB
    cb_score = 0.0
    if m_id in movie_ids:
        idx_m = movie_ids.index(m_id)
        liked_row = u_norm.loc[u_id] if u_id in u_norm.index else pd.Series(dtype=float)
        liked_pos = liked_row[liked_row > 0]
        v_idx = [movie_ids.index(lid) for lid in liked_pos.index if lid in movie_ids]
        v_rat = np.array([liked_pos[movie_ids[i]] for i in v_idx], dtype=float)

        if v_idx:
            mg = genre_sets[idx_m]
            jac = np.array([len(mg & genre_sets[i]) / max(len(mg | genre_sets[i]), 1) for i in v_idx])
            s_genre = float(np.dot(jac, v_rat) / jac.sum()) if jac.sum() > 0 else 0.0
            d = np.dot(emb[v_idx], emb[idx_m])
            s_desc = float(np.dot(d, v_rat) / np.abs(d).sum()) if np.abs(d).sum() > 0 else 0.0
            md = directors[idx_m]
            dm = np.array([1.0 if directors[i] == md else 0.0 for i in v_idx])
            s_dir = float(np.dot(dm, v_rat) / dm.sum()) if dm.sum() > 0 else 0.0
            my = years[idx_m]
            yd = 1.0 / (1.0 + np.abs(np.array([years[i] for i in v_idx]) - my) / 10.0)
            s_date = float(np.dot(yd, v_rat) / yd.sum()) if yd.sum() > 0 else 0.0
            cb_score = (BETA_GENRE * s_genre + BETA_DESC * s_desc + BETA_DIR * s_dir + BETA_DATE * s_date)

    hybrid = FIXED_ALPHA * cf_score + (1 - FIXED_ALPHA) * cb_score
    return max(1.0, min(5.0, u_m + u_s * hybrid))

def run_evaluation_all_users(limit_users=None):
    print(f"\n{'='*70}")
    print(f"  ALL USERS EVALUATION")
    print(f"  Weights: CF={FIXED_ALPHA:.1f}, CB={1-FIXED_ALPHA:.1f}")
    print(f"{'='*70}")

    movies_df, ratings_df, genres_df = load_data()
    genres_grouped = genres_df.groupby('movie_id')['genre_name'].apply(' '.join).reset_index()
    movies_df = movies_df.merge(genres_grouped, on='movie_id', how='left')

    m_ids, emb, directors, years, genr = build_content_model(movies_df)

    ui = ratings_df.pivot(index='user_id', columns='movie_id', values='rating_value')
    u_mean = ui.mean(axis=1)
    u_std  = ui.std(axis=1).replace(0, 1.0).fillna(1.0)
    u_norm = ui.sub(u_mean, axis=0).div(u_std, axis=0).fillna(0)
    cf_sim = pd.DataFrame(cosine_similarity(u_norm.T), index=u_norm.columns, columns=u_norm.columns)

    model_data = {
        'u_norm': u_norm, 'u_mean': u_mean, 'u_std': u_std,
        'cf_sim_df': cf_sim, 'movie_ids': m_ids, 'emb': emb,
        'directors': directors, 'years': years, 'genre_sets': genr
    }

    all_user_ids = ratings_df['user_id'].unique()
    if limit_users:
        all_user_ids = all_user_ids[:limit_users]

    all_mae, all_rmse = [], []
    u1_res = []

    print(f"Calculating for {len(all_user_ids)} users...")
    for uid in all_user_ids:
        u_data = ratings_df[ratings_df['user_id'] == uid]
        if len(u_data) < 2: continue
        
        u_train, u_test = train_test_split(u_data, test_size=0.2, random_state=42)
        u_preds, u_actuals = [], []
        
        for _, row in u_test.iterrows():
            pred = compute_prediction(uid, row['movie_id'], model_data)
            u_preds.append(pred)
            u_actuals.append(row['rating_value'])
            
            if uid == 1:
                title = movies_df[movies_df['movie_id'] == row['movie_id']]['title'].values[0]
                u1_res.append({'title': title, 'actual': row['rating_value'], 'pred': pred})

        mae = np.mean(np.abs(np.array(u_preds) - np.array(u_actuals)))
        rmse = np.sqrt(np.mean((np.array(u_preds) - np.array(u_actuals))**2))
        all_mae.append(mae)
        all_rmse.append(rmse)

    # --- SHOW DETAILED LIST FOR USER 1 (SORTED BY PRED DESC) ---
    if u1_res:
        u1_df = pd.DataFrame(u1_res).sort_values(by='pred', ascending=False)
        print("\n" + "="*30 + " DETAILED RESULTS FOR USER ID: 1 " + "="*30)
        print(f"{'Movie Title':<45} | {'Prediction':<10} | Actual")
        print("-" * 88)
        for _, r in u1_df.iterrows():
            print(f"{r['title'][:45]:<45} | {r['pred']:<10.2f} | {r['actual']:.1f}")
        print("-" * 88)

    # --- FINAL SUMMARY ---
    print("\n" + "!"*70)
    print(f"  FINAL AVERAGE METRICS ({len(all_mae)} USERS)")
    print(f"  AVERAGE MAE  : {np.mean(all_mae):.4f}")
    print(f"  AVERAGE RMSE : {np.mean(all_rmse):.4f}")
    print("!" * 70)

if __name__ == "__main__":
    run_evaluation_all_users()
