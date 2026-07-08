export const THEMES = [
  { id: "cartoon",      label: "Cartoon",      emoji: "🎨", falModel: "fal-ai/flux/schnell" },
  { id: "anime",        label: "Anime",        emoji: "⛩️", falModel: "fal-ai/flux/schnell" },
  { id: "sketch",       label: "Sketch",       emoji: "✏️", falModel: "fal-ai/flux/schnell" },
  { id: "oil_painting", label: "Oil Painting", emoji: "🖼️", falModel: "fal-ai/flux/schnell" },
  { id: "vintage",      label: "Vintage",      emoji: "📷", falModel: "fal-ai/flux/schnell" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

// ponytail: all themes use flux/schnell for MVP; swap per-theme model when budget allows
export const THEME_PROMPTS: Record<string, string> = {
  cartoon:      "transform to cartoon style illustration, vibrant colors, bold outlines",
  anime:        "transform to anime style, detailed, studio ghibli inspired",
  sketch:       "transform to pencil sketch, black and white, detailed linework",
  oil_painting: "transform to oil painting style, textured brushstrokes, impressionist",
  vintage:      "transform to vintage photograph, sepia tones, film grain, retro style",
};