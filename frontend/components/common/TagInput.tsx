"use client";

/**
 * Tag input — type to search suggestions, press Enter or click a suggestion to
 * add a tag, click × or press Backspace on an empty field to remove.
 *
 * Used for desired job titles, skills, languages, certifications, locations.
 * Tags come from the user (or the suggestion list) — nothing is invented.
 */
import { useMemo, useState } from "react";
import { useId } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./TagInput.module.css";

type TagInputProps = {
  label: string;
  name: string;
  tags: string[];
  suggestions?: readonly string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
  maxTags?: number;
  /** Labels for the suggestion list, e.g. { JavaScript: "JavaScript" }. */
  renderSuggestion?: (suggestion: string) => string;
};

export default function TagInput({
  label,
  name,
  tags,
  suggestions,
  onChange,
  placeholder = "Type and press Enter",
  helperText,
  maxTags = 30,
  renderSuggestion,
}: TagInputProps) {
  const reactId = useId();
  const listId = `${name}-${reactId}-list`;
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!suggestions) return [];
    const lower = query.trim().toLowerCase();
    return suggestions
      .filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()))
      .filter((s) => !lower || s.toLowerCase().includes(lower))
      .slice(0, 8);
  }, [suggestions, tags, query]);

  const addTag = (raw: string) => {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return;
    if (tags.some((t) => t.toLowerCase() === value.toLowerCase())) return;
    if (tags.length >= maxTags) return;
    onChange([...tags, value]);
    setQuery("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(query);
    } else if (event.key === "Backspace" && !query && tags.length) {
      removeTag(tags.length - 1);
    }
  };

  const atLimit = tags.length >= maxTags;

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={`${name}-${reactId}`}>
        {label}
        <span className={styles.optional}> (optional)</span>
      </label>

      <div className={styles.tagBox}>
        {tags.map((tag, index) => (
          <span className={styles.tag} key={tag}>
            {tag}
            <button
              type="button"
              className={styles.tagRemove}
              onClick={() => removeTag(index)}
              aria-label={`Remove ${tag}`}
            >
              <X size={13} aria-hidden="true" />
            </button>
          </span>
        ))}

        <input
          id={`${name}-${reactId}`}
          type="text"
          className={styles.input}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length ? "Add another" : placeholder}
          disabled={atLimit}
          list={suggestions ? listId : undefined}
          aria-describedby={helperText ? `${name}-${reactId}-helper` : undefined}
        />
      </div>

      {helperText ? (
        <p className={styles.helper} id={`${name}-${reactId}-helper`}>
          {helperText}
          {atLimit ? ` Limit of ${maxTags} reached.` : ""}
        </p>
      ) : null}

      {suggestions && filtered.length > 0 ? (
        <ul className={styles.suggestions} aria-label={`${label} suggestions`}>
          {filtered.map((suggestion) => (
            <li key={suggestion}>
              <button
                type="button"
                className={cx(styles.suggestion)}
                onClick={() => addTag(suggestion)}
              >
                {renderSuggestion ? renderSuggestion(suggestion) : suggestion}
                <span className={styles.suggestionAdd} aria-hidden="true">
                  + Add
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
