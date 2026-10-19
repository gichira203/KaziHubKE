/** Tiny class-name joiner — filters falsy values and joins with a space. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
