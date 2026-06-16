"use client";

// app/login/page.tsx
// Client Component — Supabase Auth（Sign In / Sign Up）
// トップページ（/）のデザイントークン（ネイビー × アンバー）と統一

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// ────────────────────────────────────────────────────────────
// Supabase client（クライアントサイド専用）
// ────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────
type Tab = "signin" | "signup";

// ────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────

/** フォームの入力フィールド */
function Field({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-widest text-slate-400"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        required
        className="
          w-full rounded-xl border border-slate-700 bg-slate-800/60
          px-4 py-3 text-sm text-slate-100 placeholder-slate-500
          outline-none ring-0
          transition-all duration-200
          focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20
          disabled:cursor-not-allowed disabled:opacity-50
        "
      />
    </div>
  );
}

/** エラーメッセージ表示 */
function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
    >
      {/* Icon */}
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

/** 成功メッセージ表示（Sign Up 確認メール送信後） */
function SuccessBanner({ message }: { message: string }) {
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
    >
      <svg
        className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
          clipRule="evenodd"
        />
      </svg>
      <p className="text-sm leading-relaxed text-emerald-300">{message}</p>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Page
// ────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();

  // Tab state
  const [activeTab, setActiveTab] = useState<Tab>("signin");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // タブ切り替え時にフォーム状態をリセット
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setError(null);
    setSuccessMsg(null);
    setEmail("");
    setPassword("");
  };

  // ── Sign In ───────────────────────────────────────────────
  const handleSignIn = () => {
    setError(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "メールアドレスまたはパスワードが正しくありません。"
            : error.message
        );
        return;
      }

      // 成功 → トップページへ
router.refresh();
setTimeout(() => {
  router.push("/");
}, 500);// Server Component のキャッシュをクリア
    });
  };

  // ── Sign Up ───────────────────────────────────────────────
  const handleSignUp = () => {
    setError(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setError("パスワードは6文字以上で入力してください。");
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // 登録後のリダイレクト先（Supabase Dashboard の URL 設定と合わせること）
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSuccessMsg(
        "確認メールを送信しました。メールのリンクをクリックして登録を完了してください。"
      );
      setEmail("");
      setPassword("");
    });
  };

  const handleSubmit = activeTab === "signin" ? handleSignIn : handleSignUp;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-900 px-4 py-12">
      {/* ── 背景の装飾グロー ──────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        {/* メインのアンバーグロー */}
        <div className="h-[500px] w-[500px] rounded-full bg-amber-400/8 blur-[120px]" />
      </div>
      {/* 左上・右下のサブグロー */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-amber-500/5 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-slate-700/40 blur-3xl"
      />

      {/* ── ロゴ / ブランド ───────────────────────────── */}
      <div className="relative mb-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400">
          <svg
            className="h-6 w-6 text-slate-900"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
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
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
          Spots App
        </p>
      </div>

      {/* ── カード ────────────────────────────────────── */}
      <div className="relative w-full max-w-md">
        {/* カードの縁取りグロー（シグネチャ要素） */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-amber-400/20 via-transparent to-transparent"
        />

        <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/80 shadow-2xl backdrop-blur-sm">
          {/* ── タブ ──────────────────────────────────── */}
          <div className="flex border-b border-slate-700/60">
            {(["signin", "signup"] as Tab[]).map((tab) => {
              const label = tab === "signin" ? "ログイン" : "新規登録";
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => switchTab(tab)}
                  className={`
                    relative flex-1 py-4 text-sm font-semibold transition-colors duration-200
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400
                    ${
                      isActive
                        ? "text-amber-400"
                        : "text-slate-400 hover:text-slate-200"
                    }
                  `}
                >
                  {label}
                  {/* アクティブインジケーター */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-amber-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── フォーム本体 ──────────────────────────── */}
          <div className="px-8 py-8">
            <h1 className="mb-1 text-xl font-bold text-slate-100">
              {activeTab === "signin"
                ? "おかえりなさい"
                : "アカウントを作成"}
            </h1>
            <p className="mb-7 text-sm text-slate-400">
              {activeTab === "signin"
                ? "メールアドレスとパスワードでログインしてください。"
                : "メールアドレスとパスワードを入力して登録してください。"}
            </p>

            {/* エラー / 成功バナー */}
            {error && (
              <div className="mb-5">
                <ErrorBanner message={error} />
              </div>
            )}
            {successMsg && (
              <div className="mb-5">
                <SuccessBanner message={successMsg} />
              </div>
            )}

            {/* フォームフィールド */}
            <div className="flex flex-col gap-5">
              <Field
                id="email"
                label="メールアドレス"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                disabled={isPending}
                autoComplete={
                  activeTab === "signin" ? "email" : "email"
                }
              />
              <Field
                id="password"
                label="パスワード"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={
                  activeTab === "signup" ? "6文字以上" : "••••••••"
                }
                disabled={isPending}
                autoComplete={
                  activeTab === "signin"
                    ? "current-password"
                    : "new-password"
                }
              />
            </div>

            {/* Submit button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !email || !password}
              className="
                mt-7 flex w-full items-center justify-center gap-2
                rounded-xl bg-amber-400 px-6 py-3.5
                text-sm font-bold text-slate-900
                shadow-lg shadow-amber-400/20
                transition-all duration-200
                hover:bg-amber-300 hover:shadow-amber-300/30
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800
                disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
              "
            >
              {isPending ? (
                <>
                  {/* ローディングスピナー */}
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
                  <span>処理中...</span>
                </>
              ) : activeTab === "signin" ? (
                "ログイン"
              ) : (
                "アカウントを作成"
              )}
            </button>

            {/* タブ切り替えリンク */}
            <p className="mt-5 text-center text-sm text-slate-400">
              {activeTab === "signin" ? (
                <>
                  アカウントをお持ちでないですか？{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signup")}
                    className="font-semibold text-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:underline"
                  >
                    新規登録
                  </button>
                </>
              ) : (
                <>
                  すでにアカウントをお持ちですか？{" "}
                  <button
                    type="button"
                    onClick={() => switchTab("signin")}
                    className="font-semibold text-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:underline"
                  >
                    ログイン
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* カード下の小テキスト */}
        <p className="mt-6 text-center text-xs leading-relaxed text-slate-500">
          ログインすることで、
          <span className="text-slate-400">利用規約</span>および
          <span className="text-slate-400">プライバシーポリシー</span>
          に同意したものとみなされます。
        </p>
      </div>
    </div>
  );
}