import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/require-session";
import { db } from "@/lib/db";
import { themes } from "@/db/schema";

const SEED = [
  { id: "cartoon", label: "Cartoon", emoji: "🎨", prompt: "transform to cartoon style illustration, vibrant colors, bold outlines", previewUrl: "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=400&h=400&fit=crop&q=80", previewImages: JSON.stringify(["https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1636955840493-f43a02bfa064?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&q=80"]), sortOrder: 0 },
  { id: "anime", label: "Anime", emoji: "⛩️", prompt: "transform to anime style, detailed, studio ghibli inspired", previewUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=400&fit=crop&q=80", previewImages: JSON.stringify(["https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1560942485-b2a11cc13456?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=600&h=600&fit=crop&q=80"]), sortOrder: 1 },
  { id: "sketch", label: "Sketch", emoji: "✏️", prompt: "transform to pencil sketch, black and white, detailed linework", previewUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop&q=80", previewImages: JSON.stringify(["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&h=600&fit=crop&q=80"]), sortOrder: 2 },
  { id: "oil_painting", label: "Oil Painting", emoji: "🖼️", prompt: "transform to oil painting style, textured brushstrokes, impressionist", previewUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop&q=80", previewImages: JSON.stringify(["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1510832198440-a52376950479?w=600&h=600&fit=crop&q=80"]), sortOrder: 3 },
  { id: "vintage", label: "Vintage", emoji: "📷", prompt: "transform to vintage photograph, sepia tones, film grain, retro style", previewUrl: "https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=400&h=400&fit=crop&q=80", previewImages: JSON.stringify(["https://images.unsplash.com/photo-1464820453369-31d2c0b651af?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=600&h=600&fit=crop&q=80","https://images.unsplash.com/photo-1504703395950-b89145a5425b?w=600&h=600&fit=crop&q=80"]), sortOrder: 4 },
];

export async function POST(req: NextRequest) {
  const denied = await requireSession(req);
  if (denied) return denied;
  await db.insert(themes).values(SEED).onConflictDoNothing();
  return NextResponse.json({ ok: true, seeded: SEED.length });
}