"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronRight, Pause, Play, Quote, Star, StarHalf } from "lucide-react";
import styles from "./Reviews.module.css";

const reviews = [
  {
    quote: "I can explore jobs and internships together without checking several different sites.",
    name: "Amina K.",
    detail: "Job seeker · Nairobi",
    rating: 4.5,
    image: "/images/reviews/reviewer-1.svg",
  },
  {
    quote: "The student opportunities are easy to browse and the requirements are clear.",
    name: "Brian M.",
    detail: "Student · Mombasa",
    rating: 4.0,
    image: "/images/reviews/reviewer-2.svg",
  },
  {
    quote: "I like having attachments, vacancies and online tasks gathered in one place.",
    name: "Wanjiku N.",
    detail: "Job seeker · Nakuru",
    rating: 5.0,
    image: "/images/reviews/reviewer-3.svg",
  },
  {
    quote: "I would like to see more local internships listed. Some categories feel quiet right now.",
    name: "Kevin O.",
    detail: "Graduate · Kisumu",
    rating: 2.0,
    image: "/images/reviews/reviewer-4.svg",
  },
  {
    quote: "I can find internships and attachments that fit the next stage of my studies.",
    name: "Faith W.",
    detail: "Student · Eldoret",
    rating: 4.5,
    image: "/images/reviews/reviewer-5.svg",
  },
  {
    quote: "It is convenient to check different kinds of work from my phone.",
    name: "Peter T.",
    detail: "KaziHub member · Thika",
    rating: 3.5,
    image: "/images/reviews/reviewer-6.svg",
  },
];

const reviewsPerPage = 3;
const pageCount = Math.ceil(reviews.length / reviewsPerPage);

function Rating({ value }: { value: number }) {
  return (
    <div className={styles.rating} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      <span className={styles.stars} aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => {
          const position = index + 1;
          if (value >= position) {
            return <Star key={position} size={16} fill="currentColor" />;
          }
          if (value >= position - 0.5) {
            return <StarHalf key={position} size={16} fill="currentColor" />;
          }
          return <Star key={position} size={16} />;
        })}
      </span>
      <span className={styles.ratingValue}>{value.toFixed(1)} / 5</span>
    </div>
  );
}

export default function Reviews() {
  const [activePage, setActivePage] = useState(0);
  const [paused, setPaused] = useState(false);
  const visibleReviews = reviews.slice(
    activePage * reviewsPerPage,
    (activePage + 1) * reviewsPerPage,
  );

  useEffect(() => {
    if (paused) return;

    const intervalId = window.setInterval(() => {
      setActivePage((current) => (current + 1) % pageCount);
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [activePage, paused]);

  const showNext = () => {
    setActivePage((current) => (current + 1) % pageCount);
  };

  return (
    <section className={styles.section} aria-labelledby="reviews-title">
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.heading} id="reviews-title">
            What Our <span>Users</span> Say
          </h2>
          <p className={styles.intro}>
            Sample experiences from people exploring opportunities with KaziHub KE.
          </p>
          <p className={styles.sampleNote}>Sample reviews shown for preview.</p>
        </header>

        <div
          className={styles.carousel}
          role="region"
          aria-roledescription="carousel"
          aria-label="Sample user reviews"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
          }}
        >
          <div className={styles.rowWrap}>
            <div className={styles.reviewGrid} aria-live="polite" aria-atomic="true">
              {visibleReviews.map((review) => (
                <article className={styles.reviewCard} key={review.name}>
                  <Quote className={styles.quoteIcon} size={34} fill="currentColor" aria-hidden="true" />
                  <blockquote className={styles.quote}>{review.quote}</blockquote>
                  <div className={styles.cardFooter}>
                    <div className={styles.reviewer}>
                      <Image
                        className={styles.avatar}
                        src={review.image}
                        alt=""
                        width={48}
                        height={48}
                      />
                      <div className={styles.reviewerInfo}>
                        <h3 className={styles.name}>{review.name}</h3>
                        <p className={styles.detail}>{review.detail}</p>
                      </div>
                    </div>
                    <Rating value={review.rating} />
                  </div>
                </article>
              ))}
            </div>
            <button className={styles.nextButton} type="button" onClick={showNext} aria-label="Next reviews">
              <ChevronRight size={23} aria-hidden="true" />
            </button>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.playButton}
              type="button"
              onClick={() => setPaused((current) => !current)}
              aria-label={paused ? "Play automatic review pages" : "Pause automatic review pages"}
              aria-pressed={paused}
            >
              {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
            </button>
            <div className={styles.dots} aria-label="Choose review page">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  className={`${styles.dot} ${index === activePage ? styles.activeDot : ""}`}
                  key={index}
                  type="button"
                  onClick={() => setActivePage(index)}
                  aria-label={`Show review page ${index + 1}`}
                  aria-current={index === activePage ? "true" : undefined}
                />
              ))}
            </div>
            <span className={styles.pageLabel} aria-live="off">
              {activePage + 1} / {pageCount}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
