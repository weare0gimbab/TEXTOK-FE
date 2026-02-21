'use client';
import { fetchBlogDetail } from '@/src/api/blogDetail';
import { uploadBlogImage } from '@/src/api/blogImageApi';
import { createDraft, deleteBlog, fetchDrafts, updateBlog } from '@/src/api/blogWrite';
import apiClient from '@/src/api/clientForRs';
import { handleApiError } from '@/src/lib/handleApiError';
import { showGlobalToast } from '@/src/lib/toastStore';
import { useLoginModal } from '@/src/providers/LoginModalProvider';
import type {
  BlogDraftDto,
  BlogFileDto,
  BlogFormValues,
  BlogMediaUploadResponse,
  BlogStatus,
  BlogVisibility,
  BlogWriteReqBody,
  RsData,
} from '@/src/types/blog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AiChatPanel from '../../components/ai/chat/AiChatPanel';
import BlogConnectShorlogModal from '../../components/blogs/link/BlogConnectShorlogModal';
import { BlogMetaForm } from '../../components/blogs/write/BlogMetaForm';
import { BlogWriteHeader } from '../../components/blogs/write/BlogWriteHeader';
import { DraftListModal } from '../../components/blogs/write/DraftListModal';
import { MarkdownEditor } from '../../components/blogs/write/MarkdownEditor';
import { LoginRequiredModal } from '../../components/common/LoginRequireModal';
import ImageSelector from '../../components/ImageSelector/ImageSelector';

type NewBlogPageProps = {
  editId?: number;
};

