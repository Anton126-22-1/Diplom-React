import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/movies");
        const data = await res.json();

        setMovies(data);
      } catch (err) {
        console.error("Error loading movies:", err);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/slides");
        const data = await res.json();

        setSlides(data);
      } catch (err) {
        console.error("Error loading slides:", err);
      }
    };

    fetchSlides();
  }, []);

  const handlePrev = () => {
    if (!slides.length) return;

    setCurrentImageIndex((prev) =>
      prev === 0 ? slides.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    if (!slides.length) return;

    setCurrentImageIndex((prev) =>
      prev === slides.length - 1 ? 0 : prev + 1
    );
  };

  useEffect(() => {
    if (slides.length === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 6000);

    return () => clearInterval(interval);
  }, [slides]);

  return (
    <div className={styles.pageBackground}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1>NOW IN THE CINEMA</h1>
        </header>

        <div className={styles.sliderWrapper}>
          <div
            className={styles.sliderTrack}
            style={{
              transform: `translateX(-${currentImageIndex * 100}%)`,
            }}
          >
            {slides.map((slide, index) => (
              <div key={index} className={styles.slide}>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={styles.slideImage}
                />

                <h2 className={styles.slideTitle}>
                  {slide.title}
                </h2>
              </div>
            ))}
          </div>

          <div className={styles.sliderNavigation}>
            <div
              className={styles.scrollbarLeftArrow}
              onClick={handlePrev}
            >
              <img
                src="/Arrow-L.svg"
                alt="Left"
                className={styles.arrowImage}
              />
            </div>

            <div
              className={styles.scrollbarRightArrow}
              onClick={handleNext}
            >
              <img
                src="/Arrow-R.svg"
                alt="Right"
                className={styles.arrowImage}
              />
            </div>
          </div>
        </div>

        <div className={styles.movieDetails}>
          {movies.length > 0 ? (
            movies.map((movie) => (
              <div
                key={movie._id}
                className={styles.moviePosterWrapper}
                onClick={() => navigate(`/movie/${movie._id}`)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className={styles.moviePoster}
                />
                <h2>{movie.title}</h2>

                <p>
                  {movie.duration} {movie.ageRestriction}
                </p>

                <p>
                  {Array.isArray(movie.genres)
                    ? movie.genres.join(", ")
                    : ""}
                </p>
              </div>
            ))
          ) : (
            <p>Loading movies...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;