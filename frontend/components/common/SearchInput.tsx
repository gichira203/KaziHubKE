"use client";

/**
 * SearchInput — dashboard search field. The actual navigation is the caller's
 * decision (search results are a backend concern); this component only
 * reports the trimmed query.
 */
import { useState } from "react";
import { Search } from "lucide-react";
import { cx } from "@/lib/cx";

type SearchInputProps = {
  placeholder: string;
  ariaLabel: string;
  onSubmit: (query: string) => void;
  initialValue?: string;
  className?: string;
};

export default function SearchInput({
  placeholder,
  ariaLabel,
  onSubmit,
  initialValue = "",
  className = "",
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);

  return (
    <form
      role="search"
      className={cx("relative", className)}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(query.trim());
      }}
    >
      <Search
        size={15}
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-soft"
      />
      <input
        type="search"
        aria-label={ariaLabel}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        className="h-10 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-[13.5px] text-charcoal outline-none transition placeholder:text-muted-soft focus:border-brand focus:bg-white focus:shadow-[0_0_0_3px_rgba(0,138,46,0.12)]"
      />
    </form>
  );
}
