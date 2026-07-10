export const THEMES = [
  {
    id: "cartoon",
    label: "Cartoon",
    emoji: "🎨",
    falModel: "fal-ai/flux/schnell",
    previewUrl: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&h=400&fit=crop&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1636955840493-f43a02bfa064?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&q=80",
    ],
  },
  {
    id: "anime",
    label: "Anime",
    emoji: "⛩️",
    falModel: "fal-ai/flux/schnell",
    previewUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=600&h=600&fit=crop&q=80",
    ],
  },
  {
    id: "sketch",
    label: "Sketch",
    emoji: "✏️",
    falModel: "fal-ai/flux/schnell",
    previewUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=600&fit=crop&q=80",
    ],
  },
  {
    id: "oil_painting",
    label: "Oil Painting",
    emoji: "🖼️",
    falModel: "fal-ai/flux/schnell",
    previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1510832198440-a52376950479?w=600&h=600&fit=crop&q=80",
    ],
  },
  {
    id: "vintage",
    label: "Vintage",
    emoji: "📷",
    falModel: "fal-ai/flux/schnell",
    previewUrl: "https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=400&h=400&fit=crop&q=80",
    previewImages: [
      "https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&h=600&fit=crop&q=80",
    ],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const THEME_PROMPTS: Record<string, string> = {
  cartoon:      "transform to cartoon style illustration, vibrant colors, bold outlines",
  anime:        "transform to anime style, detailed, studio ghibli inspired",
  sketch:       "transform to pencil sketch, black and white, detailed linework",
  oil_painting: "transform to oil painting style, textured brushstrokes, impressionist",
  vintage:      "transform to vintage photograph, sepia tones, film grain, retro style",
};
