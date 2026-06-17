// app/page.tsx
// Next.js 14 App Router — Server Component
// Fetches all spots from Supabase and renders a responsive card grid.
 
import { createServerSupabaseClient } from "@/lib/supabase";
import { redirect } from 'next/navigation';
import Image from "next/image";
 
// ────────────────────────────────────────────────────────────
// Type
// ────────────────────────────────────────────────────────────
type Spot = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};
 
// ────────────────────────────────────────────────────────────
// Data fetching (server-side, no cache = always fresh)
// ────────────────────────────────────────────────────────────
async function getSpots(): Promise<Spot[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
 
  const { data, error } = await supabase
    .from("spots")
    .select("id, title, description, image_url, created_at")
    .order("created_at", { ascending: false });
 
  if (error) {
    console.error("[Supabase] spots fetch error:", error.message);
    return [];
  }
 
  return data ?? [];
}
 
// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────
 
function SpotCard({ spot }: { spot: Spot }) {
  const formattedDate = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(spot.created_at));
 
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-slate-200/60 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:ring-amber-400/50">
      {/* Thumbnail */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-100">
        {spot.image_url ? (
          <Image
            src={spot.image_url}
            alt={spot.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // Placeholder when no image is provided
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-14 w-14 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 19.5h16.5M13.5 3.75h.008v.008H13.5V3.75z"
              />
            </svg>
          </div>
        )}
 
        {/* Amber accent bar — the card's signature element */}
        <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-amber-400 transition-all duration-300 group-hover:w-full" />
      </div>
 
      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h2 className="line-clamp-2 font-playfair text-xl font-semibold leading-snug text-slate-900 group-hover:text-amber-600 transition-colors duration-200">
          {spot.title}
        </h2>
 
        {spot.description && (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500">
            {spot.description}
          </p>
        )}
 
        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <time
            dateTime={spot.created_at}
            className="text-xs font-medium text-slate-400"
          >
            {formattedDate}
          </time>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-200">
            スポット
          </span>
        </div>
      </div>
    </article>
  );
}
 
function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-50">
        <svg
          className="h-10 w-10 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
          />
        </svg>
      </div>
      <p className="text-base font-medium text-slate-600">
        まだスポットが登録されていません
      </p>
      <p className="text-sm text-slate-400">
        最初のスポットを追加して地図を彩りましょう。
      </p>
    </div>
  );
}
 
// ────────────────────────────────────────────────────────────
// Page (Server Component)
// ────────────────────────────────────────────────────────────

export default async function HomePage() {
const supabase = await createServerSupabaseClient();
  
const { data: { session } } = await supabase.auth.getSession();
  
if (!session) {
  redirect('/login');
}


  const spots = await getSpots();
 
  return (
    <>
      {/*
        Google Fonts — Playfair Display for display headings.
        Add this to app/layout.tsx <head> if not already present:
 
        import { Inter, Playfair_Display } from "next/font/google"
        const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
        const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })
 
        Then in tailwind.config.ts extend fontFamily:
          fontFamily: {
            inter: ["var(--font-inter)", "sans-serif"],
            playfair: ["var(--font-playfair)", "serif"],
          },
      */}
 
      <div className="min-h-screen bg-slate-50">
        {/* ── Hero / Header ─────────────────────────────── */}
        <header className="relative overflow-hidden bg-slate-900 px-6 py-20 text-center sm:py-28">
          {/* Decorative amber glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />
          </div>
 
          <p className="relative mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Discover
          </p>
 
          <h1 className="relative font-playfair text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            あなたの旅を彩る
            <br />
            <span className="text-amber-400">スポット</span>を見つけよう
          </h1>
 
          <p className="relative mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400">
            全国のおすすめスポットを厳選してご紹介。
            <br className="hidden sm:block" />
            次の目的地へのインスピレーションを見つけてください。
          </p>
 
          {/* Count badge */}
          {spots.length > 0 && (
            <div className="relative mt-8 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/60 px-5 py-2 text-sm text-slate-300 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              {spots.length} スポット掲載中
            </div>
          )}
        </header>
 
        {/* ── Main content ──────────────────────────────── */}
        <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          {/* Section label */}
          <div className="mb-8 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              All Spots
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>
 
          {/* Card grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {spots.length === 0 ? (
              <EmptyState />
            ) : (
              spots.map((spot) => <SpotCard key={spot.id} spot={spot} />)
            )}
          </div>
        </main>
 
        {/* ── Footer ────────────────────────────────────── */}
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Spots App. All rights reserved.
        </footer>
      </div>
    </>
  );
}
 