import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/admin.module.css";

export default function AdminBookingsPage() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [revenue, setRevenue] = useState(0); 

  const [editForm, setEditForm] = useState({
    userName: "",
    userPhone: "",
    seats: "",
    totalPrice: 0,
    pricePerSeat: 0,
  });

  const token = localStorage.getItem("token");

  // ================= FETCH BOOKINGS =================
  const fetchBookings = async () => {
    const res = await fetch("http://localhost:5000/api/bookings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setBookings(data);
  };

  // ================= FETCH REVENUE =================
  const fetchRevenue = async () => {
    const res = await fetch("http://localhost:5000/api/bookings/revenue", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    setRevenue(data.revenue);
  };

  useEffect(() => {
    fetchBookings();
    fetchRevenue(); 
  }, []);

  // ================= DELETE =================
  const deleteBooking = async (id) => {
    if (!window.confirm("Delete booking?")) return;

    await fetch(`http://localhost:5000/api/bookings/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchBookings();
    fetchRevenue(); 
  };

  // ================= START EDIT =================
  const startEdit = (booking) => {
    setEditingId(booking._id);

    setEditForm({
      userName: booking.userName,
      userPhone: booking.userPhone,
      seats: booking.seats.join(", "),
      pricePerSeat: booking.pricePerSeat,
      totalPrice: booking.totalPrice,
    });
  };

  // ================= SEATS =================
  const handleSeatsChange = (value) => {
    const seatsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setEditForm({
      ...editForm,
      seats: value,
      totalPrice: seatsArray.length * editForm.pricePerSeat,
    });
  };

  // ================= SAVE =================
  const saveEdit = async (id) => {
    const seatsArray = editForm.seats
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    await fetch(`http://localhost:5000/api/bookings/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userName: editForm.userName,
        userPhone: editForm.userPhone,
        seats: seatsArray,
      }),
    });

    setEditingId(null);
    fetchBookings();
    fetchRevenue();
  };

  return (
    <div className={styles.wrapper}>

      {/* ================= TOP BAR ================= */}
      <div className={styles.topBar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin")}
        >
          ← Back to Admin
        </button>

        <div className={styles.revenueCard}>
          💰 Total Revenue: {revenue} UAH
        </div>
      </div>

      <h1 className={styles.title}>🎫 Bookings</h1>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Seats</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>
                {editingId === b._id ? (
                  <input
                    value={editForm.userName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, userName: e.target.value })
                    }
                  />
                ) : (
                  b.userName
                )}
              </td>

              <td>
                {editingId === b._id ? (
                  <input
                    value={editForm.userPhone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, userPhone: e.target.value })
                    }
                  />
                ) : (
                  b.userPhone
                )}
              </td>

              <td>
                {editingId === b._id ? (
                  <input
                    value={editForm.seats}
                    onChange={(e) => handleSeatsChange(e.target.value)}
                  />
                ) : (
                  b.seats.join(", ")
                )}
              </td>

              <td>
                {editingId === b._id ? (
                  <strong>{editForm.totalPrice} UAH</strong>
                ) : (
                  `${b.totalPrice} UAH`
                )}
              </td>

              <td>{b.status}</td>

              <td>
                {editingId === b._id ? (
                  <button onClick={() => saveEdit(b._id)}>💾 Save</button>
                ) : (
                  <>
                    <button onClick={() => startEdit(b)}>✏ Edit</button>
                    <button onClick={() => deleteBooking(b._id)}>🗑 Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}