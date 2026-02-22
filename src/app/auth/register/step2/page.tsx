'use client';

import { AlertCircle, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function RegisterStep2Page() {
  const router = useRouter();

  /* =========================================================
     상태: 일반가입 / 소셜가입 분기
     ========================================================= */
  const [mode, setMode] = useState<'normal' | 'social' | null>(null);

  // 일반 회원가입 Step1 데이터
  const [step1Data, setStep1Data] = useState<{
    email: string;
    userId: string;
    pw: string;
    verificationToken: string;
  } | null>(null);

  // 소셜 로그인 임시 토큰
  const [tempToken, setTempToken] = useState<string | null>(null);

  /* =========================================================
     상태: 입력값
     ========================================================= */
  const [nickname, setNickname] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER' | ''>('');

  /* =========================================================
     동의(필수 2개)
     ========================================================= */
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const agreeAll = useMemo(() => agreeTerms && agreePrivacy, [agreeTerms, agreePrivacy]);

  const toggleAgreeAll = () => {
    const next = !agreeAll;
    setAgreeTerms(next);
    setAgreePrivacy(next);
    setFormError('');
  };

  /* =========================================================
     닉네임 상태
     ========================================================= */
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameAvailable, setNicknameAvailable] = useState(false);
  const [nicknameChecking, setNicknameChecking] = useState(false);
  const [nicknameCheckMsg, setNicknameCheckMsg] = useState('');

  /* =========================================================
     생년월일/성별/폼 에러
     ========================================================= */
  const [dobError, setDobError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [formError, setFormError] = useState('');

  /* =========================================================
     로딩
     ========================================================= */
  const [loading, setLoading] = useState(false);

  /* =========================================================
     Step2 모드 자동 결정
     ========================================================= */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    // ✅ 소셜 토큰이 있으면 무조건 social 우선
    if (token) {
      setTempToken(token);
      setMode('social');
      // 선택: 소셜 가입 흐름에서 일반가입 찌꺼기 제거
      sessionStorage.removeItem('register_step1');
      return;
    }

    const saved = sessionStorage.getItem('register_step1');
    if (saved) {
      setStep1Data(JSON.parse(saved));
      setMode('normal');
      return;
    }

    router.replace('/auth/register');
  }, [router]);

  /* =========================================================
     닉네임 검증 + 중복 체크
     ========================================================= */
  const validateNickname = (v: string) => {
    if (!v.trim()) {
      setNicknameError('닉네임을 입력해주세요.');
      return false;
    }
    if (v.length < 4 || v.length > 30) {
      setNicknameError('닉네임은 4~30자여야 합니다.');
      return false;
    }
    setNicknameError('');
    return true;
  };

  useEffect(() => {
    if (!nickname.trim()) {
      setNicknameError('');
      setNicknameAvailable(false);
      setNicknameChecking(false);
      setNicknameCheckMsg('');
      return;
    }

    if (!validateNickname(nickname)) {
      setNicknameAvailable(false);
      setNicknameChecking(false);
      return;
    }

    setNicknameChecking(true);
    setNicknameAvailable(false);
    setNicknameCheckMsg('');

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/api/v1/users/check-nickname?nickname=${encodeURIComponent(nickname)}`,
        );
        const data = await res.json();

        if (data.resultCode === '200') {
          setNicknameAvailable(true);
          setNicknameCheckMsg('사용 가능한 닉네임입니다.');
        } else {
          setNicknameAvailable(false);
          setNicknameError(data.msg ?? '이미 사용 중인 닉네임입니다.');
        }
      } catch {
        setNicknameAvailable(false);
        setNicknameError('서버 오류가 발생했습니다.');
      } finally {
        setNicknameChecking(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [nickname]);

  /* =========================================================
     생년월일 검증
     ========================================================= */
  const validateDob = () => {
    if (!dobYear || !dobMonth || !dobDay) {
      setDobError('생년월일을 모두 선택해주세요.');
      return false;
    }

    const year = Number(dobYear);
    const month = Number(dobMonth);
    const day = Number(dobDay);

    const selected = new Date(year, month - 1, day);
    const today = new Date();

    if (
      selected.getFullYear() !== year ||
      selected.getMonth() !== month - 1 ||
      selected.getDate() !== day
    ) {
      setDobError('존재하지 않는 날짜입니다.');
      return false;
    }

    if (selected > today) {
      setDobError('생년월일에 미래 날짜는 입력할 수 없습니다.');
      return false;
    }

    const minDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    if (selected > minDate) {
      setDobError('만 13세 이상만 가입할 수 있습니다.');
      return false;
    }

    if (year < today.getFullYear() - 110) {
      setDobError('유효하지 않은 생년월일입니다.');
      return false;
    }

    setDobError('');
    return true;
  };

  /* =========================================================
     성별 검증
     ========================================================= */
  const validateGender = () => {
    if (!gender) {
      setGenderError('성별을 선택해주세요.');
      return false;
    }
    setGenderError('');
    return true;
  };

  /* =========================================================
     제출 (mode 에 따라 API 분기)
     ========================================================= */
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // ✅ 필수 동의 체크
    if (!agreeTerms || !agreePrivacy) {
      setFormError('필수 약관에 동의해주세요.');
      return;
    }

    if (!nicknameAvailable || nicknameError) {
      return setFormError('닉네임을 다시 확인해주세요.');
    }

    if (!validateDob() || !validateGender()) return;

    const dateOfBirth = `${dobYear}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;

    setLoading(true);

    try {
      let res: Response | undefined;

      if (mode === 'normal' && step1Data) {
        // -----------------------------
        // ⭐ 일반 회원가입 API
        // -----------------------------
        res = await fetch(`${API}/api/v1/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: step1Data.email,
            username: step1Data.userId,
            password: step1Data.pw,
            nickname,
            dateOfBirth,
            gender,
            verificationToken: step1Data.verificationToken,
          }),
        });
      }

      if (mode === 'social' && tempToken) {
        // -----------------------------
        // ⭐ 소셜 회원가입 API
        // -----------------------------
        res = await fetch(`${API}/api/v1/auth/complete-oauth2-join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nickname,
            dateOfBirth,
            gender,
            temporaryToken: tempToken,
          }),
        });
      }

      const data = await res!.json();

      if (!res!.ok) {
        setFormError(data.msg ?? '회원가입에 실패했습니다.');
        setLoading(false);
        return;
      }

      // 가입 성공
      sessionStorage.removeItem('register_step1');
      router.replace('/auth/success/register');
    } catch {
      setFormError('서버 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     UI
     ========================================================= */
  return (
    <div className="min-h-screen bg-white flex justify-center items-start pt-20 px-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6">
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">가입 (2/2)</h1>
          <p className="text-gray-500 text-sm">프로필 정보를 입력해주세요</p>
        </div>

        {/* FORM */}
        {mode && (
          <form className="space-y-5" onSubmit={onSubmit}>
            {/* ---------------- 닉네임 ---------------- */}
            <div className="space-y-1">
              <label className="font-medium text-sm text-gray-700">닉네임</label>

              <input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setFormError('');
                }}
                placeholder="4~30자"
                className={`h-11 px-3 w-full rounded-md bg-gray-100 focus:bg-white outline-none transition
                  ${
                    nicknameError
                      ? 'border border-red-500'
                      : 'border border-transparent focus:border-blue-500'
                  }`}
              />

              {nicknameChecking && !nicknameError && (
                <p className="text-gray-400 text-[13px]">확인 중...</p>
              )}

              {nicknameAvailable && nicknameCheckMsg && (
                <p className="text-green-600 text-[13px] flex items-center gap-1">
                  <Check className="w-4 h-4" /> {nicknameCheckMsg}
                </p>
              )}

              {nicknameError && (
                <p className="text-red-500 text-[13px] flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {nicknameError}
                </p>
              )}
            </div>

            {/* ---------------- 생년월일 ---------------- */}
            <div className="space-y-1">
              <label className="font-medium text-sm text-gray-700">생년월일</label>

              <div className="flex gap-2">
                {/* 연도 */}
                <select
                  value={dobYear}
                  onChange={(e) => {
                    setDobYear(e.target.value);
                    setDobError('');
                  }}
                  className="flex-1 h-11 px-2 rounded-md bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500"
                >
                  <option value="">연도</option>
                  {Array.from({ length: 60 }, (_, i) => 2025 - i).map((year) => (
                    <option key={year} value={year.toString()}>
                      {year}
                    </option>
                  ))}
                </select>

                <select
                  value={dobMonth}
                  onChange={(e) => {
                    setDobMonth(e.target.value);
                    setDobError('');
                  }}
                  className="w-24 h-11 px-2 rounded-md bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500"
                >
                  <option value="">월</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m.toString()}>
                      {m}
                    </option>
                  ))}
                </select>

                <select
                  value={dobDay}
                  onChange={(e) => {
                    setDobDay(e.target.value);
                    setDobError('');
                  }}
                  className="w-24 h-11 px-2 rounded-md bg-gray-100 focus:bg-white border border-transparent focus:border-blue-500"
                >
                  <option value="">일</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d.toString()}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {dobError && (
                <p className="text-red-500 text-[13px] flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {dobError}
                </p>
              )}
            </div>

            {/* ---------------- 성별 ---------------- */}
            <div className="space-y-1">
              <label className="font-medium text-sm text-gray-700">성별</label>

              <div className="flex gap-2">
                {[
                  { value: 'FEMALE', label: '여자' },
                  { value: 'MALE', label: '남자' },
                  { value: 'OTHER', label: '선택안함' },
                ].map((g) => (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => {
                      setGender(g.value as 'FEMALE' | 'MALE' | 'OTHER');
                      setGenderError('');
                    }}
                    className={`flex-1 h-10 rounded-md border text-sm transition
                      ${
                        gender === g.value
                          ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
                          : 'border-gray-300 text-gray-500 hover:bg-gray-100'
                      }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {genderError && (
                <p className="text-red-500 text-[13px] flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {genderError}
                </p>
              )}
            </div>

            {/* ---------------- 동의 ---------------- */}
            <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                  <input
                    type="checkbox"
                    checked={agreeAll}
                    onChange={toggleAgreeAll}
                    className="h-4 w-4 accent-[#2979FF]"
                  />
                  전체 동의하기
                </label>
              </div>

              <div className="h-px bg-gray-200" />

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        setFormError('');
                      }}
                      className="h-4 w-4 accent-[#2979FF]"
                    />
                    <span className="text-[13px] text-gray-500">[필수]</span>
                    TexTok 이용약관 동의
                  </label>

                  <button
                    type="button"
                    onClick={() => window.open('/terms', '_blank', 'noopener,noreferrer')}
                    className="text-[12px] font-medium text-blue-600 hover:underline"
                  >
                    자세히 보기
                  </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-800">
                    <input
                      type="checkbox"
                      checked={agreePrivacy}
                      onChange={(e) => {
                        setAgreePrivacy(e.target.checked);
                        setFormError('');
                      }}
                      className="h-4 w-4 accent-[#2979FF]"
                    />
                    <span className="text-[13px] text-gray-500">[필수]</span>
                    개인정보 처리방침 동의
                  </label>

                  <button
                    type="button"
                    onClick={() => window.open('/privacy', '_blank', 'noopener,noreferrer')}
                    className="text-[12px] font-medium text-blue-600 hover:underline"
                  >
                    자세히 보기
                  </button>
                </div>
              </div>
            </div>

            {/* ---------------- FORM ERROR ---------------- */}
            {formError && <p className="text-red-500 text-sm text-center">{formError}</p>}

            {/* ---------------- SUBMIT ---------------- */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-11 bg-[#2979FF] text-white rounded-md font-semibold transition
                ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#1f5edb]'}`}
            >
              {loading ? '가입 중...' : '가입 완료'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
