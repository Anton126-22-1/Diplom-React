import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/admin.module.css";

const AdminMoviesPage = () => {

  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [editMovie, setEditMovie] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    poster: "",
    year: "",
    trailerLink: "",
    releaseDate: "",
    country: "",
    duration: "",
    ageRestriction: "",
    genres: [],
    genreInput: "",
    imdb: "",
    rottenTomatoes: "",
  });

  const token = localStorage.getItem("token");

  // ================= FETCH =================

  const fetchMovies = async () => {
    const res = await fetch(
      "http://localhost:5000/api/movies"
    );

    const data = await res.json();

    setMovies(data);
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // ================= ADD =================

  const addMovie = async () => {

    const movieData = {
      title: form.title,
      description: form.description,
      poster: form.poster,
      year: form.year,
      releaseDate: form.releaseDate,
      country: form.country,
      duration: form.duration,
      ageRestriction: form.ageRestriction,
      genres: form.genres,

      ratings: {
        imdb: Number(form.imdb),
        rottenTomatoes: Number(
          form.rottenTomatoes
        ),
      },

      trailerLink: form.trailerLink,
    };

    const res = await fetch(
      "http://localhost:5000/api/movies",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(movieData),
      }
    );

    if (!res.ok) {
      return alert(
        "Error creating movie"
      );
    }

    setForm({
      title: "",
      description: "",
      poster: "",
      year: "",
      trailerLink: "",
      releaseDate: "",
      country: "",
      duration: "",
      ageRestriction: "",
      genres: [],
      genreInput: "",
      imdb: "",
      rottenTomatoes: "",
    });

    fetchMovies();
  };

  // ================= DELETE =================

  const deleteMovie = async (id) => {

    await fetch(
      `http://localhost:5000/api/movies/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    fetchMovies();
  };

  // ================= UPDATE =================

  const updateMovie = async () => {

    await fetch(
      `http://localhost:5000/api/movies/${editMovie._id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(editMovie),
      }
    );

    setEditMovie(null);

    fetchMovies();
  };

  return (
    <div className={styles.wrapper}>

      {/* ================= TOP BAR ================= */}

      <div className={styles.topBar}>

        <h1 className={styles.title}>
          🎬 Movies Admin Panel
        </h1>

        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin")}
        >
          ← Back to Admin
        </button>

      </div>

      {/* ================= ADD MOVIE ================= */}

      <div className={styles.form}>

        <h2>Add Movie</h2>

        <div className={styles.addMovieLayout}>

          {/* LEFT PREVIEW */}

          <div className={styles.preview}>

            {form.poster ? (
              <img
                src={form.poster}
                alt="preview"
                className={
                  styles.previewImg
                }
              />
            ) : (
              <div
                className={
                  styles.emptyPreview
                }
              >
                Poster Preview
              </div>
            )}

          </div>

          {/* RIGHT FORM */}

          <div className={styles.formContent}>

            <input
              placeholder="Poster URL"
              value={form.poster}
              onChange={(e) =>
                setForm({
                  ...form,
                  poster: e.target.value,
                })
              }
            />

            <input
              placeholder="Movie title"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
            />

            <textarea
              className={styles.textarea}
              placeholder="Movie description"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Trailer URL"
              value={form.trailerLink}
              onChange={(e) =>
                setForm({
                  ...form,
                  trailerLink:
                    e.target.value,
                })
              }
            />

            <div className={styles.row}>

              <input
                type="date"
                value={form.releaseDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    releaseDate:
                      e.target.value,
                  })
                }
              />

              <input
                placeholder="Country"
                value={form.country}
                onChange={(e) =>
                  setForm({
                    ...form,
                    country:
                      e.target.value,
                  })
                }
              />

            </div>

            <div className={styles.row}>

              <input
                placeholder="Duration"
                value={form.duration}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration:
                      e.target.value,
                  })
                }
              />

              <input
                placeholder="Age restriction"
                value={form.ageRestriction}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ageRestriction:
                      e.target.value,
                  })
                }
              />

            </div>

            {/* ================= GENRES ================= */}

            <div className={styles.genreBox}>

              <input
                placeholder="Add genre"
                value={form.genreInput}
                onChange={(e) =>
                  setForm({
                    ...form,
                    genreInput:
                      e.target.value,
                  })
                }
              />

              <button
                type="button"
                onClick={() => {

                  if (!form.genreInput)
                    return;

                  setForm({
                    ...form,

                    genres: [
                      ...form.genres,
                      form.genreInput,
                    ],

                    genreInput: "",
                  });
                }}
              >
                Add Genre
              </button>

            </div>

            <div className={styles.genreList}>

              {form.genres.map((g, i) => (

                <div
                  key={i}
                  className={
                    styles.genreTag
                  }
                >
                  {g}

                  <span
                    onClick={() =>
                      setForm({
                        ...form,

                        genres:
                          form.genres.filter(
                            (_, idx) =>
                              idx !== i
                          ),
                      })
                    }
                  >
                    ✕
                  </span>

                </div>

              ))}

            </div>

            {/* ================= RATINGS ================= */}

            <div className={styles.row}>

              <input
                placeholder="IMDb"
                value={form.imdb}
                onChange={(e) =>
                  setForm({
                    ...form,
                    imdb: e.target.value,
                  })
                }
              />

              <input
                placeholder="Rotten Tomatoes"
                value={form.rottenTomatoes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    rottenTomatoes:
                      e.target.value,
                  })
                }
              />

            </div>

            <button
              className={styles.addBtn}
              onClick={addMovie}
            >
              ➕ Add Movie
            </button>

          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className={styles.tableWrapper}>

        <h2>Movies</h2>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>Poster</th>
              <th>Title</th>
              <th>Year</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {movies.map((m) => (

              <tr key={m._id}>

                <td>
                  <img
                    src={m.poster}
                    className={
                      styles.poster
                    }
                  />
                </td>

                <td>{m.title}</td>

                <td>{m.year}</td>

                <td>

                  <button
                    onClick={() =>
                      setEditMovie(m)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteMovie(m._id)
                    }
                  >
                    ❌ Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>
      </div>

      {/* ================= MODAL ================= */}

      {editMovie && (

        <div className={styles.modalOverlay}>

          <div className={styles.modal}>

            <h2>Edit Movie</h2>

            <input
              value={editMovie.title}
              onChange={(e) =>
                setEditMovie({
                  ...editMovie,
                  title: e.target.value,
                })
              }
            />

            <textarea
              value={editMovie.description}
              onChange={(e) =>
                setEditMovie({
                  ...editMovie,
                  description:
                    e.target.value,
                })
              }
            />

            <input
              value={editMovie.poster}
              onChange={(e) =>
                setEditMovie({
                  ...editMovie,
                  poster:
                    e.target.value,
                })
              }
            />

            <input
              value={editMovie.year}
              onChange={(e) =>
                setEditMovie({
                  ...editMovie,
                  year: e.target.value,
                })
              }
            />

            <div
              className={
                styles.modalActions
              }
            >

              <button
                onClick={updateMovie}
              >
                Save
              </button>

              <button
                onClick={() =>
                  setEditMovie(null)
                }
              >
                Cancel
              </button>

            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default AdminMoviesPage;