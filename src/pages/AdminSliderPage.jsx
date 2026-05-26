import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate }
from "react-router-dom";

import styles
from "../styles/admin.module.css";

export default function AdminSliderPage() {

  const navigate = useNavigate();

  const [slides, setSlides] =
    useState([]);

  const [form, setForm] =
    useState({
      title: "",
      image: "",
    });

  const token =
    localStorage.getItem("token");

  // ================= FETCH =================

  const fetchSlides = async () => {

    const res = await fetch(
      "http://localhost:5000/api/slides"
    );

    const data = await res.json();

    setSlides(data);
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // ================= ADD =================

  const addSlide = async () => {

    const res = await fetch(
      "http://localhost:5000/api/slides",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body: JSON.stringify(form),
      }
    );

    if (!res.ok) {
      return alert(
        "Error creating slide"
      );
    }

    setForm({
      title: "",
      image: "",
    });

    fetchSlides();
  };

  // ================= DELETE =================

  const deleteSlide = async (id) => {

    await fetch(
      `http://localhost:5000/api/slides/${id}`,
      {
        method: "DELETE",

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    fetchSlides();
  };

  return (
    <div className={styles.wrapper}>

      <div className={styles.topBar}>

        <h1 className={styles.title}>
          🖼 Slider Admin
        </h1>

        <button
          className={styles.backBtn}
          onClick={() =>
            navigate("/admin")
          }
        >
          ← Back to Admin
        </button>

      </div>

      {/* FORM */}

      <div className={styles.form}>

        <h2>Add Slide</h2>

        <input
          placeholder="Image URL"
          value={form.image}
          onChange={(e) =>
            setForm({
              ...form,
              image: e.target.value,
            })
          }
        />

        <input
          placeholder="Slide title"
          value={form.title}
          onChange={(e) =>
            setForm({
              ...form,
              title: e.target.value,
            })
          }
        />

        <button
          className={styles.addBtn}
          onClick={addSlide}
        >
          ➕ Add Slide
        </button>

      </div>

      {/* TABLE */}

      <div className={styles.tableWrapper}>

        <table className={styles.table}>

          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {slides.map((slide) => (

              <tr key={slide._id}>

                <td>

                  <img
                    src={slide.image}
                    alt={slide.title}
                    className={styles.poster}
                  />

                </td>

                <td>
                  {slide.title}
                </td>

                <td>

                  <button
                    onClick={() =>
                      deleteSlide(slide._id)
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
}