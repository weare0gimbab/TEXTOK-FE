'use client';

import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ResetPasswordPage() {
  const router = useRouter();

  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');

  const [pwError, setPwError] = useState('');
  const [pwCheckError, setPwCheckError] = useState('');
  const [formError, setFormError] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    const u = sessionStorage.getItem('fp_username');
    const e = sessionStorage.getItem('fp_email');
    const t = sessionStorage.getItem('resetPasswordToken');
    return !u || !e || !t ? '유효하지 않은 접근입니다.' : '';
  });

  const [username] = useState<string>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('fp_username') ?? '' : ''
  );
  const [email] = useState<string>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('fp_email') ?? '' : ''
  );
  const [token] = useState<string>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem('resetPasswordToken') ?? '' : ''
  );

  /* ---------------------- Validation ---------------------- */
  const validatePw = (v: string) => {
    if (!v.trim()) {
      setPwError('비밀번호를 입력해주세요.');
      return false;
    }
    if (v.length < 4 || v.length > 30) {
      setPwError('비밀번호는 4~30자여야 합니다.');
      return false;
    }
    setPwError('');
    return true;
  };

  const validatePwCheck = (v: string) => {
    if (!v.trim()) {
      setPwCheckError('비밀번호 확인을 입력해주세요.');
      return false;
    }
    if (v !== pw) {
      setPwCheckError('비밀번호가 일치하지 않습니다.');
      return false;
    }
    setPwCheckError('');
    return true;
  };

  /* ---------------------- Submit ---------------------- */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const isPwValid = validatePw(pw);
    const isPwCheckValid = validatePwCheck(pwCheck);

    if (!isPwValid || !isPwCheckValid) return;

    if (!token || !username || !email) {
      setFormError('유효하지 않은 접근입니다.');
      return;
    }

    try {
      const res = await fetch(`${API}/api/v1/auth/password-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          username,
          newPassword: pw,
          verificationToken: token,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.msg ?? '비밀번호 변경 실패');
        return;
      }

      // 성공: 모든 저장값 삭제
      sessionStorage.removeItem('fp_username');
      sessionStorage.removeItem('fp_email');
      sessionStorage.removeItem('resetPasswordToken');

      router.replace('/auth/success/password-reset');
    } catch {
      setFormError('서버 오류가 발생했습니다.');
    }
  };

  /* ---------------------- UI ---------------------- */
  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">새 비밀번호 설정</h1>
          <p className="text-gray-500 text-sm">다시 로그인할 수 있도록 비밀번호를 변경합니다</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* 비밀번호 */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">새 비밀번호</label>

            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                validatePw(e.target.value);
              }}
              placeholder="4~30자"
              className={`h-11 px-3 w-full rounded-md bg-gray-100 focus:bg-white outline-none
                ${pwError ? 'border border-red-500' : 'border border-transparent focus:border-blue-500'}
              `}
            />

            {pwError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {pwError}
              </p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-1">
            <input
              type="password"
              value={pwCheck}
              onChange={(e) => {
                setPwCheck(e.target.value);
                validatePwCheck(e.target.value);
              }}
              placeholder="비밀번호 확인"
              className={`h-11 px-3 w-full rounded-md bg-gray-100 focus:bg-white outline-none
                ${pwCheckError ? 'border border-red-500' : 'border border-transparent focus:border-blue-500'}
              `}
            />

            {pwCheckError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {pwCheckError}
              </p>
            )}
          </div>

          {/* FORM ERROR */}
          {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

          <button
            type="submit"
            className="w-full h-11 bg-[#2979FF] text-white rounded-md font-semibold hover:bg-[#1f5edb] transition"
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
}
