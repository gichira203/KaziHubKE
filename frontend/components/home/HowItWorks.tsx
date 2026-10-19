"use client";

import { useState } from "react";
import SectionHeading from "@/components/common/SectionHeading";
import { journeys } from "@/data/howItWorks";
import styles from "./HowItWorks.module.css";

/** Tabbed section: one card set per user journey (job seeker, tasker, employer). */
export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState(journeys[0].id);

  const activeJourney = journeys.find((journey) => journey.id === activeTab) ?? journeys[0];

  return (
    <section className={styles.section} id="how-it-works" aria-labelledby="how-title">
      <div className={styles.container}>
        <div id="how-title">
          <SectionHeading
            eyebrow="How It Works"
            title="Three Simple Paths"
            description="Whether you are looking for work, completing online tasks, or hiring talent, KaziHub KE keeps the process clear from start to finish."
          />
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Choose a user journey">
          {journeys.map((journey) => (
            <button
              key={journey.id}
              role="tab"
              id={`tab-${journey.id}`}
              aria-selected={activeTab === journey.id}
              aria-controls={`panel-${journey.id}`}
              className={`${styles.tab} ${activeTab === journey.id ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(journey.id)}
            >
              <journey.icon size={18} aria-hidden="true" />
              {journey.label}
            </button>
          ))}
        </div>

        <div
          role="tabpanel"
          id={`panel-${activeJourney.id}`}
          aria-labelledby={`tab-${activeJourney.id}`}
          className={styles.panel}
        >
          <h3 className={styles.panelTitle}>{activeJourney.title}</h3>
          <ol className={styles.steps}>
            {activeJourney.steps.map((step, index) => (
              <li key={step} className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <p className={styles.stepText}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
