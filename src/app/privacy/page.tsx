export const metadata = {
  title: '개인정보 처리방침',
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
    <section id={id} className="scroll-mt-24 rounded-2xl p-4">
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

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50/50 to-white text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight">개인정보 처리방침</h1>
          <p className="mb-4 mt-2 text-sm text-slate-500">
            시행일: <span className="font-medium text-slate-700">2025.12.09</span>
          </p>

          <Callout title="현재 TexTok은 베타(미리보기) 단계예요">
            TexTok은 아직 정식 런칭 전이라, 기능이 조금씩 바뀔 수 있어요. <br />
            다만 개인정보는 언제나 중요하니까, <strong>무엇을/왜/얼마나</strong> 수집하는지 투명하게
            안내드릴게요.
          </Callout>
        </header>

        <div className="mt-8 space-y-4">
          <Section id="intro" title="0. 안내">
            <p>
              TexTok(이하 “서비스”)는 회원가입 및 서비스 제공을 위해 필요한 범위에서 개인정보를
              처리합니다. 아래 내용은 개인정보보호법 등 관련 법령을 기준으로 작성되었고, 베타 기간
              동안 일부 항목/보관 기간이 변경될 수 있어요. 중요한 변경이 있을 때는 서비스 내 공지로
              알려드릴게요.
            </p>
            <p>
              또한 서비스는 숏로그/블로그 작성 편의를 위한 AI 기반 글 작성 도우미 기능(이하 “AI
              도우미”)을 제공할 수 있습니다. AI 도우미 이용 과정에서 회원이 입력한 텍스트가 답변
              생성을 위해 처리될 수 있으며, OpenAI의 API를 통해 처리됩니다.
            </p>
          </Section>

          <Section id="collect" title="1. 무엇을 수집하나요">
            <Callout title="회원가입 시">
              <BulletList
                items={[
                  <>
                    <strong>(1) 일반 회원가입(필수)</strong>: 이메일, 아이디, 비밀번호, 닉네임,
                    생년월일, 성별
                  </>,
                  <>
                    <strong>(2) 소셜 회원가입(카카오/구글/네이버)</strong>
                    <br />
                    <strong>필수항목</strong>: 닉네임, 생년월일, 성별
                    <br />
                    <span className="text-slate-500">
                      <strong>수집 제외</strong>: 이메일, 아이디, 비밀번호
                    </span>
                  </>,
                ]}
              />
            </Callout>

            <Callout title="이메일 인증 & 보안(부정 이용 방지)">
              <BulletList
                items={[
                  <>
                    <strong>이메일 인증코드</strong>: 인증을 위한 임시 코드(5분 보관 후 자동 삭제)
                  </>,
                  <>
                    <strong>이메일, IP 주소</strong>: 인증 요청 횟수 제한(레이트리밋) 및 보안 목적의
                    임시 저장(최대 1일)
                  </>,
                ]}
              />
            </Callout>

            <Callout title="서비스 이용 과정에서 자동으로 수집될 수 있어요">
              <BulletList
                items={[
                  <>IP 주소, 접속 로그(접속 일시/요청 기록 등)</>,
                  <>기기/브라우저 정보(가능한 범위)</>,
                  <>서비스 이용 기록(게시물 작성/수정/삭제, 좋아요/댓글/북마크 등)</>,
                  <>최근 본 게시물 기록(숏로그/블로그 열람 이력)</>,
                  <>AI 도우미 이용 시 입력한 텍스트(질문/추가 조건/글 본문 등)</>,
                ]}
              />
            </Callout>

            <Callout title="프로필 설정(선택)">
              <BulletList items={[<>프로필 사진, 소개글</>]} />
            </Callout>

            <p className="text-sm text-slate-600">
              * 닉네임은 단독으로는 ‘개인정보’가 아닐 수 있지만, 계정과 결합되면 개인을 식별할 수
              있어 서비스 운영을 위해 함께 관리됩니다.
            </p>
          </Section>

          <Section id="purpose" title="2. 어디에 사용하나요">
            <p className="text-sm text-slate-600">
              수집한 정보는 아래 목적 안에서만 사용해요. (딴 데 안 씁니다!)
            </p>
            <BulletList
              items={[
                <>회원가입 의사 확인, 이메일 인증, 이용자 식별 및 계정 생성/관리</>,
                <>로그인 및 서비스 제공(블로그/숏로그, 프로필, 좋아요/댓글/북마크 등)</>,
                <>서비스 편의 기능 제공(개인화된 화면 구성)</>,
                <>AI 도우미 기능 제공(문장 생성/요약/추천 등)</>,
                <>
                  부정 이용 방지 및 보안(스팸/봇/과도한 요청 차단), 서비스 안정성 확보, 오류/장애
                  대응
                </>,
                <>고객 문의 대응 및 공지 전달(필요한 경우)</>,
              ]}
            />
          </Section>

          <Section id="retention" title="3. 얼마나 보관하나요">
            <Callout title="보관 기간 요약">
              <BulletList
                items={[
                  <>
                    <strong>회원가입 정보</strong>: 회원 탈퇴 시까지
                    <br />
                    <span className="text-slate-500">
                      비밀번호는 암호화(해시) 처리하여 저장되며, 원문 비밀번호는 저장하지 않습니다.
                    </span>
                  </>,
                  <>
                    <strong>프로필 정보(선택)</strong>: 회원 탈퇴 또는 이용자 삭제 시까지(수정/삭제
                    시 즉시 반영)
                  </>,
                  <>
                    <strong>이메일 인증코드</strong>: 5분 후 자동 삭제
                  </>,
                  <>
                    <strong>레이트리밋(이메일/IP)</strong>: 최대 1일 보관 후 자동 삭제
                  </>,
                  <>
                    <strong>접속 로그 등 이용 기록</strong>: 서비스 안정화/보안 목적의 최소 기간
                    보관
                  </>,
                  <>
                    <strong>최근 본 게시물 기록</strong>: 최대 14일 보관 후 자동 삭제
                    <br />
                    <span className="text-slate-500">- 보관 개수: 숏로그 10개, 블로그 5개까지</span>
                    <br />
                    <span className="text-slate-500">
                      - 기간 경과 또는 저장 한도 초과 시 오래된 기록부터 자동 삭제됩니다.
                    </span>
                  </>,
                  <>
                    <strong>AI 도우미 이용 기록</strong>: OpenAI 처리·보관 관련 사항은 6항 참고
                    <br />
                    <span className="text-slate-500">
                      서비스는 AI 도우미 이용 과정에서 발생하는 입력·응답(대화) 로그를 별도로
                      저장하지 않습니다.
                    </span>
                  </>,
                ]}
              />
            </Callout>

            <Callout title="탈퇴하면 어떻게 되나요? (베타 운영 원칙)">
              회원이 탈퇴하면, 회사는 개인정보 처리방침 및 관련 법령에 따라 회원 정보를 처리합니다.{' '}
              <br />
              다만 회원이 작성한 블로그/숏로그 등 콘텐츠는 서비스 운영 및 이용자 보호를 위해 남을 수
              있어요. 이 경우 작성자 표기는 <strong>“탈퇴한 사용자”</strong>로 바뀌어 개인정보가
              드러나지 않도록 처리합니다. <br />
              콘텐츠에 개인정보가 포함되어 삭제가 필요한 경우, 문의 채널로 요청하시면 합리적인
              범위에서 검토/조치할 수 있습니다.
            </Callout>
          </Section>

          <Section id="rights" title="4. 동의 거부권 및 불이익">
            <p>
              이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. <br />
              다만 회원가입 및 서비스 제공에 꼭 필요한 <strong>필수 항목</strong>에 대한 동의를
              거부하시면 회원가입이 어려울 수 있어요.
            </p>
          </Section>

          <Section id="security" title="5. 어떻게 보호하나요">
            <BulletList
              items={[
                <>
                  비밀번호는 <strong>암호화(해시)</strong>하여 저장하고, 원문 비밀번호는 저장하지
                  않습니다.
                </>,
                <>
                  이메일 인증코드 및 레이트리밋 데이터는 <strong>짧은 유효기간</strong>으로 보관 후
                  자동 삭제합니다.
                </>,
                <>
                  보안 강화를 위해 필요한 경우, 비정상 트래픽 차단/요청 제한 등 조치를 할 수
                  있습니다.
                </>,
              ]}
            />
          </Section>

          <Section id="outsourcing" title="6. 개인정보 처리 위탁 및 국외 이전">
            <p className="text-sm text-slate-600">
              서비스는 AI 도우미 기능 제공을 위해 아래 업체에 개인정보 처리를 위탁/국외 이전할 수
              있습니다.
            </p>
            <BulletList
              items={[
                <>
                  <strong>수탁업체:</strong> OpenAI, L.L.C.
                </>,
                <>
                  <strong>이전/처리 항목:</strong> AI 도우미 이용 시 회원이 입력한 텍스트 및 생성된
                  텍스트 응답
                </>,
                <>
                  <strong>이용 목적:</strong> AI 도우미 답변 생성 및 서비스 제공
                </>,
                <>
                  <strong>보관 및 처리 기간:</strong> OpenAI의 API 데이터 보관 정책에 따르며,{' '}
                  기본적으로 입력·출력 데이터가 <strong>최대 30일</strong>간 보관될 수 있습니다. (
                  <span className="text-slate-500">
                    <a
                      href="https://platform.openai.com/docs/faq/do-you-store-the-data-that-is-passed-into-the-api?utm_source=chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      OpenAI 플랫폼
                    </a>
                  </span>
                  )
                </>,
                <>
                  <strong>이전 국가/처리 위치:</strong> OpenAI의 서버가 위치한 국가에서 처리될 수
                  있으며, 서비스 제공을 위해 <strong>대한민국 외 지역</strong>에서 처리·일시 저장될
                  수 있습니다. (
                  <span className="text-slate-500">
                    <a
                      href="https://platform.openai.com/docs/guides/your-data?utm_source=chatgpt.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      OpenAI 플랫폼
                    </a>
                  </span>
                  )
                </>,
              ]}
            />
            <p className="text-sm text-slate-600">
              * 서비스는 위탁업체가 개인정보를 안전하게 처리하도록 관리·감독하며, 관련 법령이
              요구하는 보호조치를 이행합니다.
            </p>
          </Section>

          <Section id="contact" title="7. 문의">
            <BulletList
              items={[
                <>
                  개인정보 관련 문의: <strong>(운영 이메일)</strong>
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
