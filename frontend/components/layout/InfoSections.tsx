import styles from "./InfoSections.module.css";

/**
 * InfoSections — shared body renderers for the public informational pages.
 * `ParagraphSections` renders flowing prose (About); `ListSections`
 * renders bulleted policy items (Privacy, Terms, Guidelines).
 * Both keep the same card rhythm so legal pages feel consistent.
 */

export function ParagraphSections({
  sections,
}: {
  sections: { heading: string; paragraphs: string[] }[];
}) {
  return (
    <div className={styles.stack}>
      {sections.map((section) => (
        <section key={section.heading} className={styles.card}>
          <h2 className={styles.cardTitle}>{section.heading}</h2>
          {section.paragraphs.map((text) => (
            <p key={text} className={styles.paragraph}>
              {text}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

export function ListSections({
  sections,
}: {
  sections: { heading: string; items: string[] }[];
}) {
  return (
    <div className={styles.stack}>
      {sections.map((section) => (
        <section key={section.heading} className={styles.card}>
          <h2 className={styles.cardTitle}>{section.heading}</h2>
          <ul className={styles.list}>
            {section.items.map((item) => (
              <li key={item} className={styles.listItem}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
