import React from "react";
import { Link } from "react-router-dom";
import "../styles/notFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="pageBackground404">
      <div className="container404 notfound-container">
        <h1>404</h1>
        <h2>Сторінку не знайдено</h2>
        <p>На жаль, сторінка, яку ви шукаєте, не існує або була видалена.</p>
        <Link to="/home" className="back-link">
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
}
