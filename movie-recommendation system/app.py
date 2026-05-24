"""
Movie Recommendation System - Flask Application
"""

from flask import Flask, render_template, jsonify, request, abort
import sys
import os

# Add parent dir to path
sys.path.insert(0, os.path.dirname(__file__))

from models.recommender import get_recommender

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


# ─── Pages ────────────────────────────────────────────────────────────────────

@app.route("/")
def index():
    recommender = get_recommender()
    top_movies = recommender.get_top_rated(10)
    genres = recommender.get_all_genres()
    return render_template("index.html", top_movies=top_movies, genres=genres)


@app.route("/movie/<int:movie_id>")
def movie_detail(movie_id):
    recommender = get_recommender()
    movie = recommender.get_movie_by_id(movie_id)
    if not movie:
        abort(404)
    recommendations = recommender.get_recommendations(movie_id, top_n=6, method="hybrid")
    return render_template("movie.html", movie=movie, recommendations=recommendations)


# ─── API Endpoints ────────────────────────────────────────────────────────────

@app.route("/api/movies")
def api_movies():
    recommender = get_recommender()
    movies = recommender.get_all_movies()
    return jsonify({"movies": movies, "total": len(movies)})


@app.route("/api/movies/<int:movie_id>")
def api_movie(movie_id):
    recommender = get_recommender()
    movie = recommender.get_movie_by_id(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    return jsonify(movie)


@app.route("/api/recommend/<int:movie_id>")
def api_recommend(movie_id):
    method = request.args.get("method", "hybrid")
    top_n = min(int(request.args.get("n", 6)), 20)

    if method not in ("hybrid", "content", "collaborative"):
        return jsonify({"error": "Invalid method. Use: hybrid, content, collaborative"}), 400

    recommender = get_recommender()
    movie = recommender.get_movie_by_id(movie_id)
    if not movie:
        return jsonify({"error": "Movie not found"}), 404

    recs = recommender.get_recommendations(movie_id, top_n=top_n, method=method)
    return jsonify({
        "movie": movie["title"],
        "method": method,
        "recommendations": recs,
    })


@app.route("/api/search")
def api_search():
    query = request.args.get("q", "").strip()
    if not query:
        return jsonify({"results": [], "query": query})
    recommender = get_recommender()
    results = recommender.search_movies(query)
    return jsonify({"results": results, "query": query, "total": len(results)})


@app.route("/api/genre/<genre>")
def api_by_genre(genre):
    recommender = get_recommender()
    movies = recommender.get_recommendations_by_genre(genre)
    return jsonify({"genre": genre, "movies": movies})


@app.route("/api/top")
def api_top():
    n = min(int(request.args.get("n", 10)), 30)
    recommender = get_recommender()
    movies = recommender.get_top_rated(n)
    return jsonify({"movies": movies})


@app.route("/api/genres")
def api_genres():
    recommender = get_recommender()
    genres = recommender.get_all_genres()
    return jsonify({"genres": genres})


# ─── Error Handlers ───────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
