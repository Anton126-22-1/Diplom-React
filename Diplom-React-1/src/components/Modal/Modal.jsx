// src/components/Modal/Modal.jsx

import React, {
  useState,
  useEffect,
} from "react";

import styles
from "../../styles/modal.module.css";

function Modal({
  isOpen,
  onClose,
  poster,
  title,
  hall,
  movieId,
  sessionId,
  selectedDate: initialDate,
  selectedTime: initialTime,
}) {

  const token = localStorage.getItem("token");

  const [sessionsData,
    setSessionsData] =
    useState([]);

  const [selectedDate,
    setSelectedDate] =
    useState(initialDate || "");

  const [availableDates,
    setAvailableDates] =
    useState([]);

  const [selectedTime,
    setSelectedTime] =
    useState(initialTime || "");

  const [availableTimes,
    setAvailableTimes] =
    useState([]);

  const [bookedSeatsList,
    setBookedSeatsList] =
    useState([]);

  const [selectedSeats,
    setSelectedSeats] =
    useState([]);

  const [name,
    setName] =
    useState("");

  const [phone,
    setPhone] =
    useState("");

  const [isOrdered,
    setIsOrdered] =
    useState(false);

  const [price,
    setPrice] =
    useState(0);

  const [totalPrice,
    setTotalPrice] =
    useState(0);

  // ================= PHONE VALIDATION =================

  const isValidPhone =
    (phone) => {

      const phoneRegex =
        /^(?:\+380|0)\d{9}$/;

      return phoneRegex.test(
        phone
      );
    };

  // ================= LOAD SESSIONS =================

  useEffect(() => {

    if (!isOpen)
      return;

    setSelectedDate(
      initialDate || ""
    );

    setSelectedTime(
      initialTime || ""
    );

    setName("");
    setPhone("");
    setSelectedSeats([]);
    setBookedSeatsList([]);
    setIsOrdered(false);
    setPrice(0);
    setTotalPrice(0);

    const loadSessions =
      async () => {

        try {

          const res =
            await fetch(
              "http://localhost:5000/api/sessions"
            );

          const text =
            await res.text();

          let data;

          try {

            data =
              JSON.parse(
                text
              );

          } catch (e) {

            console.error(
              "❌ Server returned NOT JSON:",
              text
            );

            return;
          }

          setSessionsData(
            data
          );

          // ✅ ONLY DATES FOR CURRENT MOVIE

          const dates =
            Array.from(

              new Set(

                data

                  .filter(
                    (s) =>

                      String(
                        s.movieId
                      ) ===
                      String(
                        movieId
                      )
                  )

                  .map(
                    (s) =>
                      s.date
                  )
              )
            );

          setAvailableDates(
            dates
          );

        } catch (err) {

          console.error(
            "Fetch error:",
            err
          );
        }
      };

    loadSessions();

  }, [
    isOpen,
    movieId,
    initialDate,
    initialTime,
  ]);

  // ================= DATE =================

  useEffect(() => {

    setAvailableTimes([]);
    setSelectedSeats([]);
    setBookedSeatsList([]);
    setPrice(0);
    setTotalPrice(0);

    if (!selectedDate)
      return;

    // ✅ TIMES FOR CURRENT MOVIE + DATE

    const times =
      Array.from(

        new Set(

          sessionsData

            .filter(
              (s) =>

                s.date ===
                  selectedDate &&

                String(
                  s.movieId
                ) ===
                String(
                  movieId
                )
            )

            .map(
              (s) =>
                s.time
            )
        )
      );

    setAvailableTimes(
      times
    );

    // ✅ AUTO SELECT TIME

    if (
      initialTime &&
      times.includes(
        initialTime
      )
    ) {

      setSelectedTime(
        initialTime
      );

    } else if (
      times.length > 0 &&
      !selectedTime
    ) {

      setSelectedTime(
        times[0]
      );
    }

  }, [
    selectedDate,
    sessionsData,
    movieId,
    initialTime,
  ]);

  // ================= TIME =================

  useEffect(() => {

    setSelectedSeats([]);
    setBookedSeatsList([]);
    setPrice(0);
    setTotalPrice(0);

    if (
      !selectedTime ||
      !selectedDate
    )
      return;

    // ✅ FIND SESSION BY DATE + TIME + MOVIE

    const session =
      sessionsData.find(
        (s) =>
          s.date ===
            selectedDate &&
          s.time ===
            selectedTime &&
          String(
            s.movieId
          ) ===
            String(
              movieId
            )
      );

    if (session) {

      const booked =
        Array.isArray(
          session.bookedSeatsList
        )
          ? session.bookedSeatsList
          : [];

      setBookedSeatsList(
        booked
      );

      setPrice(
        session.price || 0
      );
    }

  }, [
    selectedTime,
    selectedDate,
    sessionsData,
    movieId,
  ]);

  // ================= TOTAL =================

  useEffect(() => {

    setTotalPrice(

      price *
      selectedSeats.length

    );

  }, [
    price,
    selectedSeats,
  ]);

  // ================= SEAT CLICK =================

  const handleSeatClick =
    (seatNumber) => {

      if (

        bookedSeatsList.includes(
          seatNumber
        )

      )
        return;

      setSelectedSeats(
        (prev) =>

          prev.includes(
            seatNumber
          )

            ? prev.filter(
                (n) =>
                  n !==
                  seatNumber
              )

            : [
                ...prev,
                seatNumber,
              ]
      );
    };

  // ================= BOOKING =================

  const handleConfirm =
    async (e) => {

      e.preventDefault();

      if (
        !selectedDate ||
        !selectedTime ||
        !name ||
        !phone ||
        !selectedSeats.length
      ) {
        return;
      }

      if (
        !isValidPhone(
          phone
        )
      ) {

        alert(
          "Please enter a valid phone number (e.g., +380XXXXXXXXX or 0XXXXXXXXX)"
        );

        return;
      }

      try {

        // ✅ FIND SESSION

        const session =
          sessionsData.find(
            (s) =>
              s.date ===
                selectedDate &&
              s.time ===
                selectedTime &&
              String(
                s.movieId
              ) ===
                String(
                  movieId
                )
          );

        if (!session) {

          alert(
            "Session not found"
          );

          return;
        }

        const bookingData = {

          movieId:
            session.movieId,

          sessionId:
            session._id,

          userName:
            name,

          userPhone:
            phone,

          seats:
            selectedSeats,

          totalPrice,
        };

        const res = await fetch(
          "http://localhost:5000/api/bookings",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
              Authorization: token
                ? `Bearer ${token}`
                : "",
            },

            body: JSON.stringify(
              bookingData
            ),
          }
        );

        if (!res.ok) {

          throw new Error(
            "Booking failed"
          );
        }

        const data =
          await res.json();

        console.log(
          "✅ BOOKING SAVED:",
          data
        );

        setIsOrdered(
          true
        );

      } catch (err) {

        console.error(
          "❌ Booking error:",
          err
        );

        alert(
          "Error creating booking"
        );
      }
    };

  if (!isOpen)
    return null;

  return (

    <div
      className={
        styles.overlay
      }
      onClick={onClose}
    >

      <div
        className={
          styles.modal
        }
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <button
          className={
            styles.closeButton
          }
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        {isOrdered ? (

          <div
            className={
              styles.successMessage
            }
          >

            <div
              className={
                styles.successIcon
              }
            >
              ✓
            </div>

            <h2>
              Booking Confirmed!
            </h2>

            <div
              className={
                styles.ticketDetails
              }
            >

              <p>
                <strong>
                  Movie:
                </strong>
                {" "}
                {title}
              </p>

              <p>
                <strong>
                  Date:
                </strong>
                {" "}
                {selectedDate}
              </p>

              <p>
                <strong>
                  Time:
                </strong>
                {" "}
                {selectedTime}
              </p>

              <p>
                <strong>
                  Hall:
                </strong>
                {" "}
                {hall}
              </p>

              <p>
                <strong>
                  Seats:
                </strong>
                {" "}
                {selectedSeats.join(
                  ", "
                )}
              </p>

              <p>
                <strong>
                  Total Price:
                </strong>
                {" "}
                {totalPrice}
                {" "}
                UAH
              </p>

            </div>

            <p
              className={
                styles.thankYou
              }
            >
              Thank you for your purchase!
            </p>

          </div>

        ) : (

          <form
            className={
              styles.form
            }
            onSubmit={
              handleConfirm
            }
          >

            <div
              className={
                styles.movieInfo
              }
            >

              <img
                src={poster}
                alt={`Poster of ${title}`}
                className={
                  styles.poster
                }
              />

              <div
                className={
                  styles.movieDetails
                }
              >

                <h2
                  className={
                    styles.title
                  }
                >
                  {title}
                </h2>

                <p
                  className={
                    styles.hall
                  }
                >
                  Hall:
                  {" "}
                  {hall}
                </p>

              </div>
            </div>

            <div
              className={
                styles.formGrid
              }
            >

              <div
                className={
                  styles.formSection
                }
              >

                <label
                  className={
                    styles.label
                  }
                >

                  Session Date:

                  <select
                    className={
                      styles.input
                    }
                    value={
                      selectedDate
                    }
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                    required
                  >

                    <option value="">
                      Select a date
                    </option>

                    {availableDates.map(
                      (date) => (

                        <option
                          key={date}
                          value={date}
                        >
                          {date}
                        </option>

                      )
                    )}

                  </select>

                </label>

                <label
                  className={
                    styles.label
                  }
                >

                  Session Time:

                  <select
                    className={
                      styles.input
                    }
                    value={
                      selectedTime
                    }
                    onChange={(e) =>
                      setSelectedTime(
                        e.target.value
                      )
                    }
                    disabled={
                      !availableTimes.length
                    }
                    required
                  >

                    <option value="">
                      Select a time
                    </option>

                    {availableTimes.map(
                      (time) => (

                        <option
                          key={time}
                          value={time}
                        >
                          {time}
                        </option>

                      )
                    )}

                  </select>

                </label>

              </div>

              <div
                className={
                  styles.formSection
                }
              >

                <label
                  className={
                    styles.label
                  }
                >

                  Your Name:

                  <input
                    type="text"
                    className={
                      styles.input
                    }
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) =>
                      setName(
                        e.target.value
                      )
                    }
                    required
                  />

                </label>

                <label
                  className={
                    styles.label
                  }
                >

                  Phone Number:

                  <input
                    type="tel"
                    className={
                      styles.input
                    }
                    placeholder="Enter your phone"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    required
                  />

                  <small
                    style={{
                      color: "#666",
                    }}
                  >
                    Format:
                    {" "}
                    +380XXXXXXXXX
                    {" "}
                    or
                    {" "}
                    0XXXXXXXXX
                  </small>

                </label>

              </div>

            </div>

            {name &&
              phone &&
              selectedTime && (

              <div
                className={
                  styles.seatsSection
                }
              >

                <div
                  className={
                    styles.seatsHeader
                  }
                >

                  <h3>
                    Select Your Seats
                  </h3>

                  <div
                    className={
                      styles.seatsLegend
                    }
                  >

                    <div
                      className={
                        styles.legendItem
                      }
                    >

                      <div
                        className={`${styles.legendBox}
                        ${styles.available}`}
                      ></div>

                      <span>
                        Available
                      </span>

                    </div>

                    <div
                      className={
                        styles.legendItem
                      }
                    >

                      <div
                        className={`${styles.legendBox}
                        ${styles.selected}`}
                      ></div>

                      <span>
                        Selected
                      </span>

                    </div>

                    <div
                      className={
                        styles.legendItem
                      }
                    >

                      <div
                        className={`${styles.legendBox}
                        ${styles.booked}`}
                      ></div>

                      <span>
                        Booked
                      </span>

                    </div>

                  </div>
                </div>

                <div
                  className={
                    styles.screen
                  }
                >
                  Screen
                </div>

                <div
                  className={
                    styles.seatsGrid
                  }
                >

                  {Array.from({
                    length: 5,
                  }).map(
                    (_, row) => (

                    <div
                      key={row}
                      className={
                        styles.seatRow
                      }
                    >

                      {Array.from({
                        length: 12,
                      }).map(
                        (_, col) => {

                        const seatNumber =
                          row * 12 +
                          col + 1;

                        const isBooked =
                          bookedSeatsList.includes(
                            seatNumber
                          );

                        const isSelected =
                          selectedSeats.includes(
                            seatNumber
                          );

                        return (

                          <div
                            key={
                              seatNumber
                            }
                            className={`${styles.seat}
                            ${
                              isBooked
                                ? styles.booked
                                : ""
                            }
                            ${
                              isSelected
                                ? styles.selected
                                : ""
                            }`}
                            onClick={() =>
                              handleSeatClick(
                                seatNumber
                              )
                            }
                          >
                            {seatNumber}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {selectedSeats.length >
                  0 && (

                  <div
                    className={
                      styles.orderSummary
                    }
                  >

                    <p>
                      Selected Seats:
                      {" "}
                      {selectedSeats.join(
                        ", "
                      )}
                    </p>

                    <p>
                      Price per Seat:
                      {" "}
                      {price}
                      {" "}
                      UAH
                    </p>

                    <p
                      className={
                        styles.totalPrice
                      }
                    >
                      Total:
                      {" "}
                      {totalPrice}
                      {" "}
                      UAH
                    </p>

                  </div>

                )}
              </div>
            )}

            <button
              type="submit"
              className={
                styles.confirmButton
              }
              disabled={
                !(
                  selectedDate &&
                  selectedTime &&
                  name &&
                  phone &&
                  selectedSeats.length
                )
              }
            >
              Book Tickets
            </button>

          </form>
        )}
      </div>
    </div>
  );
}

export default Modal;