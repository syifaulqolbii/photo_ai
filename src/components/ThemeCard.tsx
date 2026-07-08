import { cn } from "@/lib/utils";

type Theme = { id: string; label: string; emoji: string };

export function ThemeCard({ theme, selected, onClick }: {
  theme: Theme; selected: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col items-center gap-2 rounded-2xl border-2 p-3 transition-all text-center",
      selected
        ? "border-pink-400 bg-gradient-to-b from-pink-50 to-rose-50 shadow-md shadow-pink-100 scale-105"
        : "border-gray-100 bg-gray-50 hover:border-pink-200 hover:bg-pink-50"
    )}>
      <span className="text-3xl">{theme.emoji}</span>
      <span className={cn("text-xs font-bold", selected ? "text-pink-500" : "text-gray-500")}>
        {theme.label}
      </span>
      {selected && <span className="text-[10px] font-black text-pink-400 bg-pink-100 rounded-full px-2 py-0.5">Dipilih</span>}
    </button>
  );
}
