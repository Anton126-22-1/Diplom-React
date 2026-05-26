import React, {
  useState,
  useEffect,
} from "react";

import {
  useParams,
} from "react-router-dom";

import "../styles/moviePage.Module.css";

import imdbLogo
from "/imbd_logo.png";

import rtLogo
from "/rt.jpg";

import Modal
from "../components/Modal/Modal.jsx";


function getWeekDates() {

  const today =
    new Date();

  const dayIndex =
    (today.getDay() + 6) % 7;

  const monday = new Date(today);
   monday.setHours(0, 0, 0, 0); 
   monday.setDate(today.getDate() - dayIndex);

  return Array.from({
    length: 7,
  }).map((_, i) => {

    const d =
      new Date(monday);

    d.setDate(
      monday.getDate() + i
    );

    return d;
  });
}

export default function MoviePage() {

  const { id } =
    useParams();

  const [movie,
    setMovie] =
    useState(null);

  const [sessionsByDate,
    setSessionsByDate] =
    useState([]);

  const [sessions,
    setSessions] =
    useState([]);

  const [selectedSession,
    setSelectedSession] =
    useState(null);

  const [isFavorite,
    setIsFavorite] =
    useState(false);

  const token =
    localStorage.getItem(
      "token"
    );


  useEffect(() => {

    const fetchData =
      async () => {

        try {

          const resMovie =
            await fetch(
              `http://localhost:5000/api/movies/${id}`
            );

          if (!resMovie.ok)
            throw new Error(
              "Movie not found"
            );

          const movieData =
            await resMovie.json();

          const resSessions =
            await fetch(
              `http://localhost:5000/api/sessions/${id}`
            );

          if (!resSessions.ok)
            throw new Error(
              "Sessions not found"
            );

          const sessionsData =
            await resSessions.json();

          setMovie(
            movieData
          );

          setSessions(
            sessionsData
          );

          const week =
            getWeekDates();

          const grouped =
            week.map(
              (date) => {

                const key =
                 date.toISOString().split("T")[0];

                const filteredSessions =
                  sessionsData.filter(
                    (s) =>
                      s.date === key
                  );

                return {
                  date,
                  sessions:
                    filteredSessions,
                };
              });

          setSessionsByDate(
            grouped
          );

        } catch (error) {

          console.error(
            "Error fetching data:",
            error
          );
        }
      };

    fetchData();

  }, [id]);

  useEffect(() => {

    const checkFavorite =
      async () => {

        if (!token)
          return;

        try {

          const res =
            await fetch(
              "http://localhost:5000/api/auth/me",
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const user =
            await res.json();

          const isFav =
            user.favorites.some(
              (f) =>

                String(
                  f._id
                ) ===
                String(id)
            );

          setIsFavorite(
            isFav
          );

        } catch (err) {

          console.error(
            "Favorite check error:",
            err
          );
        }
      };

    checkFavorite();

  }, [id, token]);

  const toggleFavorite =
    async () => {

      if (!token) {

        alert(
          "Login first"
        );

        return;
      }

      try {

        if (isFavorite) {

          await fetch(
            `http://localhost:5000/api/user/favorite/${movie._id}`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          setIsFavorite(
            false
          );

        } else {

          await fetch(
            `http://localhost:5000/api/user/favorite/${movie._id}`,
            {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

          setIsFavorite(
            true
          );
        }

      } catch (err) {

        console.error(
          "Favorite error:",
          err
        );
      }
    };

  if (!movie) {

    return (
      <div className="loading">
        Loading...
      </div>
    );
  }

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

  const ytId =
    new URL(
      trailerLink
    ).searchParams.get("v");

  const nonEmpty =
    sessionsByDate.filter(
      (g) =>
        g.sessions.length > 0
    );

  const week =
    getWeekDates();

  const start =
    week[0];

  const end =
    week[
      week.length - 1
    ];

  const fmt =
    (d) =>

      `${d.getMonth() + 1}.${d.getDate()}`;

  const rangeLabel =
    `${fmt(start)}-${fmt(end)}`;

  return (

    <div className="movie-page">

      <div className="movie-header">

        <img
          className="movie-poster"
          src={poster}
          alt={title}
        />

        <div className="movie-basic-info">

          <h1 className="movie-title">

            {title}

            {" "}

            (
            {new Date(
              releaseDate
            ).getFullYear()}
            )

          </h1>

          <p>
            <strong>
              Premiere:
            </strong>
            {" "}
            {releaseDate}
          </p>

          <p>
            <strong>
              Country:
            </strong>
            {" "}
            {country}
          </p>

          <p>
            <strong>
              Duration:
            </strong>
            {" "}
            {duration}
          </p>

          <p>
            <strong>
              Age Restriction:
            </strong>
            {" "}
            {ageRestriction}
          </p>

          <p>
            <strong>
              Genres:
            </strong>
            {" "}
            {genres.join(", ")}
          </p>

          <div className="ratings-inline">

            <div className="rating-inline-item">

              <img
                className="rating-logo"
                src={imdbLogo}
                alt="IMDb"
              />

              <span className="rating-value">
                {ratings.imdb}
              </span>

            </div>

            <div className="rating-inline-item">

              <img
                className="rating-logo"
                src={rtLogo}
                alt="RT"
              />

              <span className="rating-value">

                {ratings.rottenTomatoes}
                %

              </span>

            </div>

          </div>

        </div>

        <button
          className="favorite-button"
          onClick={
            toggleFavorite
          }
        >

          <img
            src={
              isFavorite

                ? "/icons/close.svg"

                : "/icons/heart_icon.svg"
            }
            alt="favorite"
          />

        </button>

      </div>

      <div className="movie-body">

        <aside className="sessions-sidebar">

          <h2>
            Sessions this week (
            {rangeLabel}
            )
          </h2>

          <ul className="sessions-list">

            {nonEmpty.length > 0 ? (

              nonEmpty.map(
                ({
                  date,
                  sessions,
                }) => (

                  <li
                    key={date.toISOString()}
                    className="session-item"
                  >

                    {/* 📅 DATE */}

                    <div className="session-date">

                      {date.toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                        }
                      )}

                      {" - "}

                      {date.toLocaleDateString(
                        "uk-UA",
                        {
                          day: "2-digit",
                          month: "2-digit",
                        }
                      )}

                    </div>

                    <div className="session-times">

                      {sessions.map(
                        (
                          session,
                          index
                        ) => (

                          <button
                            key={index}
                            className="session-time-btn"
                            onClick={() => {

                              setSelectedSession({

                                poster,

                                title,

                                hall:
                                  session.hall,

                                movieId:
                                  session.movieId,

                                sessionId:
                                  session._id,

                                selectedDate:
                                  session.date,

                                selectedTime:
                                  session.time,
                              });
                            }}
                          >
                            {session.time}
                          </button>

                        )
                      )}

                    </div>

                  </li>
                )
              )

            ) : (

              <p className="no-sessions">
                No sessions available
              </p>

            )}

          </ul>

          <button
            className="book-button"
            onClick={() => {

              if (
                sessions.length > 0
              ) {

                const first =
                  sessions[0];

                setSelectedSession({

                  poster,

                  title,

                  hall:
                    first.hall,

                  movieId:
                    first.movieId,

                  sessionId:
                    first._id,

                  selectedDate:
                    first.date,

                  selectedTime:
                    first.time,
                });

              } else {

                alert(
                  "No sessions available"
                );
              }
            }}
          >
            Order a ticket
          </button>

        </aside>

        <div className="movie-details">

          <section className="movie-description">

            <h2>
              Description
            </h2>

            <p>
              {description}
            </p>

          </section>

          <section className="movie-trailer">

            <h2>
              Trailer
            </h2>

            <div className="video-container">

              <iframe
                title="Trailer"
                src={`https://www.youtube.com/embed/${ytId}`}
                allowFullScreen
              />

            </div>

          </section>

          {selectedSession && (

            <Modal
              isOpen
              onClose={() =>
                setSelectedSession(
                  null
                )
              }
              poster={
                selectedSession.poster
              }
              title={
                selectedSession.title
              }
              hall={
                selectedSession.hall
              }
              movieId={
                selectedSession.movieId
              }
              sessionId={
                selectedSession.sessionId
              }
              selectedDate={
                selectedSession.selectedDate
              }
              selectedTime={
                selectedSession.selectedTime
              }
            />

          )}

        </div>

      </div>

    </div>
  );
}