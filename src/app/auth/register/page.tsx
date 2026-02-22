'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterStep1Page() {
  const router = useRouter();

  // 입력값
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [userId, setUserId] = useState('');
  const [pw, setPw] = useState('');
  const [pwCheck, setPwCheck] = useState('');

  // 인증
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isResent, setIsResent] = useState(false);

  // 검증 메시지
  const [emailError, setEmailError] = useState('');
  const [userIdError, setUserIdError] = useState('');
  const [pwError, setPwError] = useState('');
  const [pwCheckError, setPwCheckError] = useState('');

  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState('');
  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // ID 중복 체크
  const [idAvailable, setIdAvailable] = useState(false);
  const [idCheckMsg, setIdCheckMsg] = useState('');
  const [idCheckLoading, setIdCheckLoading] = useState(false);

  const [formError, setFormError] = useState('');

  /* ------------------------- 실시간 검증 -------------------------- */
  const validateEmail = (v: string) => {
    if (!v.trim()) setEmailError('이메일을 입력해주세요.');
    else if (!emailRegex.test(v)) setEmailError('유효한 이메일 주소가 아닙니다.');
    else setEmailError('');
  };

  const validatePw = (v: string) => {
    if (!v.trim()) setPwError('비밀번호를 입력해주세요.');
    else if (v.length < 4 || v.length > 30) setPwError('비밀번호는 4~30자여야 합니다.');
    else setPwError('');
  };

  const validatePwCheck = (v: string) => {
    if (!v.trim()) setPwCheckError('비밀번호 확인을 입력해주세요.');
    else if (v !== pw) setPwCheckError('비밀번호가 일치하지 않습니다.');
    else setPwCheckError('');
  };

  /* ------------------------- ID 기본 문법 검증 -------------------------- */
  const validateUserId = (v: string) => {
    if (!v.trim()) {
      setUserIdError('TexTok ID를 입력해주세요.');
      return false;
    }
    if (v.length < 4 || v.length > 20) {
      setUserIdError('ID는 4~20자여야 합니다.');
      return false;
    }
    if (!/^[a-z0-9]+$/.test(v)) {
      setUserIdError('영문 소문자 + 숫자만 사용할 수 있습니다.');
      return false;
    }
    setUserIdError('');
    return true;
  };

  /* ------------------------- ID 중복 체크 요청 -------------------------- */
  const onCheckUserId = async () => {
    setIdAvailable(false);
    setIdCheckMsg('');
    setUserIdError('');
    setIdCheckLoading(false);

    if (!validateUserId(userId)) return;

    setIdCheckLoading(true);

    try {
      const res = await fetch(
        `${API}/api/v1/auth/check-username?username=${encodeURIComponent(userId)}`,
      );
      const data = await res.json();

      // 서버 응답 기준: data.data.isAvailable이 진짜 값
      const isAvailable = !!data?.data?.isAvailable;

      if (!res.ok) {
        setIdAvailable(false);
        setUserIdError(data?.msg ?? '서버 오류가 발생했습니다.');
        return;
      }

      if (isAvailable) {
        setIdAvailable(true);
        setIdCheckMsg(data?.msg ?? '사용 가능한 ID입니다.');
        setUserIdError('');
      } else {
        setIdAvailable(false);
        setIdCheckMsg('');
        setUserIdError(data?.msg ?? '이미 사용 중인 ID입니다.');
      }
    } catch {
      setIdAvailable(false);
      setUserIdError('서버 오류가 발생했습니다.');
    } finally {
      setIdCheckLoading(false);
    }
  };

  /* -------------------------- 인증코드 전송 --------------------------- */
  const onSendCode = async () => {
    setSendError('');
    setVerifyMsg('');
    setVerifyError('');

    validateEmail(email);
    if (emailError) return;

    setIsResent(sendSuccess);
    setSendSuccess(true);
    setIsCodeSent(true);

    try {
      const res = await fetch(`${API}/api/v1/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: email,
      });

      const data = await res.json();
      if (!res.ok) {
        setSendSuccess(false);
        setIsCodeSent(false);
        setSendError(data.msg ?? '코드 전송 실패');
      }
    } catch {
      setSendSuccess(false);
      setIsCodeSent(false);
      setSendError('서버 오류가 발생했습니다.');
    }
  };

  /* -------------------------- 인증 코드 검증 --------------------------- */
  const onVerifyCode = async () => {
    setVerifyMsg('');
    setVerifyError('');

    if (!code.trim()) {
      setVerifyError('인증 코드를 입력해주세요.');
      return;
    }

    try {
      const res = await fetch(`${API}/api/v1/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok || !data.data?.emailVerificationToken) {
        setVerifyError(data.msg ?? '인증 실패');
        return;
      }

      setIsCodeVerified(true);
      setVerifyMsg('이메일 인증 완료!');
      sessionStorage.setItem('verification_token', data.data.emailVerificationToken);
    } catch {
      setVerifyError('서버 오류가 발생했습니다.');
    }
  };

  /* -------------------------- 다음 Step --------------------------- */
  const onNext = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const token = sessionStorage.getItem('verification_token');

    if (!isCodeVerified) {
      setFormError('이메일 인증을 완료해주세요.');
      return;
    }
    if (!validateUserId(userId)) {
      setFormError('TexTok ID를 올바르게 입력해주세요.');
      return;
    }
    if (!idAvailable) {
      setFormError('ID 중복 확인을 완료해주세요.');
      return;
    }
    if (!pw.trim()) {
      setFormError('비밀번호를 입력해주세요.');
      return;
    }
    if (pw.length < 4 || pw.length > 30) {
      setFormError('비밀번호는 4~30자여야 합니다.');
      return;
    }
    if (!pwCheck.trim()) {
      setFormError('비밀번호 확인을 입력해주세요.');
      return;
    }
    if (pw !== pwCheck) {
      setFormError('비밀번호가 일치하지 않습니다.');
      return;
    }
    sessionStorage.setItem(
      'register_step1',
      JSON.stringify({ email, userId, pw, verificationToken: token }),
    );
    router.push('/auth/register/step2');
  };

  /* ---------------------------- UI ------------------------------ */
  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">가입 (1/2)</h1>
          <p className="text-gray-500 text-sm">TexTok에 오신 것을 환영합니다</p>
        </div>

        <form noValidate onSubmit={onNext} className="space-y-4">
          {/* ---------------- EMAIL ---------------- */}
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">이메일</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                placeholder="example@gmail.com"
                className={`flex-1 h-11 px-3 rounded-md bg-gray-100 focus:bg-white outline-none transition 
                  ${
                    emailError
                      ? 'border border-red-500'
                      : 'border border-transparent focus:border-blue-500'
                  }
                `}
              />

              <button
                type="button"
                onClick={onSendCode}
                className="h-11 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              >
                {sendSuccess ? '재전송' : '전송'}
              </button>
            </div>

            {/* 이메일 에러 */}
            {emailError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {emailError}
              </p>
            )}

            {/* 인증코드 전송 메시지 */}
            {sendSuccess && !isResent && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" /> 인증 코드가 전송되었습니다.
              </p>
            )}

            {sendSuccess && isResent && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" />
                인증 코드가 다시 전송되었습니다.
              </p>
            )}

            {sendError && <p className="text-red-500 text-[13px]">{sendError}</p>}
          </div>

          {/* ---------------- 인증 코드 ---------------- */}
          {isCodeSent && (
            <div className="space-y-1">
              <label className="font-medium text-sm text-gray-700">인증 코드</label>

              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setVerifyError('');
                  }}
                  placeholder="6자리"
                  className="flex-1 h-11 px-3 rounded-md bg-gray-100 focus:bg-white outline-none border border-transparent focus:border-blue-500"
                />

                <button
                  type="button"
                  onClick={onVerifyCode}
                  className="h-11 px-4 bg-gray-100 border border-blue-500 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition"
                >
                  인증
                </button>
              </div>

              {verifyMsg && (
                <p className="text-green-600 text-[13px] flex items-center gap-1">
                  <Check className="w-4 h-4" /> {verifyMsg}
                </p>
              )}

              {verifyError && <p className="text-red-500 text-[13px]">{verifyError}</p>}
            </div>
          )}

          {/* ---------------- ID ---------------- */}
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">TexTok ID</label>

            <div className="flex gap-2">
              <input
                type="text"
                value={userId}
                onChange={(e) => {
                  setUserId(e.target.value);
                  setIdAvailable(false);
                  setIdCheckMsg('');
                  validateUserId(e.target.value);
                }}
                placeholder="영문 소문자 + 숫자, 4~20자"
                className={`flex-1 h-11 px-3 rounded-md bg-gray-100 focus:bg-white outline-none transition 
        ${
          userIdError ? 'border border-red-500' : 'border border-transparent focus:border-blue-500'
        }`}
              />

              <button
                type="button"
                onClick={onCheckUserId}
                className="h-11 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              >
                중복확인
              </button>
            </div>

            {/* 메시지 영역 */}
            {idCheckLoading && <p className="text-gray-400 text-[13px]">· · · 확인 중...</p>}

            {idAvailable && (
              <p className="text-green-600 text-[13px] flex items-center gap-1">
                <Check className="w-4 h-4" /> {idCheckMsg}
              </p>
            )}

            {userIdError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {userIdError}
              </p>
            )}
          </div>

          {/* ---------------- PASSWORD ---------------- */}
          <div className="space-y-1">
            <label className="font-medium text-sm text-gray-700">비밀번호</label>

            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                validatePw(e.target.value);
              }}
              placeholder="4~30자"
              className={`h-11 px-3 w-full rounded-md bg-gray-100 focus:bg-white outline-none
                ${
                  pwError
                    ? 'border border-red-500'
                    : 'border border-transparent focus:border-blue-500'
                }
              `}
            />

            {pwError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {pwError}
              </p>
            )}
          </div>

          {/* ---------------- PW CHECK ---------------- */}
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
                ${
                  pwCheckError
                    ? 'border border-red-500'
                    : 'border border-transparent focus:border-blue-500'
                }
              `}
            />

            {pwCheckError && (
              <p className="text-red-500 text-[13px] flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {pwCheckError}
              </p>
            )}
          </div>

          {/* ---------------- FORM ERROR ---------------- */}
          {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

          {/* ---------------- NEXT BUTTON ---------------- */}
          <button
            type="submit"
            className="w-full h-11 bg-[#2979FF] text-white rounded-md font-semibold hover:bg-[#1f5edb] transition"
          >
            다음
          </button>
        </form>
      </div>
    </div>
  );
}
