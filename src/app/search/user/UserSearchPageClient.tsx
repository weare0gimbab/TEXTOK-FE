'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type UserSearchResult = {
  id: number;
  nickname: string;
  profileImgUrl: string | null;
  bio: string;
  followersCount: number;
};

export default function SearchUserPage() {
  const params = useSearchParams();
  const keyword = params.get('keyword') || '';
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!keyword.trim()) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/v1/users/search?keyword=${encodeURIComponent(keyword)}`,
          {
            method: 'GET',
            credentials: 'include',
          },
        );

        if (!res.ok) throw new Error('검색 실패');

        const json = await res.json();
        setUsers(json.data || []);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }

    load();
  }, [keyword]);

  return (
    <div className="mt-4">
      {loading ? (
        <div className="flex justify-center py-16 text-sm text-slate-500">
          <LoadingSpinner label="사용자를 검색하는 중입니다" />
        </div>
      ) : users.length === 0 ? (
        <UserSearchEmptyState keyword={keyword} />
      ) : (
        <div className="space-y-1">
          {users.map((user) => (
            <a
              key={user.id}
              href={`/profile/${user.id}`}
              className="flex items-center gap-4 p-4 rounded-md bg-white hover:bg-slate-50 transition"
            >
              {/* 프로필 이미지 */}
              <Image
                src={user.profileImgUrl || '/tmpProfile.png'}
                alt="profile"
                width={56}
                height={56}
                className="w-14 h-14 rounded-full object-cover bg-slate-200"
                unoptimized
              />

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{user.nickname}</span>
                  {user.followersCount > 0 && (
                    <span className="text-xs text-slate-500">팔로워 {user.followersCount}</span>
                  )}
                </div>

                <p className="text-sm text-slate-600 line-clamp-2">{user.bio}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function UserSearchEmptyState({ keyword }: { keyword: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
          <svg
            className="h-6 w-6 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <p className="mt-4 text-lg font-medium text-slate-900">
          {'"'}{keyword}{'"'}에 대한 검색 결과가 없습니다
        </p>
        <p className="mt-2 text-sm text-slate-500">다른 검색어로 시도해보세요</p>
        <div className="mt-4 text-xs text-slate-400">
          <p>• 단어의 철자가 정확한지 확인해보세요</p>
          <p>• 다른 검색어를 사용해보세요</p>
          <p>• 더 일반적인 검색어를 사용해보세요</p>
        </div>
      </div>
    </div>
  );
}
