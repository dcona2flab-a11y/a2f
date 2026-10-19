# A2F Design Lab Website

인제대학교 A2F Design Lab 웹사이트입니다. Next.js (App Router) + TypeScript로 만들었고 Vercel에 배포합니다. 콘텐츠(JSON)와 이미지는 Vercel Blob에 저장합니다 (별도 데이터베이스 없음).

## 로컬 개발

필요: Node.js 22.9 이상 (권장 24), 이 저장소에 연결된 Vercel 프로젝트와 Blob store.

```bash
npm install
npx vercel login
npx vercel link                       # 이 폴더를 Vercel 프로젝트에 연결
npx vercel env pull .env.local --yes  # 환경변수 받기 (Blob 토큰은 약 12시간 후 만료 → 다시 실행)
npm run blob:test                     # Blob 연결 확인
npm run dev
```

## 환경변수

목록은 [.env.example](.env.example) 참고. 실제 값은 Vercel 프로젝트 설정에만 둡니다.

| 변수 | 설명 |
|---|---|
| `BLOB_STORE_ID`, `BLOB_WEBHOOK_PUBLIC_KEY` | 콘텐츠·이미지 Blob store (Public, prefix `BLOB`). 연결 시 자동 생성 |
| `AUTH_BLOB_STORE_ID` | 관리자 계정 전용 Blob store (Private, prefix `AUTH_BLOB`) |
| `SESSION_SECRET` | 관리자 세션 서명 키 (32자 이상, 환경마다 다른 값) |
| `NOTION_PUBLICATION_URL` | Publication 메뉴가 여는 Notion 페이지 |
| `NEXT_PUBLIC_SITE_URL` | 사이트 대표 주소. 설정해야 검색 엔진에 노출됩니다 |

관리자 아이디·비밀번호는 환경변수가 아닙니다. 처음 한 번 `npm run admin:bootstrap`으로 만들고, 이후에는 관리자 화면의 `/admin/account`에서 바꿉니다.

## 명령

| 명령 | 설명 |
|---|---|
| `npm run dev` / `build` / `start` | 개발 서버 / 빌드 / 실행 |
| `npm run lint` / `typecheck` | 코드 검사 |
| `npm run admin:bootstrap` | 관리자 계정 생성 (`-- --reset`: 비밀번호 재설정) |
| `npm run blob:test` | Blob 연결 테스트 |
| `npm run images:cleanup` | 어떤 콘텐츠도 쓰지 않는 오래된 이미지 목록 (`-- --delete`로 삭제) |
| `npm run blob:export` / `blob:import` | Blob store 간 데이터 이전 |

## 관리

- 관리자 화면: `/admin` (공개 페이지와 같은 화면에서 바로 편집)
- Vercel Hobby 요금제의 Blob 사용량(고급 작업 월 2,000회)을 넘지 않도록, 자동화된 대량 테스트는 실제 store에 실행하지 않습니다.
