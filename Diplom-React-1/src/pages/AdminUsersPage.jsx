import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/admin.module.css";

const AdminUsersPage = () => {

  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  const token = localStorage.getItem("token");

  // ================= FETCH USERS =================

  const fetchUsers = async () => {

    try {

      const res = await fetch(
        "http://localhost:5000/api/admin/users",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setUsers(data);

    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= DELETE USER =================

  const deleteUser = async (id) => {

    const confirmDelete =
      window.confirm(
        "Delete this user?"
      );

    if (!confirmDelete) return;

    try {

      await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          method: "DELETE",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      fetchUsers();

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={styles.wrapper}>

      {/* ================= TOP BAR ================= */}

      <div className={styles.topBar}>

        <h1 className={styles.title}>
          👥 Users
        </h1>

        <button
          className={styles.backBtn}
          onClick={() => navigate("/admin")}
        >
          ← Back to Admin
        </button>

      </div>

      <div className={styles.tableWrapper}>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Favorites</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {users.map((user) => (

              <tr key={user._id}>

                <td>
                  {user.email}
                </td>

                <td>
                  {user.role}
                </td>

                <td>
                  {user.favorites?.length || 0}
                </td>

                <td>

                  <button
                    onClick={() =>
                      alert(
                        JSON.stringify(
                          user,
                          null,
                          2
                        )
                      )
                    }
                  >
                    👁 View
                  </button>

                  <button
                    onClick={() =>
                      deleteUser(user._id)
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
    </div>
  );
};

export default AdminUsersPage;