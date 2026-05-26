import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import FavoritesPage from "./pages/FavoredPage";
import HomePage from "./pages/HomePage";
import MoviePage from "./pages/MoviePage";
import SessionsPage from "./pages/SessionsPage";
import SearchPage from "./pages/SearchPage";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminMoviesPage from "./pages/AdminMoviesPage";
import AdminSessionsPage from "./pages/AdminSessionsPage";
import AdminSliderPage from "./pages/AdminSliderPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import NotFoundPage from "./pages/NotFoundPage";

import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";

import ProfilePage from "./pages/ProfilePage";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import "./styles/App.css";

import Header from "./components/Header/Header";
import Wrapper from "./components/Wrapper";
import Footer from "./components/Footer/Footer";

function AppRoutes() {
  const { user, status, isAuthenticated } =
    useAuth();

  // ⏳ loading
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/home" replace />}
      />

      <Route
        path="/home"
        element={<HomePage />}
      />

      <Route
        path="/sessions"
        element={<SessionsPage />}
      />

      <Route
        path="/signIn"
        element={<SignInPage />}
      />

      <Route
        path="/signUp"
        element={<SignUpPage />}
      />

      <Route
        path="/movie/:id"
        element={<MoviePage />}
      />

      <Route
        path="/search"
        element={<SearchPage />}
      />

      <Route
        path="/favorites"
        element={
          isAuthenticated ? (
            <FavoritesPage />
          ) : (
            <Navigate to="/signIn" />
          )
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticated ? (
            <ProfilePage />
          ) : (
            <Navigate to="/signIn" />
          )
        }
      />

      <Route
        path="/admin"
        element={
          user?.role === "admin" ? (
            <AdminPage />
          ) : (
            <Navigate to="/home" />
          )
        }

      />
      <Route
        path="/admin/users"
        element={
          user?.role === "admin" ? (
           <AdminUsersPage />
          ) : (
            <Navigate to="/home" />
          )
        }

      />
      <Route
        path="/admin/movies"
        element={
          user?.role === "admin" ? (
           <AdminMoviesPage />
          ) : (
           <Navigate to="/home" />
          )
        }

     />
     <Route
  path="/admin/sessions"
  element={<AdminSessionsPage />}
/> 

<Route
  path="/admin/slides"
  element={
    user?.role === "admin" ? (
      <AdminSliderPage />
    ) : (
      <Navigate to="/home" />
    )
  }
/>

<Route
  path="/admin/bookings"
  element={<AdminBookingsPage />}
/>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Wrapper>
          <Header />

          <AppRoutes />

          <Footer />
        </Wrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;