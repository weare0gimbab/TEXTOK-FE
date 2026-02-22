'use client';

import SearchTabs from '@/src/app/components/search/SearchTabs';
import SortFilter from '@/src/app/components/search/SortFilter';
import { useSearchParams } from 'next/navigation';

export default function SearchPage() {
  const searchParams = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const tab = searchParams.get('tab') || 'shortlog';
  const sort = searchParams.get('sort') || 'latest';

  // 검색어 없으면 빈 페이지 처리
  if (!keyword) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-gray-500 text-lg">검색어가 없습니다.</p>
      </div>
    );
  }

  return (
    <main className="ml-20 px-8 py-6">
      {' '}
      {/* 사이드바가 fixed라서 margin-left 적용 */}
      {/* 검색 키워드 */}
      <h1 className="text-xl font-semibold mb-6">
        검색 결과: <span className="font-bold text-blue-600">{keyword}</span>
      </h1>
      {/* Tabs */}
      <SearchTabs keyword={keyword} activeTab={tab} />
      {/* Sort Filter */}
      {tab !== 'user' && <SortFilter keyword={keyword} currentTab={tab} currentSort={sort} />}
      {/* Content */}
      <div className="mt-6">
        {tab === 'shortlog' && <div className="text-gray-500">📌 숏로그 결과 표시 예정</div>}
        {tab === 'blog' && <div className="text-gray-500">📌 블로그 결과 표시 예정</div>}
        {tab === 'user' && <div className="text-gray-500">📌 사용자 검색 결과 표시 예정</div>}
      </div>
    </main>
  );
}
