import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import styles from "../styles/admin.module.css";

const AdminPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    movies: 0,
    bookings: 0,
    slides: 0,
  });

  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ================= FETCH STATS =================
  const fetchStats = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  // ================= FILL MISSING DAYS =================
  const fillMissingDays = (data) => {
    const map = new Map(data.map((d) => [d.date, d.users]));
    const result = [];

    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);

      const key = d.toISOString().slice(5, 10); // MM-DD

      result.push({
        date: key,
        users: map.get(key) || 0,
      });
    }

    return result;
  };

  // ================= FETCH USER GROWTH =================
  const fetchUserGrowth = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/admin/user-growth",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      console.log("RAW USER GROWTH:", data); 

      // нормалізація
      const formatted = data.map((item) => ({
        date: item._id ? item._id.slice(5, 10) : item.date,
        users: item.users ?? item.count ?? 0,
      }));

      console.log("FORMATTED:", formatted); 

      // додаємо відсутні дні
      const finalData = fillMissingDays(formatted);

      console.log("FINAL:", finalData); 

      setUserGrowth(finalData);

    } catch (err) {
      console.error("Chart error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUserGrowth();
  }, []);

  return (
    <div className={styles.wrapper}>
      {/* TITLE */}
      <h1 className={styles.title}>🎬 Admin Panel</h1>

      {/* STATS */}
      <div className={styles.stats}>
        <div
          className={styles.card}
          onClick={() => (window.location.href = "/admin/users")}
        >
          <h3>👥 Users</h3>
          <p>{stats.users}</p>
        </div>

        <div
          className={styles.card}
          onClick={() => (window.location.href = "/admin/movies")}
        >
          <h3>🎥 Movies</h3>
          <p>{stats.movies}</p>
        </div>

        <div
          className={styles.card}
          onClick={() => (window.location.href = "/admin/sessions")}
        >
          <h3>🎟 Sessions</h3>
          <p>Manage</p>
        </div>

        <div
          className={styles.card}
          onClick={() => (window.location.href = "/admin/bookings")}
        >
          <h3>🎫 Bookings</h3>
          <p>{stats.bookings}</p>
        </div>

        <div
          className={styles.card}
          onClick={() => (window.location.href = "/admin/slides")}
        >
          <h3>🖼 Slides</h3>
          <p>{stats.slides}</p>
        </div>
      </div>

      <div className={styles.chartBlock}>
        <h2>👥 New Users Growth (Last 7 Days)</h2>

        {loading ? (
          <p style={{ color: "#888" }}>Loading chart...</p>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fe9800" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#fe9800" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#aaa"
                tick={{ fill: "#aaa", fontSize: 12 }}
              />

              <YAxis
                stroke="#aaa"
                tick={{ fill: "#aaa", fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "#1b1f2b",
                  border: "none",
                  borderRadius: "10px",
                }}
                labelStyle={{ color: "#fff" }}
              />

              <Area
                type="monotone"
                dataKey="users"
                stroke="#fe9800"
                fill="url(#colorUsers)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminPage;