'use client';

import { useAuth } from '@/src/providers/AuthProvider';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const COMMON_LOGIN_ERROR = '아이디 또는 비밀번호를 다시 확인해주세요.';

export default function LoginModal() {
  const pathname = usePathname();
  const { isOpen, close } = useLoginModal();
  const { refreshUser } = useAuth();

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSocialLogin = (provider: 'google' | 'naver' | 'kakao') => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/oauth2/authorization/${provider}`;
  };

  const closeAndReset = () => {
    setId('');
    setPw('');
    setErrorMsg('');
    setSubmitting(false);
    close();
  };

  useEffect(() => {
    if (isOpen) closeAndReset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (isOpen) {
      setId('');
      setPw('');
      setErrorMsg('');
      setSubmitting(false);
    }
  }, [isOpen]);

  // 입력 바뀌면 에러 지우기 (가입 step1 스타일)
  useEffect(() => {
    if (errorMsg) setErrorMsg('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pw]);

  if (!isOpen) return null;

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // 간단한 클라 검증(너무 과하지 않게)
    if (!id.trim() || !pw.trim()) {
      setErrorMsg(COMMON_LOGIN_ERROR);
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: id, password: pw }),
      });

      if (!res.ok) {
        setErrorMsg(COMMON_LOGIN_ERROR);
        return;
      }

      await refreshUser();
      closeAndReset();
      window.location.assign('/');
    } catch {
      setErrorMsg('서버 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasError = !!errorMsg;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeAndReset} />

      <div className="relative w-[400px] bg-white rounded-lg p-10 shadow-xl z-[1000]">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-black"
          onClick={closeAndReset}
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold text-center mb-6">TexTok에 로그인</h1>

        <form onSubmit={onLogin} className="flex flex-col gap-3" noValidate>
          <input
            className={`w-full px-4 py-3 rounded-md text-sm outline-none transition
              ${hasError ? 'border border-red-500 bg-gray-100 focus:bg-white' : 'border border-gray-300'}
            `}
            placeholder="TexTok ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
          />

          <input
            type="password"
            className={`w-full px-4 py-3 rounded-md text-sm outline-none transition
              ${hasError ? 'border border-red-500 bg-gray-100 focus:bg-white' : 'border border-gray-300'}
            `}
            placeholder="비밀번호"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="current-password"
          />

          {/* ✅ Step1 스타일: 작고, 아이콘 포함, 인풋 아래 */}
          {hasError && (
            <p className="text-red-500 text-[13px] flex items-center gap-1 -mt-1">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-md text-sm font-medium transition
              ${submitting ? 'bg-blue-300 text-white' : 'bg-[#2979FF] text-white hover:bg-blue-600'}
            `}
          >
            {submitting ? '로그인 중…' : '로그인'}
          </button>
        </form>

        <div className="text-sm text-gray-500 mt-4 mb-6 flex items-center justify-center gap-3">
          <Link
            href="/auth/find-id"
            onClick={closeAndReset}
            className="hover:text-blue-600 transition"
          >
            아이디 찾기
          </Link>
          <span>|</span>
          <Link
            href="/auth/find-password"
            onClick={closeAndReset}
            className="hover:text-blue-600 transition"
          >
            비밀번호 찾기
          </Link>
          <span>|</span>
          <Link
            href="/auth/register"
            onClick={closeAndReset}
            className="hover:text-blue-600 transition"
          >
            회원가입
          </Link>
        </div>

        <div className="space-y-2 mt-4">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:shadow-sm hover:bg-gray-50 transition"
          >
            <Image src="/icons/google.png" alt="Google" width={20} height={20} />
            <span className="text-sm text-gray-700 font-medium">Google로 계속하기</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('naver')}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:shadow-sm hover:bg-gray-50 transition"
          >
            <Image src="/icons/naver.png" alt="Naver" width={20} height={20} />
            <span className="text-sm text-gray-700 font-medium">Naver로 계속하기</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('kakao')}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:shadow-sm hover:bg-gray-50 transition"
          >
            <Image src="/icons/kakao.png" alt="Kakao" width={20} height={20} />
            <span className="text-sm text-gray-700 font-medium">Kakao로 계속하기</span>
          </button>
        </div>
      </div>
    </div>
  );
}
