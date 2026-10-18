import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Teach tailwind-merge about our custom font-size tokens so they don't clash with text colours.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display-2xl", "display-xl", "display-lg", "display-md", "display-sm", "2xs"] },
      ],
      shadow: [{ shadow: ["tag", "press"] }],
    },
  },
});

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
