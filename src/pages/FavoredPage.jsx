import React, { useEffect, useState } from "react";
import styles from "../styles/Favored.module.css";

function FavoredPage() {
  const [movies, setMovies] = useState([]);

  return (
    <div className={styles.favoredPage}>
      <h2>Favorites</h2>
    </div>
  );
}

export default FavoredPage;