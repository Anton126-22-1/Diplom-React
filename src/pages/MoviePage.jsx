import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/moviePage.Module.css";
import imdbLogo from "/imbd_logo.png";
import rtLogo from "/rt.jpg";
import Modal from "../components/Modal/Modal.jsx";
import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from "../utils/localStorageFavoriteUtils";

function getWeekDates() {
  const today = new Date();
  const dayIndex = (today.getDay() + 6) % 7; // Monday=0 … Sunday=6
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayIndex);
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function MoviePage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [sessionsByDate, setSessionsByDate] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [votes, setVotes] = useState({ like: 0, dislike: 0 });
  const [userRating, setUserRating] = useState(null);

  // --- Стан слайдера акторів ---
  const [actors, setActors] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [visibleSlides, setVisibleSlides] = useState(3);

  // --- Керування слайдером ---
  const handleNextSlide = () => {
  const maxIndex = actors.length - visibleSlides;
  setCurrentSlideIndex((prevIndex) => (prevIndex >= maxIndex ? 0 : prevIndex + 1));
};

const handlePrevSlide = () => {
  const maxIndex = actors.length - visibleSlides;
  setCurrentSlideIndex((prevIndex) => (prevIndex <= 0 ? maxIndex : prevIndex - 1));
};

  // Адаптивність: кількість видимих слайдів
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) setVisibleSlides(1);
      else if (window.innerWidth < 900) setVisibleSlides(2);
      else if (window.innerWidth < 1200) setVisibleSlides(3);
      else setVisibleSlides(4);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchMovieAndSessions = async () => {
      try {
        const responseMovie = await fetch("/data/movies.json");
        const movies = await responseMovie.json();
        const movieData = movies.find((m) => String(m.id) === id);
        if (!movieData) throw new Error("Movie not found");
        setMovie(movieData);

        const responseSessions = await fetch("/data/sessions.json");
        const sessions = await responseSessions.json();

        const week = getWeekDates();
        const grouped = week.map((date) => {
          const key = date.toISOString().split("T")[0];
          const times = sessions
            .filter((s) => String(s.movieId) === id && s.date === key)
            .map((s) => s.time);
          return { date, times };
        });
        setSessionsByDate(grouped);

        // --- Завантаження акторів ---
        const responseActors = await fetch("/data/actors.json");
        const actorsData = await responseActors.json();
        const movieActors = actorsData.find((a) => String(a.movieId) === id);
        if (movieActors) setActors(movieActors.cast);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchMovieAndSessions();
  }, [id]);

  // --- Favorites ---
  useEffect(() => {
    const favorites = getFavoritesFromLocalStorage();
    setIsFavorite(favorites.includes(Number(id)));
  }, [id]);

  // --- User votes ---
  useEffect(() => {
    const votesStore = JSON.parse(localStorage.getItem("movieVotes") || "{}");
    if (votesStore[id]) setVotes(votesStore[id]);

    const ratingsStore = JSON.parse(localStorage.getItem("userMovieRatings") || "{}");
    const currentUser = localStorage.getItem("currentUser");
    if (ratingsStore[currentUser]?.[id]) setUserRating(ratingsStore[currentUser][id]);
  }, [id]);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFavoriteFromLocalStorage(movie.id);
      setIsFavorite(false);
    } else {
      addFavoriteToLocalStorage(movie);
      setIsFavorite(true);
    }
  };

  const handleUserRating = (type) => {
    const currentUser = localStorage.getItem("currentUser");
    const votesStore = JSON.parse(localStorage.getItem("movieVotes") || "{}");
    const ratingsStore = JSON.parse(localStorage.getItem("userMovieRatings") || "{}");

    if (!votesStore[id]) votesStore[id] = { like: 0, dislike: 0 };
    if (!ratingsStore[currentUser]) ratingsStore[currentUser] = {};

    const prevRating = ratingsStore[currentUser][id];

    if (prevRating === type) {
      votesStore[id][type] -= 1;
      delete ratingsStore[currentUser][id];
      setUserRating(null);
    } else {
      if (prevRating) votesStore[id][prevRating] -= 1;
      votesStore[id][type] += 1;
      ratingsStore[currentUser][id] = type;
      setUserRating(type);
    }

    setVotes(votesStore[id]);
    localStorage.setItem("movieVotes", JSON.stringify(votesStore));
    localStorage.setItem("userMovieRatings", JSON.stringify(ratingsStore));
  };

  if (!movie) return <div className="loading">Loading...</div>;

  const {
    poster,
    title,
    releaseDate,
    country,
    duration,
    ageRestriction,
    genres,
    ratings,
    description,
    trailerLink,
  } = movie;

  const ytId = new URL(trailerLink).searchParams.get("v");
  const nonEmpty = sessionsByDate.filter((g) => g.times.length > 0);

  async function handleOrderClick() {
    try {
      const response = await fetch("/data/sessions.json");
      const sessions = await response.json();
      const sessionsForThisMovie = sessions.filter((s) => String(s.movieId) === id);
      if (sessionsForThisMovie.length > 0) {
        setSelectedSession({
          poster,
          title,
          hall: sessionsForThisMovie[0].hall,
        });
      }
    } catch (error) {
      console.error("Error fetching session:", error);
    }
  }

  const week = getWeekDates();
  const start = week[0];
  const end = week[week.length - 1];
  const fmt = (d) => `${d.getMonth() + 1}.${d.getDate()}`;
  const rangeLabel = `${fmt(start)}-${fmt(end)}`;

  return (
    <div className="movie-page">
      <div className="movie-header">
        <img className="movie-poster" src={poster} alt={`${title} poster`} />
        <div className="movie-basic-info">
          <h1 className="movie-title">{title} ({new Date(releaseDate).getFullYear()})</h1>
          <p><strong>Premiere:</strong> {releaseDate}</p>
          <p><strong>Country:</strong> {country}</p>
          <p><strong>Duration:</strong> {duration}</p>
          <p><strong>Age Restriction:</strong> {ageRestriction}</p>
          <p><strong>Genres:</strong> {genres.join(", ")}</p>

          <div className="ratings-inline">
            <div className="rating-inline-item">
              <img className="rating-logo" src={imdbLogo} alt="IMDb" />
              <span className="rating-value">{ratings.imdb}</span>
            </div>
            <div className="rating-inline-item">
              <img className="rating-logo" src={rtLogo} alt="RT" />
              <span className="rating-value">{ratings.rottenTomatoes}%</span>
            </div>
          </div>

          <div className="expectation-rating">
            <p className="expectation-title">Рейтинг очікування ({votes.like + votes.dislike} голосів)</p>
            <div className="expectation-bar">
              <div
                className="expectation-bar-like"
                style={{
                  width: votes.like + votes.dislike > 0
                    ? `${(votes.like / (votes.like + votes.dislike)) * 100}%`
                    : "0%",
                }}
              />
              <div
                className="expectation-bar-dislike"
                style={{
                  width: votes.like + votes.dislike > 0
                    ? `${(votes.dislike / (votes.like + votes.dislike)) * 100}%`
                    : "0%",
                }}
              />
            </div>

            <div className="expectation-buttons">
              <button className={`expect-btn ${userRating === "like" ? "active" : ""}`} onClick={() => handleUserRating("like")}>Чекаю</button>
              <button className={`expect-btn ${userRating === "dislike" ? "active" : ""}`} onClick={() => handleUserRating("dislike")}>Не чекаю</button>
            </div>
          </div>
        </div>

        <button
          className="favorite-button"
          onClick={toggleFavorite}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <img
            src={isFavorite ? "/icons/close.svg" : "/icons/heart_icon.svg"}
            alt={isFavorite ? "Remove from favorites" : "Add to favorites"}
          />
        </button>
      </div>

      <div className="movie-body">
        <aside className="sessions-sidebar">
          <h2>Sessions this week ({rangeLabel})</h2>
          <ul className="sessions-list">
            {nonEmpty.map(({ date, times }) => (
              <li key={date.toISOString()} className="session-item">
                <div className="session-day">{date.toLocaleDateString("en-US", { weekday: "long" })}</div>
                <div className="session-times">{times.map((t, i) => (<span key={i}>{t}</span>))}</div>
              </li>
            ))}
          </ul>
          <button className="book-button" onClick={handleOrderClick}>Order a ticket</button>
        </aside>

        <div className="movie-details">
          <section className="movie-description">
            <h2>Description</h2>
            <p>{description}</p>
          </section>

          <section className="movie-trailer">
            <h2>Trailer</h2>
            <div className="video-container">
              <iframe
                title={`${title} Trailer`}
                src={`https://www.youtube.com/embed/${ytId}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* --- Слайдер акторів --- */}
            {actors.length > 0 && (
              <div className="sliderWrapper">
                <div
                  className="sliderTrack"
                  style={{
                    transform: `translateX(-${currentSlideIndex * (100 / visibleSlides)}%)`,
                    width: `${(actors.length / visibleSlides) * 100}%`,
                  }}
                >
                  {actors.map((actor, index) => (
                    <div
                      key={index}
                      className="slide"
                      style={{ flex: `0 0 ${100 / visibleSlides}%` }}
                    >
                      <img src={actor.photo} alt={actor.name} className="slideImage" />
                      <h3 className="slideTitle">{actor.name}</h3>
                      <p className="slideRole">{actor.role}</p>
                    </div>
                  ))}
                </div>

                <div className="sliderNavigation">
                  <div className="scrollbarLeftArrow" onClick={handlePrevSlide}>
                    <img className="arrowImage" src="/Arrow-L.svg" alt="Left" />
                  </div>
                  <div className="scrollbarRightArrow" onClick={handleNextSlide}>
                    <img className="arrowImage" src="/Arrow-R.svg" alt="Right" />
                  </div>
                </div>
              </div>
            )}

          </section>

          {selectedSession && (
            <Modal
              isOpen
              onClose={() => setSelectedSession(null)}
              poster={selectedSession.poster}
              title={selectedSession.title}
              hall={selectedSession.hall}
            />
          )}
        </div>
      </div>
    </div>
  );
}
