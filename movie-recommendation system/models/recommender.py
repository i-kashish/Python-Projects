"""
Recommendation Engine
Implements:
1. Content-Based Filtering (TF-IDF on genres, overview, director, cast)
2. Collaborative Filtering (User-Item matrix with cosine similarity)
3. Hybrid approach combining both
"""

import json
import os
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler


DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_data():
    with open(os.path.join(DATA_DIR, "movies.json")) as f:
        movies = json.load(f)
    with open(os.path.join(DATA_DIR, "ratings.json")) as f:
        ratings = json.load(f)
    return movies, ratings


class ContentBasedRecommender:
    """
    Recommends movies based on movie metadata similarity.
    Uses TF-IDF vectorization on a combined feature string of:
    genres, director, cast, and overview keywords.
    """

    def __init__(self, movies: list):
        self.movies = movies
        self.df = pd.DataFrame(movies)
        self.df["movie_id"] = self.df["id"]
        self._build_feature_matrix()

    def _build_feature_matrix(self):
        def make_soup(row):
            genres = " ".join(row.get("genres", []))
            director = row.get("director", "").replace(" ", "_")
            cast = " ".join([c.replace(" ", "_") for c in row.get("cast", [])])
            overview = row.get("overview", "")
            # Boost genres and director by repeating
            return f"{genres} {genres} {director} {director} {cast} {overview}"

        self.df["soup"] = self.df.apply(make_soup, axis=1)
        tfidf = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        tfidf_matrix = tfidf.fit_transform(self.df["soup"])
        self.cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        self.indices = pd.Series(self.df.index, index=self.df["id"])

    def get_recommendations(self, movie_id: int, top_n: int = 6) -> list:
        if movie_id not in self.indices:
            return []
        idx = self.indices[movie_id]
        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        # Skip the movie itself (index 0)
        sim_scores = sim_scores[1: top_n + 1]
        movie_indices = [i[0] for i in sim_scores]
        scores = [round(float(i[1]), 4) for i in sim_scores]
        result = self.df.iloc[movie_indices].to_dict("records")
        for i, movie in enumerate(result):
            movie["similarity_score"] = scores[i]
        return result


class CollaborativeFilteringRecommender:
    """
    Recommends movies based on user rating patterns.
    Uses item-item collaborative filtering with cosine similarity
    on the user-item rating matrix.
    """

    def __init__(self, movies: list, ratings: list):
        self.movies = {m["id"]: m for m in movies}
        self.ratings_df = pd.DataFrame(ratings)
        self._build_matrix()

    def _build_matrix(self):
        if self.ratings_df.empty:
            self.item_sim_df = pd.DataFrame()
            return

        # Pivot: rows=users, cols=movies, values=ratings
        self.matrix = self.ratings_df.pivot_table(
            index="user_id", columns="movie_id", values="rating"
        ).fillna(0)

        # Item-item similarity
        item_matrix = self.matrix.T
        item_similarity = cosine_similarity(item_matrix)
        self.item_sim_df = pd.DataFrame(
            item_similarity,
            index=item_matrix.index,
            columns=item_matrix.index,
        )

    def get_recommendations(self, movie_id: int, top_n: int = 6) -> list:
        if self.item_sim_df.empty or movie_id not in self.item_sim_df.index:
            return []

        sim_scores = self.item_sim_df[movie_id].sort_values(ascending=False)
        sim_scores = sim_scores.drop(movie_id, errors="ignore")
        top_ids = sim_scores.head(top_n).index.tolist()
        scores = sim_scores.head(top_n).values.tolist()

        result = []
        for movie_id_rec, score in zip(top_ids, scores):
            if movie_id_rec in self.movies:
                movie = dict(self.movies[movie_id_rec])
                movie["similarity_score"] = round(float(score), 4)
                result.append(movie)
        return result


class HybridRecommender:
    """
    Combines content-based and collaborative filtering recommendations.
    Weighted blend: 60% content-based + 40% collaborative.
    """

    def __init__(self):
        self.movies, self.ratings = load_data()
        self.cb = ContentBasedRecommender(self.movies)
        self.cf = CollaborativeFilteringRecommender(self.movies, self.ratings)
        self.movies_dict = {m["id"]: m for m in self.movies}

    def get_all_movies(self) -> list:
        return self.movies

    def get_movie_by_id(self, movie_id: int):
        return self.movies_dict.get(movie_id)

    def search_movies(self, query: str) -> list:
        query = query.lower()
        results = []
        for movie in self.movies:
            if (
                query in movie["title"].lower()
                or query in movie.get("overview", "").lower()
                or any(query in g.lower() for g in movie.get("genres", []))
                or query in movie.get("director", "").lower()
            ):
                results.append(movie)
        return results

    def get_recommendations(self, movie_id: int, top_n: int = 6, method: str = "hybrid") -> list:
        if method == "content":
            return self.cb.get_recommendations(movie_id, top_n)
        elif method == "collaborative":
            return self.cf.get_recommendations(movie_id, top_n)
        else:
            # Hybrid: merge and re-rank
            cb_recs = self.cb.get_recommendations(movie_id, top_n * 2)
            cf_recs = self.cf.get_recommendations(movie_id, top_n * 2)

            scores = {}
            for movie in cb_recs:
                mid = movie["id"]
                scores[mid] = scores.get(mid, 0) + 0.6 * movie["similarity_score"]
            for movie in cf_recs:
                mid = movie["id"]
                scores[mid] = scores.get(mid, 0) + 0.4 * movie["similarity_score"]

            sorted_ids = sorted(scores, key=scores.get, reverse=True)[:top_n]
            result = []
            for mid in sorted_ids:
                if mid in self.movies_dict:
                    m = dict(self.movies_dict[mid])
                    m["similarity_score"] = round(scores[mid], 4)
                    result.append(m)
            return result

    def get_recommendations_by_genre(self, genre: str, top_n: int = 8) -> list:
        genre = genre.lower()
        genre_movies = [
            m for m in self.movies
            if any(genre in g.lower() for g in m.get("genres", []))
        ]
        return sorted(genre_movies, key=lambda x: x.get("rating", 0), reverse=True)[:top_n]

    def get_top_rated(self, top_n: int = 10) -> list:
        return sorted(self.movies, key=lambda x: x.get("rating", 0), reverse=True)[:top_n]

    def get_all_genres(self) -> list:
        genres = set()
        for movie in self.movies:
            genres.update(movie.get("genres", []))
        return sorted(list(genres))


# Singleton instance
_recommender = None


def get_recommender() -> HybridRecommender:
    global _recommender
    if _recommender is None:
        _recommender = HybridRecommender()
    return _recommender
