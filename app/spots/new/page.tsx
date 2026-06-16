"use client";
 
// app/spots/new/page.tsx
// Client Component — 新規スポット投稿画面（要ログイン）
 
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
 
// ────────────────────────────────────────────────────────────
// Supabase client
// ────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
 
// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────
 
function Field({
  id,
  label,
  hint,
  required = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-slate-400"
      >
        {label}
        {required && (
          <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
            必須
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
 
function Input({
  id,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
}: {
  id: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      className="
        w-full rounded-xl border border-slate-700 bg-slate-800/60
        px-4 py-3 text-sm text-slate-100 placeholder-slate-500
        outline-none transition-all duration-200
        focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
        disabled:cursor-not-allowed disabled:opacity-50
      "
    />
  );
}
 
function Textarea({
  id,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 4,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className="
        w-full resize-none rounded-xl border border-slate-700 bg-slate-800/60
        px-4 py-3 text-sm leading-relaxed text-slate-100 placeholder-slate-500
        outline-none transition-all duration-200
        focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
        disabled:cursor-not-allowed disabled:opacity-50
      "
    />
  );
}
 
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
    >
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm leading-relaxed text-red-300">{message}</p>
    </div>
  );
}
 
/** 画像URLプレビュー */
function ImagePreview({ url }: { url: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
 
  useEffect(() => {
    if (!url) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
  }, [url]);
 
  if (!url) return null;
 
  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/40">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="プレビュー"
        onLoad={() => setStatus("ok")}
        onError={() => setStatus("error")}
        className={`h-48 w-full object-cover transition-opacity duration-300 ${
          status === "ok" ? "opacity-100" : "opacity-0"
        }`}
      />
      {status === "loading" && (
        <div className="flex h-48 items-center justify-center">
          <svg
            className="h-5 w-5 animate-spin text-amber-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}
      {status === "error" && (
        <div className="flex h-16 items-center justify-center gap-2 text-xs text-red-400">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          この URL の画像を読み込めませんでした
        </div>
      )}
    </div>
  );
}
 
/** 認証確認中のスケルトン */
function AuthCheckingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="h-8 w-8 animate-spin text-amber-400"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        <p className="text-sm text-slate-400">認証状態を確認中...</p>
      </div>
    </div>
  );
}
 
// ────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────
export default function NewSpotPage() {
  const router = useRouter();
 
  // 認証チェック
  const [authChecked, setAuthChecked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
 
  // フォーム
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
 
  // UI
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
 
  // ── 認証ガード ────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
 
      if (!session) {
        // 未ログイン → /login へリダイレクト
        router.replace("/login");
        return;
      }
 
      setUserId(session.user.id);
      setAuthChecked(true);
    })();
  }, [router]);
 
  // 認証確認中はスピナーを表示
  if (!authChecked) return <AuthCheckingScreen />;
 
  // ── フォーム送信 ──────────────────────────────────────────
  const handleSubmit = () => {
    setError(null);
 
    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }
 
    startTransition(async () => {
      const { error: insertError } = await supabase.from("spots").insert({
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl.trim() || null,
        user_id: userId,
      });
 
      if (insertError) {
        setError(`投稿に失敗しました: ${insertError.message}`);
        return;
      }
 
      // 成功 → トップへ
      router.push("/");
      router.refresh();
    });
  };
 
  const isSubmittable = title.trim().length > 0 && !isPending;
 
  // ── Render ────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-900 px-4 py-16">
      {/* 背景グロー */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-start justify-center pt-32"
      >
        <div className="h-[400px] w-[600px] rounded-full bg-amber-400/6 blur-[100px]" />
      </div>
 
      <div className="relative mx-auto max-w-2xl">
        {/* ── ヘッダー ──────────────────────────────────── */}
        <div className="mb-10 flex items-center gap-4">
          {/* 戻るボタン */}
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            className="
              flex h-10 w-10 flex-shrink-0 items-center justify-center
              rounded-xl border border-slate-700 bg-slate-800/60 text-slate-400
              transition-colors hover:border-slate-600 hover:text-slate-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
            "
            aria-label="戻る"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
 
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
              New Spot
            </p>
            <h1 className="mt-0.5 font-playfair text-2xl font-bold text-slate-100 sm:text-3xl">
              スポットを投稿する
            </h1>
          </div>
        </div>
 
        {/* ── フォームカード ────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/80 shadow-2xl backdrop-blur-sm">
          {/* カード上端のアクセントライン */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
 
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            {/* エラーバナー */}
            {error && (
              <div className="mb-6">
                <ErrorBanner message={error} />
              </div>
            )}
 
            <div className="flex flex-col gap-7">
              {/* タイトル */}
              <Field id="title" label="タイトル" required>
                <Input
                  id="title"
                  value={title}
                  onChange={setTitle}
                  placeholder="例：夕暮れが美しい展望台"
                  disabled={isPending}
                />
              </Field>
 
              {/* 説明文 */}
              <Field
                id="description"
                label="説明文"
                hint="このスポットの魅力や行き方などを自由に書いてください。"
              >
                <Textarea
                  id="description"
                  value={description}
                  onChange={setDescription}
                  placeholder="例：夕方になると空一面がオレンジ色に染まり、街を一望できる絶景スポットです。"
                  disabled={isPending}
                  rows={5}
                />
              </Field>
 
              {/* 画像URL */}
              <Field
                id="image_url"
                label="画像 URL"
                hint="公開されている画像の URL を入力するとプレビューが表示されます。"
              >
                <Input
                  id="image_url"
                  type="url"
                  value={imageUrl}
                  onChange={setImageUrl}
                  placeholder="https://example.com/photo.jpg"
                  disabled={isPending}
                />
                {/* プレビュー */}
                <div className="mt-2">
                  <ImagePreview url={imageUrl} />
                </div>
              </Field>
 
              {/* 文字数カウンター（タイトル） */}
              <div className="-mt-3 flex justify-end">
                <span
                  className={`text-xs tabular-nums transition-colors ${
                    title.length > 80 ? "text-red-400" : "text-slate-500"
                  }`}
                >
                  {title.length} / 100
                </span>
              </div>
            </div>
 
            {/* 区切り線 */}
            <div className="my-8 border-t border-slate-700/60" />
 
            {/* アクションボタン */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              {/* キャンセル */}
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isPending}
                className="
                  rounded-xl border border-slate-700 bg-transparent
                  px-6 py-3 text-sm font-semibold text-slate-300
                  transition-colors hover:border-slate-500 hover:text-slate-100
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                キャンセル
              </button>
 
              {/* 投稿 */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isSubmittable}
                className="
                  flex items-center justify-center gap-2
                  rounded-xl bg-amber-400 px-8 py-3
                  text-sm font-bold text-slate-900
                  shadow-lg shadow-amber-400/20
                  transition-all duration-200
                  hover:bg-amber-300 hover:shadow-amber-300/30
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800
                  disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none
                "
              >
                {isPending ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    投稿中...
                  </>
                ) : (
                  <>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    スポットを投稿
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
 
        {/* 補足テキスト */}
        <p className="mt-5 text-center text-xs text-slate-500">
          投稿したスポットはすぐにトップページに反映されます。
        </p>
      </div>
    </div>
  );
}