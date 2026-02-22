export const metadata = {
  title: 'TexTok 이용약관',
};

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-700">{children}</div>
        </div>
      </div>
    </section>
  );
}

function BulletList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-2">
      {items.map((it, idx) => (
        <li key={idx} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-slate-300" />
          <span className="min-w-0">{it}</span>
        </li>
      ))}
    </ul>
  );
}

function Callout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-slate-700">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">TexTok 이용약관</h1>
          <p className="mb-4 mt-2 text-sm text-slate-500">
            시행일: <span className="font-medium text-slate-700">2025.12.09</span>
          </p>

          <Callout title="현재 TexTok은 베타(미리보기) 단계예요">
            TexTok은 아직 정식 런칭 전이며, 기능/화면/정책이 자주 바뀔 수 있어요. <br />
            그래도 안전하고 즐거운 이용을 위해, 기본적인 이용 규칙을 정리해 두었습니다.
          </Callout>
        </header>

        <div className="mt-8 space-y-4">
          <Section id="purpose" title="1. 목적">
            <p>
              이 약관은 TexTok을 이용할 때 필요한 기본 규칙(회원가입, 콘텐츠, 운영 기준 등)을
              안내하기 위한 문서입니다. 아직 베타 단계라, 더 나은 방향으로 계속 다듬어갈 예정이에요.
            </p>
          </Section>

          <Section id="definitions" title="2. 용어 정리">
            <BulletList
              items={[
                <>
                  <strong>회원</strong>: TexTok 계정을 만들고 서비스를 이용하는 사람
                </>,
                <>
                  <strong>계정</strong>: 이메일 인증 또는 소셜 로그인으로 만들어지는 로그인/식별
                  수단
                </>,
                <>
                  <strong>콘텐츠</strong>: 블로그 글, 숏로그(이미지/텍스트), 댓글, 해시태그 등
                  서비스에 올린 모든 게시물
                </>,
                <>
                  <strong>게시</strong>: 콘텐츠를 업로드해 다른 사람이 볼 수 있게 공개하는 행위
                </>,
              ]}
            />
          </Section>

          <Section id="changes" title="3. 약관의 적용과 변경">
            <BulletList
              items={[
                <>TexTok은 약관을 서비스 화면에서 확인할 수 있도록 제공합니다.</>,
                <>
                  베타 기간에는 기능과 정책이 자주 바뀔 수 있어, 필요하면 약관도 함께 업데이트될 수
                  있습니다.
                </>,
                <>중요한 변경이 있을 때는 서비스 내 공지 등으로 안내드릴게요.</>,
                <>업데이트된 약관에 동의하지 않는 경우, 이용을 중단하고 탈퇴할 수 있습니다.</>,
              ]}
            />
          </Section>

          <Section id="account" title="4. 회원가입과 계정 관리">
            <BulletList
              items={[
                <>
                  회원가입은 약관 및 개인정보 관련 동의 후, TexTok이 정한 절차(이메일 인증 또는 소셜
                  로그인 등)를 완료하면 완료됩니다.
                </>,
                <>
                  닉네임/생년월일 등 가입 정보가 바뀌면, 서비스 내에서 최신 정보로 유지해 주세요.
                </>,
                <>계정은 본인이 안전하게 관리해야 하며, 타인에게 양도/대여할 수 없습니다.</>,
                <>
                  도용, 자동화된 과도한 요청(봇/스크립트), 스팸성 가입 등은 계정 이용 제한의 사유가
                  될 수 있습니다.
                </>,
              ]}
            />
          </Section>

          <Section id="service" title="5. 서비스 제공과 변경/중단">
            <BulletList
              items={[
                <>
                  TexTok은 블로그/숏로그 작성·열람, 댓글/좋아요/북마크, 프로필 설정, AI 기반 글 작성
                  도우미(이하 “AI 도우미”) 등의 기능을 제공합니다.
                </>,
                <>
                  베타 단계에서는 기능이 추가/변경/삭제될 수 있습니다. (예: UI/정렬/페이지 구조
                  변경)
                </>,
                <>점검이나 장애 등 불가피한 상황에서는 서비스가 일시 중단될 수 있습니다.</>,
              ]}
            />
          </Section>

          <Section id="content" title="6. 콘텐츠의 권리와 이용 허락">
            <Callout title="핵심 요약">
              글/사진 등 콘텐츠의 권리는 기본적으로 <strong>작성자(회원)</strong>에게 있어요. <br />
              다만 서비스 화면에 보여주기 위해 필요한 범위에서 TexTok이 콘텐츠를 다룰 수 있어요.
            </Callout>

            <BulletList
              items={[
                <>
                  콘텐츠(글/이미지 등)의 저작권은 원칙적으로 해당 콘텐츠를 만든 회원에게 있습니다.
                </>,
                <>
                  회원은 콘텐츠를 게시함으로써, TexTok이 서비스 운영에 필요한 범위에서 콘텐츠를
                  <strong> 저장·복제·전송·노출</strong>하고, 썸네일 생성 등 표현/형식 변경을 할 수
                  있도록
                  <strong> 비독점적·무상 이용권</strong>을 허락합니다.
                </>,
                <>
                  회원이 콘텐츠를 삭제하거나 탈퇴하면, 법령상 보관 의무가 있는 경우를 제외하고 위
                  이용은 종료됩니다.
                </>,
                <>
                  타인의 저작권/초상권/개인정보/명예를 침해하는 콘텐츠는 올리면 안 됩니다. 문제가
                  발생하면 게시한 회원에게 책임이 있습니다.
                </>,
                <>
                  회원이 AI 도우미에 입력한 텍스트 및 AI가 생성한 텍스트 결과물은 서비스 제공을 위해
                  처리될 수 있습니다.
                </>,
                <>
                  회원이 AI 도우미 생성 결과물을 편집·선택하여 게시하는 경우, 해당 게시 콘텐츠의
                  권리는 회원에게 귀속됩니다.
                </>,
              ]}
            />
          </Section>

          <Section id="prohibited" title="7. 이런 행동은 하지 말아주세요">
            <p className="text-sm text-slate-600">
              TexTok은 작은 서비스지만, 안전하게 운영되려면 기본적인 선을 지켜야 해요.
            </p>
            <BulletList
              items={[
                <>타인 사칭, 계정 도용, 인증/가입 절차를 악용하는 행위</>,
                <>봇/스크립트로 과도한 요청을 보내 서비스에 부담을 주는 행위</>,
                <>
                  불법 정보, 음란물, 혐오/차별/폭력 조장, 명예훼손, 스팸/광고성 콘텐츠 게시
                  <br />
                  (AI 도우미로 생성한 콘텐츠도 동일하게 금지됩니다)
                </>,
                <>악성코드 유포, 해킹, 취약점 악용, 무단 접근 시도</>,
                <>TexTok 또는 제3자의 권리를 침해하는 행위</>,
              ]}
            />
          </Section>

          <Section id="moderation" title="8. 운영 정책(콘텐츠 조치 및 이용 제한)">
            <p>
              TexTok은 콘텐츠가 법령 또는 이 약관을 위반하거나 타인의 권리를 침해한다고 판단되는
              경우, 해당 콘텐츠를 숨김/삭제하거나 계정 이용을 제한할 수 있습니다.
            </p>
            <p>
              AI 도우미를 통해 생성된 콘텐츠라도 본 약관 및 운영 정책 위반 시 동일한 기준으로 조치될
              수 있습니다.
            </p>
            <Callout title="문의 안내">
              신고/차단 기능은 아직 없지만, 권리침해 또는 운영 관련 문의는 TexTok의 문의 채널로
              연락해 주세요.
            </Callout>
          </Section>

          <Section id="withdraw" title="9. 탈퇴(계정 삭제)와 작성 콘텐츠 처리">
            <Callout title="베타 운영 원칙">
              탈퇴하더라도 회원이 작성한 블로그/숏로그는 서비스 운영 및 이용자 보호를 위해 남을 수
              있어요. <br />
              이때 작성자 표기는 <strong>“탈퇴한 사용자”</strong>로 바뀌어 개인정보가 드러나지
              않도록 처리합니다.
            </Callout>

            <BulletList
              items={[
                <>회원은 언제든지 서비스 내 절차를 통해 탈퇴를 요청할 수 있습니다.</>,
                <>탈퇴 시 개인정보는 개인정보 처리방침 및 관련 법령에 따라 처리합니다.</>,
                <>
                  콘텐츠에 개인정보가 포함되어 삭제가 필요한 경우, 문의 채널로 요청하시면 합리적인
                  범위에서 검토/조치할 수 있습니다.
                </>,
              ]}
            />
          </Section>

          <Section id="liability" title="10. 책임에 대한 안내(베타 서비스 특성)">
            <BulletList
              items={[
                <>
                  TexTok은 베타 단계이므로, 기능 오류/일시 중단/데이터 표시 문제 등이 발생할 수
                  있습니다.
                </>,
                <>TexTok은 회원이 올린 콘텐츠의 정확성/적법성/신뢰성을 보증하지 않습니다.</>,
                <>
                  AI 도우미의 생성 결과는 오류·누락·편향이 있을 수 있으며, TexTok은 생성 결과의
                  정확성·적법성·신뢰성을 보증하지 않습니다.
                </>,
                <>
                  회원은 AI 도우미 생성 결과물을 게시하거나 활용하기 전에 스스로 사실 여부 및 권리
                  침해 가능성을 확인해야 합니다.
                </>,
                <>
                  천재지변, 불가항력, 회원의 귀책 사유로 발생한 문제에 대해서는 관련 법령이 허용하는
                  범위 내에서 책임이 제한될 수 있습니다.
                </>,
              ]}
            />
          </Section>

          <Section id="law" title="11. 분쟁 해결 및 적용 법령">
            <p>
              TexTok과 회원 간 분쟁은 우선 대화와 협의를 통해 해결하는 것을 목표로 합니다. 이 약관은
              대한민국 법령을 따르며, 필요한 경우 관련 법령과 민사소송법에 따라 처리됩니다.
            </p>
          </Section>

          <Section id="contact" title="12. 문의">
            <BulletList
              items={[
                <>
                  문의 이메일: <strong>(운영 이메일)</strong>
                </>,
              ]}
            />
          </Section>

          <footer className="pt-2 text-center text-xs text-slate-400">© TexTok</footer>
        </div>
      </div>
    </main>
  );
}
