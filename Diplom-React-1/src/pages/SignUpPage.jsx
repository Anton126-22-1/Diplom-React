import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";

import styles from "../styles/auth.module.css";
import useAuth from "../hooks/useAuth";

const signUpSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email")
      .nonempty("Email is required"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters long")
      .nonempty("Password is required"),

    confirmPassword: z
      .string()
      .nonempty("Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const SignUpPage = () => {
  const navigate = useNavigate();

  const { register: authRegister } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data) => {
    try {
      const response = await authRegister({
        email: data.email,
        password: data.password,
      });

      if (!response.success) {
        setError("email", {
          type: "manual",
          message: response?.error,
        });

        return;
      }

      navigate("/");
    } catch (error) {
      console.error(error);

      setError("general", {
        type: "manual",
        message: "An error occurred. Please try again later.",
      });
    }
  };

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Registration</h1>

      {errors.general && (
        <p className={styles.field__error}>
          {errors.general.message}
        </p>
      )}

      <form
        className={styles.form}
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.field}>
          <input
            className={styles.field__input}
            type="email"
            placeholder="Your email"
            {...register("email")}
          />

          {errors.email && (
            <p className={styles.field__error}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <input
            className={styles.field__input}
            type="password"
            placeholder="Your password"
            {...register("password")}
          />

          {errors.password && (
            <p className={styles.field__error}>
              {errors.password.message}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <input
            className={styles.field__input}
            type="password"
            placeholder="Repeat password"
            {...register("confirmPassword")}
          />

          {errors.confirmPassword && (
            <p className={styles.field__error}>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          className={styles.btn__submit}
          type="submit"
        >
          Register
        </button>
      </form>

      <div className={styles.text}>
        Already have an account?{" "}
        <Link to="/signIn">Sign In</Link>
      </div>
    </div>
  );
};

export default SignUpPage;