# 포트폴리오 CMS 설정

## 사이트 수정

기존 HTML / CSS / JS 구조를 그대로 사용합니다. `index.html`, `css/style.css`,
`js/script.js`가 기존 파일입니다. MAIN / ABOUT은 요청하신 완성 이미지로 교체했으며 WORKS는 기존 디자인을 유지합니다.
방명록 전용 스타일은 `css/cms.css`, CMS 데이터 연결은 `js/cms.js`에 있습니다.
원본 백업 브랜치: `before-cms-setup`.

## 작품 관리

1. https://app.pagescms.org 접속 → GitHub 로그인.
2. Pages CMS GitHub App을 설치하고 `dlacndrhs123-cmd/PORTFOLIO` 접근을 허용합니다.
3. 저장소와 `main` 브랜치를 선택합니다. 루트 `.pages.yml`을 자동으로 읽습니다.
4. Works에서 작품 목록을 추가 / 수정 / 삭제하고 저장합니다.
5. 대표 이미지는 `images/uploads`에 업로드하거나 `images`의 기존 파일을 선택합니다.
6. 공개 여부를 끄면 사이트에 표시되지 않습니다. 노출 순서는 작은 숫자가 먼저입니다.

Works는 `data/works.json` 전체 배열을 편집합니다. 기존 작품 7개를 유지하고 NTO THE GARDEN을 첫 번째 작품으로 추가했습니다.
`표지 표시 방식`에서 완성 표지 이미지를 선택하면 이미지 전체를 보여주며 이미지에 이미 포함된 제목·설명을 중복 표시하지 않습니다.
작품 ID는 영어 소문자·숫자·하이픈으로 서로 다르게 입력하세요.
`featured`는 기존 MAIN에 작품 영역이 없어 보관만 합니다. 연도도 저장되지만 기존 카드에는 새 표시를 추가하지 않습니다.
공개 여부를 꺼도 공개 GitHub와 JSON 원본을 비공개로 만드는 것은 아닙니다.

### CMS 저장 확인

Works에서 공개 여부를 끈 테스트 작품을 하나 추가하고 저장하세요.
GitHub의 `data/works.json`에 새 항목이 생겼는지 확인한 뒤 CMS에서 삭제하고 저장하세요.
이는 Pages CMS 실제 로그인 후 확인해야 하는 항목입니다. 로컬 데이터 연결 검증과는 다릅니다.

## 상세페이지 제작

### NTO THE GARDEN

WORKS 첫 표지는 `images/works/nto-the-garden/cover.png`입니다.
클릭하면 `detail-nto-the-garden.html`이 기존 Fancybox iframe으로 열립니다.
외부·내부 이미지 2장은 Swiper 12를 이용해 드래그 / 터치 / 좌우 버튼 / 하단 점 / 키보드 방향키로 넘길 수 있습니다.
원본 이미지 비율을 유지하고 자동 넘김은 사용하지 않습니다.
상세 설명은 HTML에서, 전용 스타일과 슬라이드 설정은 `css/detail-nto-the-garden.css`, `js/detail-nto-the-garden.js`에서 수정합니다.
완성 표지 안의 글자는 이미지에 포함돼 있어 CMS 텍스트 변경 시 이미지도 별도로 교체해야 합니다.

### VIDEO Editing

WORKS 두 번째 유튜브 표지를 클릭하면 `detail-video.html`이 Fancybox iframe으로 열립니다.
첨부된 완성 이미지 4장을 `02 → 03 → 04 → 05` 순서로 표시합니다.
로아디자인TV / 에디의부동산 / SEO마스터 / 운쌤인테리어 순서이며,
파일은 `images/works/video/slide-02.png`부터 `slide-05.png`까지입니다.
제목·설명·QR코드가 이미 포함된 이미지여서 별도 텍스트를 중복 표시하지 않습니다.
화면과 팝업 크기에 맞춰 원본 1920 × 1090 비율을 유지하고 이미지 전체를 표시합니다.
Swiper 12의 드래그 / 터치 / 좌우 버튼 / 하단 점 / 키보드로 넘기며 마지막 장 다음에는 첫 장으로 돌아옵니다.
자동 넘김은 사용하지 않습니다.

Pages CMS → Video Slides에서 4개 항목의 프로젝트명·전체 이미지·대체 텍스트를 교체할 수 있습니다.
프로젝트명은 하단 현재 슬라이드 안내에 표시됩니다. 이미지 안의 글자는 이미지 파일에서 수정하세요.
항목은 4개를 유지하세요. 데이터는 `data/video-projects.json`에 저장됩니다.
WORKS 목록의 대표 이미지는 Works의 영상 편집 작품에서 별도로 바꿀 수 있습니다.
레이아웃과 동작은 `css/detail-video.css`, `js/detail-video.js`에서 수정합니다.

