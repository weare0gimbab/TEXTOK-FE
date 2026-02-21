'use client';

import Link from 'next/link';

export default function ShorlogDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-6xl">😢</div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">
          숏로그를 불러올 수 없습니다
        </h2>
        <p className="mb-6 text-sm text-slate-600">
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="flex-1 rounded-full bg-[#2979FF] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1863db] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2979FF]"
          >
            다시 시도
          </button>
          <Link
            href="/shorlog/feed"
            className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
          >
            피드로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

