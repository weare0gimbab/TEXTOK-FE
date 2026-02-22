'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function FindPasswordPage() {
  const router = useRouter();

  // 입력값
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');

  // 조회된 이메일
  const [email, setEmail] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');

  // 상태
  const [usernameError, setUsernameError] = useState('');
  const [, setIsUserValid] = useState(false);

  const [sendMsg, setSendMsg] = useState('');
  const [, setSendError] = useState('');

  const [verifyMsg, setVerifyMsg] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [codeSent, setCodeSent] = useState(false);

  // ---------------- 이메일 마스킹 -----------------
  const maskEmail = (email: string) => {
    const [id, domain] = email.split('@');
    if (id.length <= 3) return `${id[0]}***@${domain}`;
    return `${id.slice(0, 3)}***${id.slice(-1)}@${domain}`;
  };

  // ===================================================
  // 1) 아이디 확인 → 존재하면 즉시 이메일 조회 + 인증코드 자동 발송
  // ===================================================
  const onCheckUsername = async () => {
    setUsernameError('');
    setSendMsg('');
    setSendError('');
    setVerifyMsg('');
    setVerifyError('');
    setCodeSent(false);
    setIsUserValid(false);

    if (!username.trim()) {
      setUsernameError('아이디를 입력해주세요.');
      return;
    }

    try {
      // 1) 아이디 존재 여부 체크
      const res1 = await fetch(`${API}/api/v1/auth/check-username?username=${username}`);
      const data1 = await res1.json();

      if (data1.data?.isAvailable === true) {
        setUsernameError('존재하지 않는 아이디입니다.');
        return;
      }

      setCodeSent(true);

      // 2) 이메일 조회 (비동기 진행)
      const res2 = await fetch(`${API}/api/v1/auth/get-email?username=${username}`);
      const data2 = await res2.json();

      if (!res2.ok || !data2.data?.email) {
        setSendError('등록된 이메일을 불러올 수 없습니다.');
        return;
      }

      const realEmail = data2.data.email;
      const masked = maskEmail(realEmail);

      setEmail(realEmail);
      setMaskedEmail(masked);
      setIsUserValid(true);

      setSendMsg(`가입된 이메일로 인증 코드가 발송되었습니다.`);

      // 3) 인증코드를 자동 발송
      const sendRes = await fetch(`${API}/api/v1/auth/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: realEmail,
      });

      const sendJson = await sendRes.json();
      if (!sendRes.ok) {
        setSendError(sendJson.msg ?? '인증코드 전송 실패');
        return;
      }
    } catch {
      setUsernameError('서버 오류가 발생했습니다.');
    }
  };

  // ===================================================
  // 2) 인증 코드 검증
  // ===================================================
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
      const ok = data.resultCode?.startsWith('2');

      if (!res.ok || !ok) {
        setVerifyError(data.msg ?? '인증 실패');
        return;
      }

      // resetPasswordToken 또는 emailVerificationToken
      const token = data.data?.resetPasswordToken ?? data.data?.emailVerificationToken ?? null;

      if (token) {
        sessionStorage.setItem('resetPasswordToken', token);
      }

      sessionStorage.setItem('fp_username', username);
      sessionStorage.setItem('fp_email', email);

      setVerifyMsg('인증이 완료되었습니다.');

      // 다음 페이지로 이동
      setTimeout(() => {
        router.push('/auth/find-password/reset');
      }, 1000);
    } catch {
      setVerifyError('서버 오류가 발생했습니다.');
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
          <p className="text-gray-500 text-sm">아이디를 입력해주세요</p>
        </div>

        {/* STEP 1: 아이디 입력 */}
        <div className="space-y-1">
          <label className="font-medium text-sm text-gray-700">TexTok ID</label>

          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setUsernameError('');
              }}
              placeholder="아이디 입력"
              className={`flex-1 h-11 px-3 rounded-md bg-gray-100 
                ${usernameError ? 'border border-red-500' : 'border border-transparent focus:border-blue-500'}
              `}
            />

            <button
              type="button"
              onClick={onCheckUsername}
              className="h-11 px-4 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
            >
              확인
            </button>
          </div>

          {usernameError && (
            <p className="text-red-500 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> {usernameError}
            </p>
          )}
        </div>

        {/* 아이디 에러 */}
        {usernameError && (
          <p className="text-red-500 text-sm flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> {usernameError}
          </p>
        )}

        {/* 안내 메시지를 "여기"에 표시 */}
        {sendMsg && (
          <div className="text-green-600 text-sm mt-1 space-y-0.5">
            {/* 첫 줄: 메시지 */}
            <p className="flex items-center gap-1">
              <Check className="w-4 h-4" /> {sendMsg}
            </p>
            {maskedEmail && <p className="ml-6">{maskedEmail}</p>}
          </div>
        )}

        {/* STEP 3: 인증 코드 입력 */}
        {codeSent && (
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
                placeholder="6자리 입력"
                className="flex-1 h-11 px-3 rounded-md bg-gray-100 focus:bg-white 
                  border border-transparent focus:border-blue-500 outline-none"
              />

              <button
                type="button"
                onClick={onVerifyCode}
                className="h-11 px-4 bg-gray-100 border border-blue-500 rounded-md font-semibold hover:bg-gray-300 transition"
              >
                인증
              </button>
            </div>

            {verifyMsg && (
              <p className="text-green-600 text-sm flex items-center gap-1">
                <Check className="w-4 h-4" /> {verifyMsg}
              </p>
            )}

            {verifyError && (
              <p className="text-red-500 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {verifyError}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
