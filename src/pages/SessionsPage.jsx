// src/pages/SessionsPage.jsx

import React, {
  useState,
  useEffect,
} from "react";

import SessionCard
from "../components/SessionCard";

import Modal
from "../components/Modal/Modal.jsx";

import styles
from "../styles/sessionspage.module.css";

export default function SessionsPage() {

  const [sessionsData,
    setSessionsData] =
    useState([]);

  const [moviesData,
    setMoviesData] =
    useState([]);

  const [selectedDate,
    setSelectedDate] =
    useState("");

  const [selectedSession,
    setSelectedSession] =
    useState(null);

  useEffect(() => {

    const fetchData =
      async () => {

      try {

        const [
          sessionsRes,
          moviesRes,
        ] =
          await Promise.all([
            fetch(
              "http://localhost:5000/api/sessions"
            ),
            fetch(
              "http://localhost:5000/api/movies"
            ),
          ]);

        const sessions =
          await sessionsRes.json();

        const movies =
          await moviesRes.json();

        setSessionsData(
          sessions
        );

        setMoviesData(
          movies
        );

      } catch (err) {

        console.error(err);
      }
    };

    fetchData();

  }, []);

  useEffect(() => {

    if (
      !sessionsData.length
    )
      return;

    const today =
      new Date()
        .toISOString()
        .slice(0, 10);

    const hasToday =
      sessionsData.some(
        (s) =>
          s.date === today
      );

    setSelectedDate(

      hasToday

        ? today

        : sessionsData[0]
            ?.date || ""
    );

  }, [sessionsData]);

  const dateTabs =
    [
      ...new Set(
        sessionsData.map(
          (s) => s.date
        )
      ),
    ].sort(
      (a, b) =>
        new Date(a) -
        new Date(b)
    );

  const sessionsOnDate =
    sessionsData.filter(
      (s) =>
        s.date ===
        selectedDate
    );

  const sessionsByMovie =
    sessionsOnDate.reduce(
      (acc, sess) => {

        if (!sess.movieId)
          return acc;

        (
          acc[sess.movieId] =
            acc[
              sess.movieId
            ] || []
        ).push(sess);

        return acc;
      },
      {}
    );

  const moviesToShow =
    Object.entries(
      sessionsByMovie
    )
      .map(
        ([movieId,
          sessions]) => {

          const movie =
            moviesData.find(
              (m) =>
                String(
                  m._id
                ) ===
                String(
                  movieId
                )
            );

          return movie
            ? {
                movie,
                sessions,
              }
            : null;
        }
      )
      .filter(Boolean);

  const handleOrderClick =
    ({
      movie,
      sessions,
    }) => {

      const sess =
        sessions?.[0];

      if (
        !movie ||
        !sess
      )
        return;

      setSelectedSession({

        poster:
          movie.poster,

        title:
          movie.title,

        hall:
          sess.hall,

        movieId:
          movie._id,

        sessionId:
          sess._id,
      });
    };

  return (
    <div
      className={
        styles.sessionsPage
      }
    >
      <h1
        className={
          styles.pageTitle
        }
      >
        SESSIONS
      </h1>

      <div
        className={
          styles.tabs
        }
      >
        {dateTabs.map(
          (date) => (
            <button
              key={date}
              className={`${styles.tab}
              ${
                date ===
                selectedDate
                  ? styles.activeTab
                  : ""
              }`}
              onClick={() =>
                setSelectedDate(
                  date
                )
              }
            >
              {date}
            </button>
          )
        )}
      </div>

      <div
        className={
          styles.sessionsGrid
        }
      >
        {moviesToShow.length ? (

          moviesToShow.map(
            ({
              movie,
              sessions,
            }) => (
              <SessionCard
                key={
                  movie._id
                }
                movie={movie}
                sessions={
                  sessions
                }
                onOrder={() =>
                  handleOrderClick(
                    {
                      movie,
                      sessions,
                    }
                  )
                }
              />
            )
          )

        ) : (

          <p>
            No sessions
          </p>
        )}
      </div>

      {selectedSession && (

        <Modal
          isOpen={true}
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
        />

      )}
    </div>
  );
}