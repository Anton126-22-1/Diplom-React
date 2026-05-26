import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/search.module.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [allMovies, setAllMovies] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();
  const searchRef = useRef(null);

  // 🔥 ПІДКЛЮЧЕННЯ ДО БД (MongoDB API)
  useEffect(() => {
    fetch("http://localhost:5000/api/movies")
      .then(res => res.json())
      .then(data => {
        setAllMovies(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Movies API error:", err);
        setAllMovies([]);
      });
  }, []);

  // 🔍 live search
  useEffect(() => {
    if (query.trim()) {
      const filtered = allMovies.filter(movie =>
        movie.title?.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredMovies(filtered.slice(0, 4));
      setShowSuggestions(true);
    } else {
      setFilteredMovies([]);
      setShowSuggestions(false);
    }
  }, [query, allMovies]);

  const handleSearch = () => {
    if (query.trim()) {
      navigate(`/search?search=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleMovieSelect = (movieId) => {
    navigate(`/movie/${movieId}`);
    setShowSuggestions(false);
    setQuery("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div ref={searchRef}>
      <form
        className={styles.search}
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch();
        }}
      >
        <div className={styles.search__icon}></div>

        <input
          className={styles.search__field}
          placeholder="What are you looking for"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
        />

        <button type="submit" className={styles.search__submit}>
          <img src="/icons/search_icon.svg" alt="search" />
        </button>
      </form>

      {showSuggestions && filteredMovies.length > 0 && (
        <div className={styles.suggestions}>
          <div className={styles.movieList}>
            {filteredMovies.map(movie => (
              <div key={movie._id} className={styles.movieItem}>
                <button
                  onClick={() => handleMovieSelect(movie._id)}
                  className={styles.movieLink}
                >
                  <img src={movie.poster} alt={movie.title} />
                  <h4>{movie.title}</h4>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;