GitHub에서 실제 HTML 상세페이지를 제작합니다. 예: `details/branding.html`.
상세페이지가 참조하는 CSS / 이미지도 함께 올립니다. 기존 Fancybox iframe으로 열립니다.
HTML 자체를 CMS가 덮어쓰지 않도록 메타데이터를 별도로 관리합니다.

## 상세페이지 연결

1. GitHub에 HTML을 먼저 올립니다.
2. Pages CMS → Detail Pages → 새 항목에서 페이지명과 실제 HTML 경로를 입력합니다.
3. 경로는 루트 기준 `details/branding.html`처럼 입력합니다. `https://`나 앞의 `/`는 넣지 않습니다.
4. 파일 확인 메모에 `파일 있음`을 입력하고 저장합니다.
5. Works → 상세 페이지에서 검색하여 선택하고 저장합니다.

검색 목록은 `content/detail-pages/*.json`입니다. 선택하면 Works에는 메타데이터 파일명이 아닌
실제 HTML 경로가 저장됩니다. 새 HTML 추가 후 목록 등록은 위 단계로 직접 합니다.

### 현재 누락 파일

다음 링크는 기존 카드에 있지만 실제 HTML 파일은 저장소에 없습니다.
목록의 메모에도 `링크는 있지만 파일이 없음`으로 표시했습니다. 가짜 HTML은 만들지 않았습니다.

- `detail-motion.html`
- `detail-poster.html`
- `detail-branding.html`
- `detail-cardnews.html`
- `detail-brochure.html`
- `detail-leaflet.html`

기존 영상 `images/bg2.mp4`는 저장소에 없지만 현재 MAIN은 완성 표지 이미지를 사용합니다.
GMarketSans와 Playfair Display는 CSS에서 사용하지만 폰트 로딩 정의가 없어 시스템 폰트로 대체됩니다.
Pretendard / Xeicon / Swiper 12 / Fancybox 6.1은 기존 CDN 연결을 유지합니다.
MAIN은 `images/main/portfolio-cover.png`를 사용합니다. 원본 비율을 유지해 이미지 안의 글자가 잘리지 않게 표시합니다.
메인 이미지는 GitHub에서 같은 경로의 파일을 교체하면 됩니다.
ABOUT은 `images/about/portfolio-about.png`의 완성 소개·연혁 이미지를 사용하며 상단 메뉴 아래에서 원본 비율로 표시합니다.
ABOUT 이미지 교체도 GitHub에서 같은 경로의 파일을 교체하면 됩니다. 이미지 안의 문구는 이미지 파일에서 수정하세요.
검은 MAIN / ABOUT 화면에서는 메뉴를 흰색으로 표시합니다.

## 방명록 확인

방문자는 CONTACT에서 이름(최대 40자), 메시지(최대 500자)를 입력합니다.
성공하면 관리자에게 전달되었다는 안내만 표시합니다. 공개 방명록 목록은 추가하지 않았습니다.

Pages CMS → Guestbook에서 최신순으로 확인하고 승인 여부를 변경하거나 삭제합니다.
새 글은 `approved: false`로 저장됩니다. 이름·메시지·작성일은 읽기 전용이고 CMS의 새 글 작성은 끕니다.
승인은 관리용 상태이며 현재 사이트에 글을 공개하는 기능은 없습니다.

**현재 GitHub 저장소는 public입니다.** 방명록 파일도 GitHub에서 누구나 읽을 수 있고 커밋 기록에 남습니다.
승인 전의 글도 마찬가지입니다. 배포 사이트의 정적 파일에서는 방명록 폴더를 제외합니다.
완전한 비공개 수신이 필요하면 저장소 비공개 전환 또는 별도 비공개 저장소/데이터베이스가 필요합니다.

## 배포

GitHub push → Cloudflare Pages 자동 배포. CMS에서 저장한 변경도 GitHub 커밋이므로 자동 배포됩니다.

Cloudflare → Workers & Pages → Create application → Pages → Import an existing Git repository
(화면에 따라 Connect to Git) → GitHub 연결 → `dlacndrhs123-cmd/PORTFOLIO` 선택.

| 항목 | 값 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | 비워둠 (저장소 루트) |
| Build command | `node scripts/build.mjs` |
| Build output directory | `dist` |

