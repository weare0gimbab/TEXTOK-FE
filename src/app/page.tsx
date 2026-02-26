'use client';

import { useCurrentUser } from '@/src/hooks/useCurrentUser';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import clsx from 'clsx';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './components/common/LoadingSpinner';

type MockupProps = {
  src: string;
  alt: string;
  urlText?: string;
  priority?: boolean;
  className?: string;
};

// 데스크탑/웹 캡쳐용 (가로 비율)
export function BrowserMockup({
  src,
  alt,
  urlText = 'textok.store',
  priority,
  className,
}: MockupProps) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70',
        className,
      )}
    >
      <div className="flex h-9 items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
        <span className="ml-2 rounded-full bg-white/80 px-3 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">
          {urlText}
        </span>
      </div>

      {/* 핵심: 비율 고정 + fill */}
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 520px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

// 모바일 캡쳐용 (세로 비율) - 폰 프레임
export function PhoneMockup({ src, alt, priority, className }: MockupProps) {
  return (
    <div
      className={clsx('rounded-[2rem] border  bg-white shadow-2xl shadow-slate-100/70', className)}
    >
      <div className="rounded-[1.6rem] border border-slate-100 bg-black/5 p-2">
        {/* 9:16 비율 */}
        <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.25rem] bg-white">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 360px, (min-width: 768px) 40vw, 85vw"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
function PreviewRow({
  eyebrow,
  title,
  desc,
  mockup,
  reverse = false,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  mockup: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className={clsx(reverse && 'lg:order-2')}>{mockup}</div>

      <div className={clsx(reverse ? 'lg:order-1 lg:pl-6' : 'lg:pr-6')}>
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">{eyebrow}</p>
        <h3 className="mt-3 text-2xl font-extrabold leading-tight text-slate-900 md:text-3xl">
          {title}
        </h3>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-500 md:text-base">{desc}</p>
      </div>
    </div>
  );
}
const FEATURES = [
  {
    icon: '⚡',
    title: '빠른 기록',
    desc: '떠오른 생각을 숏로그로 즉시 저장',
  },
  {
    icon: '📝',
    title: '확장된 글쓰기',
    desc: '짧은 글을 블로그로 자유롭게 확장',
  },
  {
    icon: '✨',
    title: 'AI 글쓰기 보조',
    desc: '초안, 정리, 다듬기까지 AI가 지원',
  },
  {
    icon: '🔍',
    title: '구조화된 검색',
    desc: '해시태그와 검색으로 쉽게 발견',
  },
];

const STATS = [
  { num: '1,000+', label: '활성 사용자' },
  { num: '5,000+', label: '작성된 글' },
  { num: '10,000+', label: '공유된 생각' },
];

export default function MainPage() {
  const router = useRouter();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { open: openLoginModal } = useLoginModal();

  const handleLogin = () => openLoginModal();
  const handleShorlogClick = () => router.push('/shorlog/feed');
  const handleBlogClick = () => router.push('/blogs');

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/60">
        {/* 배경 dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: 텍스트 */}
            <div>
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-600">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
                TEXTOK
              </div>

              {/* Headline */}
              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl">
                생각을 남기고,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                  확장하고, 연결하세요.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-500 md:text-lg">
                짧은 생각은 숏로그로 빠르게, 깊은 이야기는 블로그로 천천히.
                <br className="hidden md:block" />
                AI와 함께 더 나은 글을 쓰는 양방향 텍스트 경험.
              </p>

              {/* CTA */}
              <div className="mt-8 flex flex-wrap gap-3">
                {isLoading ? (
                  <div className="flex h-11 w-36 items-center justify-center rounded-xl bg-slate-100">
                    <LoadingSpinner />
                  </div>
                ) : currentUser ? (
                  <>
                    <button
                      onClick={handleShorlogClick}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0"
                    >
                      숏로그 둘러보기 <span aria-hidden>→</span>
                    </button>
                    <button
                      onClick={handleBlogClick}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
                    >
                      블로그 둘러보기
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleLogin}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-0"
                    >
                      시작하기 <span aria-hidden>→</span>
                    </button>
                    <button
                      onClick={handleShorlogClick}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:translate-y-0"
                    >
                      둘러보기
                    </button>
                  </>
                )}
              </div>

              {/* Stats */}
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-100 pt-8">
                {STATS.map(({ num, label }) => (
                  <div key={label}>
                    <p className="text-2xl font-extrabold text-slate-900">{num}</p>
                    <p className="text-xs text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 앱 미리보기 이미지 */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 shadow-2xl shadow-slate-200/70">
                {/* 브라우저 크롬 */}
                <div className="flex h-9 items-center gap-1.5 border-b border-slate-100 bg-slate-50 px-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="ml-2 rounded-full bg-white/80 px-3 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">
                    textok.store
                  </span>
                </div>
                <Image
                  src="/icons/main_page.jpg"
                  alt="텍톡 서비스 화면"
                  width={600}
                  height={420}
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">핵심 기능</p>
          <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">텍톡이 특별한 이유</h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-xl transition-transform duration-200 group-hover:scale-110">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Screenshot Section ───────────────────────────── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              서비스 미리보기
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900 md:text-3xl">
              내가 고른 글이 한눈에, 편하게
            </h2>
          </div>

          <div className="mt-16 space-y-16">
            <PreviewRow
              reverse
              eyebrow="AI"
              title="AI로 초안부터 다듬기까지"
              desc="생각은 빠르게 남기고, 문장은 AI로 정리해서 완성도를 올리세요."
              mockup={
                <div className="mx-auto w-full max-w-[360px] w-[min(360px,100%)]">
                  <PhoneMockup src="/screenshots/ai.png" alt="AI 글쓰기 화면" />
                </div>
              }
            />
            <PreviewRow
              eyebrow="COLLECT"
              title="매번 찾기 번거로운 글, 한 곳에 모아두기"
              desc="북마크, 나의 글 기반으로 저장해두고, 필요한 순간에 바로 꺼내보세요."
              mockup={
                <div className="w-[min(380px,92vw)]">
                  <PhoneMockup
                    src="/screenshots/collect2.png"
                    alt="텍톡 북마크 화면"
                    urlText="textok.store"
                  />
                </div>
              }
            />

            <PreviewRow
              reverse
              eyebrow="DISCOVER"
              title="원하는 글을 빠르게 찾고, 바로 이어서 읽기"
              desc="검색과 정렬로 탐색을 단순화하고, 마음에 드는 글은 저장해 흐름을 끊지 않게."
              mockup={
                <div className="mx-auto w-full max-w-[360px] w-[min(360px,100%)]">
                  <PhoneMockup
                    src="/screenshots/search2.png"
                    alt="텍톡 검색/피드 화면"
                    urlText="textok.store"
                  />
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">지금 바로 시작해보세요</h2>
          <p className="mt-4 text-sm text-slate-500">
            생각을 기록하고, 이야기로 확장하고, 세상과 연결하세요.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            {currentUser ? (
              <button
                onClick={handleShorlogClick}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                숏로그 피드 바로가기 <span aria-hidden>→</span>
              </button>
            ) : (
              <button
                onClick={handleLogin}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700"
              >
                시작하기 <span aria-hidden>→</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
