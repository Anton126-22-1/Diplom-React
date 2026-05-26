import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import styles from "../styles/profile.module.css";

const ProfilePage = () => {
  const { isAuthenticated, token, logout } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔒 Redirect якщо не залогінений
  if (!isAuthenticated) {
    return <Navigate to="/signIn" />;
  }

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [profileRes, bookingsRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch("http://localhost:5000/api/bookings/my", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (profileRes.status === 401 || bookingsRes.status === 401) {
          logout();
          return;
        }

        const profileData = await profileRes.json();
        const bookingsData = await bookingsRes.json();

        setUser(profileData);
        setBookings(bookingsData);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, logout]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.profile}>
        <div className={styles.avatar}>
          <img src="/icons/user_icon.svg" alt="avatar" />
        </div>

        <div className={styles.info}>
          <h1>{user?.email}</h1>

          <p>
            Role: <span>{user?.role}</span>
          </p>

          <p>
            Favorite movies:{" "}
            <span>{user?.favorites?.length || 0}</span>
          </p>

          <p>
            Bookings:{" "}
            <span>{bookings?.length || 0}</span>
          </p>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.logout} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.section}>
        <h2>Favorite Movies</h2>

        <div className={styles.movies}>
          {user?.favorites?.length > 0 ? (
            user.favorites.map((movie) => (
              <div
                key={movie._id}
                className={styles.movie}
                onClick={() => navigate(`/movie/${movie._id}`)}
              >
                <img src={movie.poster} alt={movie.title} />
                <h3>{movie.title}</h3>
              </div>
            ))
          ) : (
            <p>No favorite movies yet</p>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h2>My Bookings</h2>

        <div className={styles.movies}>
          {bookings?.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking._id} className={styles.movie}>
                <img
                  src={booking.movieId?.poster}
                  alt={booking.movieId?.title}
                />

                <h3>{booking.movieId?.title}</h3>

                <p>
                  Date: <span>{booking.sessionId?.date}</span>
                </p>

                <p>
                  Time: <span>{booking.sessionId?.time}</span>
                </p>

                <p>
                  Hall: <span>{booking.sessionId?.hall}</span>
                </p>

                <p>Seats: {booking.seats?.join(", ")}</p>

                <p>Total: {booking.totalPrice} ₴</p>

                <p>Status: {booking.status}</p>
              </div>
            ))
          ) : (
            <p>No bookings yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;