export default function NewBlogPage({ editId }: NewBlogPageProps) {
  const router = useRouter();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [publishedBlogId, setPublishedBlogId] = useState<number | null>(null);

  const [form, setForm] = useState<BlogFormValues>({
    title: '',
    contentMarkdown: '',
    tags: [],
    status: 'DRAFT',
    visibility: 'PRIVATE',
  });

  const { open: openLoginModal } = useLoginModal();

  const [blogId, setBlogId] = useState<number | null>(editId ?? null);
  // 이미지/썸네일 상태
  const [blogImages, setBlogImages] = useState<BlogFileDto[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  // 발행 버튼 상태
  const [isPublishing, setIsPublishing] = useState(false);
  // 임시저장 목록 모달 상태
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [drafts, setDrafts] = useState<BlogDraftDto[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  // ---------------- 인증 상태 ----------------
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 로그인 유저 조회 엔드포인트 사용
        const me = await apiClient<unknown>('/api/v1/users/me', {
          method: 'GET',
        });

        if (me) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
          setShowLoginModal(true);
        }
      } catch {
        // 401 포함: 비로그인으로 간주
        setIsLoggedIn(false);
        setShowLoginModal(true);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);
  /* 폼 업데이트 헬퍼 */
  const update = <K extends keyof BlogFormValues>(key: K, value: BlogFormValues[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const buildReqBody = (status: BlogStatus): BlogWriteReqBody => ({
    title: form.title.trim(),
    content: form.contentMarkdown.trim(),
    status,
    hashtagNames: form.tags,
  });

  useEffect(() => {
    if (!editId) return;

    const load = async () => {
      try {
        const detail = await fetchBlogDetail(editId);

        setBlogId(detail.id);
        setForm((prev) => ({
          ...prev,
          title: detail.title ?? '',
          contentMarkdown: detail.content ?? '',
          tags: detail.hashtagNames ?? [],
          status: (detail.status as BlogStatus) ?? 'DRAFT',
        }));
        setBlogImages(detail.images ?? []);
        setThumbnailUrl(detail.thumbnailUrl ?? null);
      } catch {
        showGlobalToast('글 정보를 불러오지 못했습니다.', 'error');

        router.push('/blogs');
      }
    };

    load();
  }, [editId, router]);

  const ensureDraft = async (): Promise<number> => {
    if (blogId) return blogId;

    // 없으면 새로 생성
    const dto = await createDraft(buildReqBody('DRAFT'));
    if (!dto || dto.id == null) {
      throw new Error('임시저장 생성에 실패했습니다.');
    }
    setBlogId(dto.id);
    return dto.id;
  };

  const handleSaveDraft = async () => {
    //  if (!form.title.trim() || !form.contentMarkdown.trim()) {
    //    showGlobalToast('제목과 내용은 필수입니다.', 'error');
    //  }

    try {
      const id = await ensureDraft(); // 없으면 새 draft 생성, 있으면 그거 사용
      const dto = await updateBlog(id, buildReqBody('DRAFT'));

      setForm((prev) => ({
        ...prev,
        status: 'DRAFT',
        title: dto.title ?? prev.title,
        contentMarkdown: dto.content ?? prev.contentMarkdown,
        tags: dto.hashtagNames ?? prev.tags,
      }));

      showGlobalToast('임시저장 되었어요.', 'success');
    } catch (e) {
      handleApiError(e);
    }
  };

  const handlePublish = async () => {
    //  if (!form.title.trim() || !form.contentMarkdown.trim()) {
    //    showGlobalToast('제목과 내용은 필수입니다.', 'error');
    //  }

    setIsPublishing(true);
    try {
      const id = await ensureDraft();
      const dto = await updateBlog(id, buildReqBody('PUBLISHED'));

      setPublishedBlogId(dto.id);
      setShowConnectModal(true);
      //router.push(`/blogs/${dto.id}`);
    } catch (e) {
      handleApiError(e);
    } finally {
      setIsPublishing(false);
    }
  };
  // 임시저장 목록 관련 로직
  const openDraftModal = async () => {
    setIsDraftModalOpen(true);
    setIsLoadingDrafts(true);
    try {
      const list = await fetchDrafts();
      setDrafts(list);
    } catch {
      // console.error(e);
      showGlobalToast('임시저장 목록을 불러오지 못했습니다.', 'error');
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const handleSelectDraft = async (draft: BlogDraftDto) => {
    try {
      const detail = await fetchBlogDetail(draft.id);

      setBlogId(detail.id);
      setForm((prev) => ({
        ...prev,
        title: detail.title ?? '',
        contentMarkdown: detail.content ?? '',
        tags: detail.hashtagNames ?? [],
        status: (detail.status as BlogStatus) ?? 'DRAFT',
      }));
      setBlogImages(detail.images ?? []);
      setThumbnailUrl(detail.thumbnailUrl ?? null);

      setIsDraftModalOpen(false);
    } catch {
      // console.error(e);
      showGlobalToast('임시저장 글을 불러오지 못했습니다.', 'error');
    }
  };

  const handleDeleteDraft = async (draftId: number) => {
    if (!confirm('이 임시저장을 삭제할까요?')) return;
    try {
      await deleteBlog(draftId);
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      if (blogId === draftId) {
        setBlogId(null);
        setForm({
          title: '',
          contentMarkdown: '',
          tags: [],
          status: 'DRAFT',
          visibility: 'PRIVATE',
        });
      }
      showGlobalToast('임시저장을 삭제했어요.', 'success');
    } catch {
      // console.error(e);
      showGlobalToast('삭제 중 오류가 발생했습니다.', 'error');
    }
  };
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">로그인 상태를 확인 중입니다…</p>
      </div>
    );
  }

  // 이미지 업로드 함수
  const handleUploadContentImage = async (file: File): Promise<string> => {
    if (!form.title.trim() || !form.contentMarkdown.trim()) {
      showGlobalToast('제목과 내용은 필수입니다.', 'error');
    }

    try {
      const id = await ensureDraft();
      const formData = new FormData();
      formData.append('files', file);
      formData.append('type', 'CONTENT');

      const res = await uploadBlogImage(id, formData);

      if (!res.ok) {
        showGlobalToast('이미지 업로드에 실패했습니다.', 'error');
        throw new Error(`이미지 업로드 실패 (status: ${res.status})`);
      }

      const rs: RsData<BlogMediaUploadResponse> = await res.json();
      if (!rs.data) {
        showGlobalToast('이미지 업로드 응답이 올바르지 않습니다.', 'error');
        throw new Error('이미지 업로드 응답이 올바르지 않습니다.');
      }
      return rs.data.url;
    } catch (e) {
      console.error(e);
      handleApiError(e);
      throw e;
    }
  };
  // 연결관련 함수
  const handleCloseConnectModal = () => {
    setShowConnectModal(false);
    if (publishedBlogId != null) {
      router.push(`/blogs/${publishedBlogId}`);
    }
  };

  return (
    <AiChatPanel title={form.title} content={form.contentMarkdown}>
      <BlogWriteHeader
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        onOpenDrafts={openDraftModal}
      />

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 py-4">
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <BlogMetaForm
            title={form.title}
            content={form.contentMarkdown}
            onTitleChange={(v) => update('title', v)}
            tags={form.tags}
            onTagsChange={(tags) => update('tags', tags)}
            visibility={form.visibility}
            onVisibilityChange={(v: BlogVisibility) => update('visibility', v)}
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <MarkdownEditor
            value={form.contentMarkdown}
            onChange={(v) => update('contentMarkdown', v)}
            placeholder="마크다운으로 블로그 내용을 작성해 주세요."
            onUploadImage={handleUploadContentImage}
          />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <ImageSelector
            blogId={blogId}
            blogImages={blogImages}
            thumbnailUrl={thumbnailUrl}
            blogContent={form.contentMarkdown}
            onChangeImages={setBlogImages}
            onChangeThumbnail={setThumbnailUrl}
            ensureDraft={ensureDraft}
          />
        </section>
      </main>
      <DraftListModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        drafts={drafts}
        isLoading={isLoadingDrafts}
        onSelectDraft={handleSelectDraft}
        onDeleteDraft={handleDeleteDraft}
      />
      <LoginRequiredModal
        open={showLoginModal && !isLoggedIn}
        onClose={() => router.push(`/blogs`)}
        onConfirmLogin={() => {
          openLoginModal();
        }}
      />
      {publishedBlogId != null && (
        <BlogConnectShorlogModal
          isOpen={showConnectModal}
          blogId={publishedBlogId}
          onClose={handleCloseConnectModal}
          onSkip={handleCloseConnectModal}
          onLinked={() => {
            handleCloseConnectModal();
          }}
          onCreateNewShorlog={() => router.push(`/shorlog/create?blogId=${publishedBlogId}`)}
        />
      )}
    </AiChatPanel>
  );
}
