# 🎬 CineMatch — Movie Recommendation System

A full-stack Python web app that recommends movies using **Content-Based Filtering**, **Collaborative Filtering**, and a **Hybrid approach** — built with Flask and scikit-learn.

![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-3.0-green)
![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5-orange)
![Deployed on Render](https://img.shields.io/badge/Deployed%20on-Render-purple)

---

## ✨ Features

- 🎯 **Content-Based Filtering** — TF-IDF on genres, director, cast & overview
- 👥 **Collaborative Filtering** — Item-item cosine similarity on user-rating matrix
- 🔀 **Hybrid Mode** — 60/40 weighted blend of both approaches
- 🔍 **Live Search** — Search movies by title, genre, director, or overview
- 🎭 **Genre Browsing** — Filter movies by genre
- 📱 **Responsive UI** — Works on mobile & desktop
- ⚡ **REST API** — JSON API for all recommendation endpoints

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/YOUR_USERNAME/movie-recommender.git
cd movie-recommender

python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Run Locally
```bash
python app.py
```
Open http://localhost:5000

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | All movies |
| GET | `/api/movies/<id>` | Movie by ID |
| GET | `/api/recommend/<id>` | Recommendations for a movie |
| GET | `/api/recommend/<id>?method=content` | Content-based only |
| GET | `/api/recommend/<id>?method=collaborative` | Collaborative only |
| GET | `/api/recommend/<id>?method=hybrid` | Hybrid (default) |
| GET | `/api/search?q=<query>` | Search movies |
| GET | `/api/genre/<genre>` | Movies by genre |
| GET | `/api/top?n=10` | Top-rated movies |
| GET | `/api/genres` | All genres |

### Example
```bash
curl http://localhost:5000/api/recommend/1?method=hybrid
```

---

## 🧠 How the Algorithms Work

### Content-Based Filtering
1. Builds a "feature soup" string for each movie: `genres + director + cast + overview`
2. Applies **TF-IDF vectorization** (bi-grams, English stop words removed)
3. Computes **cosine similarity** between all movie pairs
4. Returns top-N most similar movies

### Collaborative Filtering
1. Builds a **user-item rating matrix** (users × movies)
2. Transposes to item-user matrix
3. Computes **item-item cosine similarity**
4. Returns movies most similar to the target based on shared user preferences

### Hybrid
Combines both with a weighted average:
```
score = 0.6 × content_score + 0.4 × collaborative_score
```

---

## 📁 Project Structure

```
movie-recommender/
├── app.py                  # Flask app & routes
├── models/
│   └── recommender.py      # ML recommendation engine
├── data/
│   ├── movies.json         # Movie dataset (30 curated films)
│   ├── ratings.json        # Sample user ratings
│   └── generate_data.py    # Data generation script
├── templates/
│   ├── index.html          # Home page
│   ├── movie.html          # Movie detail page
│   └── 404.html            # Error page
├── static/
│   ├── css/style.css       # Cinematic dark theme
│   └── js/main.js          # Frontend interactions
├── Dockerfile              # Docker container config
├── render.yaml             # Render deployment config
├── requirements.txt        # Python dependencies
└── README.md
```

---

## ☁️ Deploy to Render

### Option A: Docker (Recommended)
1. Push code to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Render auto-detects `render.yaml` — click **Deploy**

### Option B: Manual Setup on Render
1. **New Web Service** → Connect repo
2. **Environment**: Docker
3. **Build Command**: *(auto from Dockerfile)*
4. **Start Command**: *(auto from Dockerfile)*
5. Set env var: `FLASK_ENV=production`

---

## 🔧 Extending the Project

### Add Real Movie Data
Replace `data/movies.json` with data from:
- **TMDB API**: https://developers.themoviedb.org/
- **MovieLens Dataset**: https://grouplens.org/datasets/movielens/

### Add User Authentication
```python
# Add to app.py
from flask_login import LoginManager, login_required
```

### Improve Recommendations
- Matrix Factorization (SVD) using `scipy.sparse.linalg.svds`
- Neural Collaborative Filtering with TensorFlow
- Add weighted ratings using Bayesian average

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, Flask 3.0 |
| ML | scikit-learn (TF-IDF, cosine similarity) |
| Data | pandas, numpy |
| Frontend | Vanilla JS, CSS3 |
| Server | Gunicorn |
| Container | Docker |
| Hosting | Render |

---

## 📝 License

MIT License — free to use and modify.

---

**Made with 🎬 and Python**
