import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/admin.module.css";

export default function AdminSessionsPage() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    movieId: "",
    date: "",
    time: "",
    hall: "Hall 1",
    price: 150,
  });

  const token = localStorage.getItem("token");

  // ================= IMAGE =================
  const getImage = (movie) => {
    if (!movie) return "/no-image.jpg";

    const img = movie.image || movie.poster || movie.imageUrl;
    if (!img) return "/no-image.jpg";

    if (img.startsWith("http")) return img;

    return `http://localhost:5000/${img}`;
  };

  // ================= MAP (FIX BLINK) =================
  const movieMap = useMemo(() => {
    const map = {};
    movies.forEach((m) => {
      map[m._id] = m;
    });
    return map;
  }, [movies]);

  // ================= FETCH =================
  const fetchMovies = async () => {
    const res = await fetch("http://localhost:5000/api/movies");
    const data = await res.json();
    setMovies(data);
  };

  const fetchSessions = async () => {
    const res = await fetch("http://localhost:5000/api/sessions");
    const data = await res.json();
    setSessions(data);
  };

  useEffect(() => {
    fetchMovies();
    fetchSessions();
  }, []);

  // ================= SAVE =================
  const saveSession = async () => {
    if (!form.movieId || !form.date || !form.time) {
      return alert("Movie, date and time are required");
    }

    const url = editingId
      ? `http://localhost:5000/api/sessions/${editingId}`
      : "http://localhost:5000/api/sessions";

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });

    setForm({
      movieId: "",
      date: "",
      time: "",
      hall: "Hall 1",
      price: 150,
    });

    setEditingId(null);
    fetchSessions();
  };

  // ================= EDIT =================
  const editSession = (session) => {
    setEditingId(session._id);

    setForm({
      movieId: session.movieId,
      date: session.date,
      time: session.time,
      hall: session.hall,
      price: session.price,
    });
  };

  // ================= DELETE =================
  const deleteSession = async (id) => {
    await fetch(`http://localhost:5000/api/sessions/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchSessions();
  };

  return (
    <div className={styles.wrapper}>
      {/* TOP */}
      <div className={styles.topBar}>
        <h1 className={styles.title}>🎟 Sessions Admin</h1>

        <button className={styles.backBtn} onClick={() => navigate("/admin")}>
          ← Back to Admin
        </button>
      </div>

      <div className={styles.form}>
        <h2>{editingId ? "Edit Session" : "Add Session"}</h2>

        <div className={styles.formGrid}>
          <select
            value={form.movieId}
            onChange={(e) => setForm({ ...form, movieId: e.target.value })}
          >
            <option value="">Select movie</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />

          <input
            value={form.hall}
            onChange={(e) => setForm({ ...form, hall: e.target.value })}
          />

          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <button className={styles.addBtn} onClick={saveSession}>
          {editingId ? "💾 Update" : "➕ Add"}
        </button>
      </div>

      {/* TABLE */}
      <div className={styles.tableWrapper}>
        <h2>Sessions</h2>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Movie</th>
              <th>Date</th>
              <th>Time</th>
              <th>Price</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {sessions.map((session) => {
              const movie = movieMap[session.movieId];
              const imgSrc = getImage(movie);

              return (
                <tr key={session._id} className={styles.rowCard}>
                  <td className={styles.movieCell}>
                    <img
                      src={imgSrc}
                      alt="poster"
                      className={styles.poster}
                      loading="lazy"
                      onError={(e) => (e.target.src = "/no-image.jpg")}
                    />

                    <div>
                      <strong>{movie?.title || "Unknown"}</strong>
                      <p className={styles.subText}>{session.hall}</p>
                    </div>
                  </td>

                  <td>
                    <span className={styles.dateBadge}>{session.date}</span>
                  </td>

                  <td>{session.time}</td>

                  <td className={styles.price}>{session.price} ₴</td>

                  <td>
                    <span className={styles.status}>Active</span>
                  </td>

                  {/* 🔥 NEW BUTTONS */}
                  <td className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => editSession(session)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className={styles.deleteBtn}
                      onClick={() => deleteSession(session._id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}