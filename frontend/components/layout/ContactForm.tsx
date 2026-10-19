"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import styles from "./ContactForm.module.css";

/**
 * ContactForm — demonstration form. Message delivery needs the backend
 * (see the master plan, Phase 7), so this form validates input and then
 * says plainly that it is not connected yet — it never pretends a
 * message was sent.
 */
export default function ContactForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!validEmail) {
      setError("Enter a valid email address so we can reply to you.");
      return;
    }
    if (message.trim().length < 10) {
      setError("Please describe your enquiry in at least 10 characters.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2 className={styles.title}>Send us a message</h2>

      <label className={styles.label} htmlFor="contact-email">
        Your email
        <input
          id="contact-email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>

      <label className={styles.label} htmlFor="contact-message">
        Message
        <textarea
          id="contact-message"
          className={styles.textarea}
          rows={5}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="How can we help?"
        />
      </label>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {submitted && (
        <p className={styles.notice} role="status">
          <Info size={15} aria-hidden="true" />
          Delivery is not connected yet — this demonstration form does not send messages. Email{" "}
          <strong>hello@kazihub.co.ke</strong> directly and we will respond.
        </p>
      )}

      <button type="submit" className={styles.submit}>
        Submit enquiry
      </button>
    </form>
  );
}
