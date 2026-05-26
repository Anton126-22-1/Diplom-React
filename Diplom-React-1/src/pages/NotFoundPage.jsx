import React from "react";
import { Link } from "react-router-dom";
import "../styles/notFoundPage.css";

export default function NotFoundPage() {
  return (
    <div className="pageBackground404">
      <div className="container404 notfound-container">
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>Unfortunately, the page you are looking for does not exist or has been deleted.</p>
        <Link to="/home" className="back-link">
          Return to home page
        </Link>
      </div>
    </div>
  );
}
