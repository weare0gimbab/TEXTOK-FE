import Link from 'next/link';

export default function FindIdPage() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-20 px-4 text-center">
      <h1 className="text-2xl font-bold mb-4">아이디 찾기</h1>

      <p className="text-gray-600 mb-6">
        아이디 찾기 기능은 현재 개발 중입니다.
        <br />곧 사용할 수 있게 준비하겠습니다 😊
      </p>

      <Link
        href="/"
        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        메인으로 돌아가기
      </Link>
    </div>
  );
}
