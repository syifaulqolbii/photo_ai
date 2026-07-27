export type KieModel = { id: string; label: string };

const DEFAULT_MODELS: KieModel[] = [
  { id: "flux-2/flex-image-to-image", label: "Flux 2 Flex (I2I)" },
  { id: "flux-2/pro-image-to-image", label: "Flux 2 Pro (I2I)" },
  { id: "gpt-image-2-image-to-image", label: "GPT Image 2 (I2I)" },
];

export function getKieModels(): KieModel[] {
  const raw = process.env.NEXT_PUBLIC_KIE_MODELS;
  if (!raw) return DEFAULT_MODELS;
  const parsed = raw
    .split(",")
    .map(s => s.trim())
    .filter(Boolean)
    .map(entry => {
      const idx = entry.indexOf(":");
      if (idx === -1) return { id: entry, label: entry };
      const id = entry.slice(0, idx).trim();
      const label = entry.slice(idx + 1).trim() || id;
      return { id, label };
    });
  return parsed.length ? parsed : DEFAULT_MODELS;
}