작은 Node 기본 기능 스크립트가 공개 HTML / CSS / JS / 이미지 / 영상 / 폰트 / 작품 JSON만
`dist`에 복사합니다. 프레임워크와 패키지 설치는 없습니다. `content` / 문서 / 테스트 / 서버 코드와
숨김 파일은 정적 배포에서 제외합니다. 상세페이지는 저장소의 어느 일반 폴더에 올려도 HTML을 복사합니다.
`functions/api/guestbook.js`는 저장소 루트의 Functions 규칙으로 별도 배포됩니다.
`_routes.json`은 API 경로만 Function을 실행하게 합니다.
SCSS를 수정하면 기존 방법으로 `css/style.css`도 갱신해야 합니다. 이 스크립트는 SCSS를 컴파일하지 않습니다.
Cloudflare 계정 연결·GitHub 접근 허용·최초 배포는 본인이 대시보드에서 완료해야 합니다.

## 필요한 Cloudflare Variables / Secrets

프로젝트 → Settings → Variables and Secrets에서 **Production** 환경에 등록하고 다시 배포하세요.
실제 저장소에 방명록을 저장하는 Preview 환경에는 같은 Token을 넣지 않는 것을 권장합니다.

| 이름 | 종류 | 입력값 |
| --- | --- | --- |
| `GITHUB_TOKEN` | Secret | 아래 최소 권한 GitHub Token |
| `GITHUB_OWNER` | Variable | `dlacndrhs123-cmd` |
| `GITHUB_REPO` | Variable | `PORTFOLIO` |
| `GITHUB_BRANCH` | Variable | `main` |
| `TURNSTILE_SITE_KEY` | Variable | Turnstile 위젯 Site Key (공개 값) |
| `TURNSTILE_SECRET_KEY` | Secret | 같은 위젯의 Secret Key |

GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens에서
Resource owner를 `dlacndrhs123-cmd`, Repository access를 **Only select repositories → PORTFOLIO**로 선택하세요.
Repository permissions → **Contents: Read and write**만 추가합니다. 기본 Metadata 읽기는 자동 포함됩니다.
만료일을 정하고 Cloudflare Secret에만 저장하세요. 코드·HTML·GitHub·CMS·브라우저에 Token을 넣지 않습니다.
`main`이 보호되어 직접 파일 생성이 막히면 API도 저장하지 못합니다. 실제 토큰으로 배포 후 확인해야 합니다.

Cloudflare → Turnstile → Add widget → Managed → 실제 `*.pages.dev` 주소와 사용자 도메인을 등록합니다.
전체 와일드카드 대신 본인의 정확한 호스트를 사용하세요. 받은 두 Key를 위 이름으로 등록하고 재배포합니다.
브라우저는 GET `/api/guestbook`에서 Site Key만 읽습니다. POST에서 서버가 Secret으로 인증 결과,
호스트명, `guestbook` action을 확인합니다. 운영 환경에서 Key가 없으면 제출을 막습니다.

## 로컬 테스트

GitHub 접근 없이 API 모의 검증: `node --test tests/guestbook.test.mjs`.
빌드 확인: `node scripts/build.mjs`.
실제 Functions 로컬 실행: Wrangler가 설치된 환경에서 `npx wrangler pages dev dist`.
루트 `.dev.vars`에 위 변수를 직접 등록하고 로컬에서만 `ALLOW_LOCAL_GUESTBOOK_TEST=true`를 추가하면
localhost / 127.0.0.1에서 Turnstile 없이 테스트할 수 있습니다. 운영 호스트에서는 이 옵션이 무시됩니다.
이 모드도 실제 Token이 있으면 GitHub에 글을 씁니다. 별도 테스트 저장소/브랜치를 지정하세요.
`.dev.vars`, `.env`는 Git에서 제외합니다. 운영 환경에 로컬 테스트 옵션을 넣지 마세요.

## 배포 후 확인

1. MAIN / ABOUT / WORKS / CONTACT가 기존 Swiper로 이동하는지 확인합니다.
2. 실제 이미지를 업로드한 작품을 공개하고 순서를 바꿔 사이트에 반영되는지 확인합니다.
3. 실제 HTML을 올리고 Detail Pages에 등록한 뒤 Fancybox iframe이 열리는지 확인합니다.
4. 방명록 제출 → `content/guestbook/*.json` 생성 → Guestbook에서 확인/승인/삭제합니다.
5. `content/guestbook/` 원본이 배포 사이트에서는 접근되지 않는지 확인합니다.
6. 모바일에서 CONTACT 입력·스크롤·Turnstile 인증을 확인합니다.

## 공식 문서

- https://pagescms.org/docs/configuration/content/list/
- https://pagescms.org/docs/configuration/fields/reference/
- https://pagescms.org/docs/configuration/content/operations/
- https://developers.cloudflare.com/pages/functions/get-started/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
