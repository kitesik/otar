# 아또오타 Project Handoff

이 문서는 다른 Codex 스레드나 다른 컴퓨터에서 `아또오타` 프로젝트를 바로 이어서 작업하기 위한 운영 메모입니다.

## Project Identity

- 프로젝트 이름: `아또오타`
- 공개 도메인: `https://otar.site`
- 보조 도메인: `https://www.otar.site`
- GitHub repo: `kitesik/otar`
- 로컬 작업 폴더: `C:\Users\kites\chmi`
- Google Drive 미러: `G:\내 드라이브\otar`
- Vercel 프로젝트: `chmi`
- Vercel team/scope: `kitesik2-4021s-projects`

## Product Goal

주소창이나 검색창에 `ㅊ미`, `ggoogle`, `yoi`, `chatgtp`처럼 실수로 입력한 사용자가 들어왔을 때, 짧게 웃거나 기분 좋아지고 원래 가려던 서비스로 이동할 수 있게 하는 SEO 실험형 랜딩 사이트입니다.

핵심 톤:

- 사용자를 놀리지 않고 공감한다.
- 키워드를 억지로 반복하지 않는다.
- 얇은 doorway page처럼 보이지 않도록 각 URL에 작은 차이를 둔다.
- 첫 화면은 흰 배경, 큰 사진, 짧은 문구, 목적지 버튼 중심으로 유지한다.

## Current UX Copy

오타 랜딩 페이지의 현재 방향:

- H1: `{오타} ...`
- H2: `힐링 하고 가요.`
- 사진 아래 텍스트: `복이 찾아 올거에요🍀`
- SEO title: `{오타} 아 또 오타났네`

검색 결과에 노출되는 큰 파란 링크는 일반적으로 `SEO title`, `title tag`, `title link`라고 부릅니다. Google이 상황에 따라 임의로 다시 쓸 수 있으므로, 코드 반영 후 Search Console에서 재색인을 요청해야 합니다.

## Important Routes

- `/`: 메인 허브
- `/oops/[slug]`: 오타별 랜딩 페이지
- `/dictionary`: 전체 오타/서비스 사전
- `/archive`: 힐링 사진 아카이브
- `/sitemap.xml`: 색인 제출용 sitemap
- `/robots.txt`: 검색엔진 크롤링 정책
- `/api/delight`: 현재 노출할 사진 데이터
- `/api/visits`: 방문자 카운트 증가/조회

## SEO State

현재 SEO 목표는 모든 후보 문자열 5만 개를 무차별 페이지화하는 것이 아니라, 검증된 약 8,900개 안팎의 landing variant URL을 만들고 sitemap에 싣는 방식입니다.

중요 정책:

- 사용자가 실제로 칠 법한 문자열 중심으로 간다.
- `오타`, `잘못침`, `한영`, `검색어`, `바로가기` 같은 진단형 단어는 주요 타깃 쿼리에서 제외한다.
- 각 오타 URL은 표시되는 `{오타}`가 slug별로 달라야 한다.
- canonical, robots, sitemap, Open Graph, Twitter card, JSON-LD를 유지한다.
- 검색 결과 썸네일 힌트는 실제 페이지에서 보이는 귀여운 사진을 가리키게 한다.

현재 `/oops/[slug]` 메타 방향:

- `<title>`: `{오타} 아 또 오타났네`
- `og:image`: 현재 시간대 힐링 사진, 예: `https://otar.site/delight/hourly-01.jpg`
- `twitter:image`: 동일
- JSON-LD `primaryImageOfPage`: 동일

## Main Files

- `src/lib/site.ts`: 서비스 seed, typo intent, landing variant 생성 로직
- `src/lib/typo-page-copy.ts`: 오타 페이지별 미세 차이 문구
- `src/lib/delight-rotation.ts`: 시간대별 사진 로테이션
- `src/app/oops/[slug]/page.tsx`: 오타 랜딩 페이지, SEO metadata, JSON-LD
- `src/app/sitemap.ts`: sitemap URL 생성
- `src/app/robots.ts`: robots 정책
- `src/app/api/visits/route.ts`: 방문자 카운트 API
- `src/components/live-delight-card.tsx`: 사진 카드
- `src/components/visit-counter.tsx`: 방문자 카운트 UI

## Local Commands

```powershell
npm.cmd install
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
npm.cmd run validate:seo
```

로컬 확인 URL:

```text
http://127.0.0.1:3000
http://127.0.0.1:3000/oops/chmi
http://127.0.0.1:3000/oops/ggoogle
http://127.0.0.1:3000/dictionary
```

실도메인 SEO 검증:

```powershell
$env:SEO_BASE_URL="https://www.otar.site"
$env:SEO_PUBLIC_ORIGIN="https://otar.site"
npm.cmd run validate:seo
```

## Deployment Notes

일반 배포:

```powershell
npm.cmd run build
npx.cmd vercel deploy --prod --yes --scope kitesik2-4021s-projects
```

이 Windows 환경에서는 컴퓨터 hostname이 한글이라 Vercel CLI header 오류가 날 수 있습니다. 그 경우 아래 패치를 먼저 적용합니다.

```powershell
$patch=Join-Path $env:TEMP 'patch-os-hostname.cjs'
Set-Content -Path $patch -Value "require('os').hostname = () => 'kites';" -Encoding ASCII
$env:NODE_OPTIONS="--require $patch"
npx.cmd vercel whoami
```

필요 시 새 production deployment를 도메인에 수동 alias 합니다.

```powershell
npx.cmd vercel alias set <deployment-url> otar.site --scope kitesik2-4021s-projects
npx.cmd vercel alias set <deployment-url> www.otar.site --scope kitesik2-4021s-projects
```

## DNS

Gabia DNS 기준:

```text
Type: A
Host: @
Value: 76.76.21.21
```

```text
Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

## Search Console

Search Console 속성:

```text
https://otar.site
```

제출할 sitemap:

```text
https://otar.site/sitemap.xml
```

우선 URL 검사/색인 요청할 페이지:

```text
https://otar.site/
https://otar.site/oops/chmi
https://otar.site/oops/ggoogle
https://otar.site/oops/youtube-typo
https://otar.site/oops/chatgpt
https://otar.site/oops/claude
https://otar.site/dictionary
```

Google 검색 결과 title/snippet/image는 즉시 바뀌지 않습니다. 코드 배포 후 Search Console에서 URL 검사를 돌리고 색인 생성을 다시 요청해야 합니다.

## Visit Counter

방문자 카운트는 `/api/visits`에서 증가합니다.

우선순위:

1. Upstash Redis 환경 변수가 있으면 Redis 사용
2. 없으면 외부 CountAPI fallback 사용

관련 환경 변수:

```text
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
VISIT_COUNTER_BASE_TOTAL
```

현재 UX:

- 오늘 방문자 수와 누적 방문자 수를 보여준다.
- 오늘 숫자는 다른 색상으로 강조한다.
- 문구: `오타 동료들이 많아요`

## Delight Image Rotation

현재 페이지 사진은 API 크롤링보다 로컬 이미지 기반으로 운용합니다.

- 이미지 위치: `public/delight/hourly-*.jpg`
- 시간 단위 로테이션: `src/lib/delight-rotation.ts`
- 6시간 안에 같은 사진이 반복되지 않도록 설계
- SEO thumbnail도 같은 사진을 사용하도록 `/oops/[slug]` metadata에서 `getHourlyDelight()`를 참조

새 사진을 넣을 때는 파일명을 안정적으로 유지하거나, 로테이션 코드의 목록을 함께 업데이트합니다.

## Google Drive Sync

작업 후 Google Drive 미러가 필요하면 아래 명령을 사용합니다.

```powershell
robocopy "C:\Users\kites\chmi" "G:\내 드라이브\otar" /MIR /XD .git .next node_modules /XF .env.local
```

`robocopy`는 복사 성공이어도 exit code가 0이 아닐 수 있으므로 자동화에서는 필요하면 `exit 0`을 붙입니다.

```powershell
robocopy "C:\Users\kites\chmi" "G:\내 드라이브\otar" /MIR /XD .git .next node_modules /XF .env.local; exit 0
```

## Quality Checklist Before Handoff

배포나 SEO 변경 후 최소 확인:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd run validate:seo
```

실서비스 HTML spot check:

```powershell
$html=(Invoke-WebRequest -UseBasicParsing -Uri https://otar.site/oops/ggoogle -TimeoutSec 30).Content
[regex]::Match($html,'<title>(.*?)</title>').Groups[1].Value
[regex]::Match($html,'<meta property="og:image" content="([^"]+)"').Groups[1].Value
```

기대값 예시:

```text
ggoogle 아 또 오타났네
https://otar.site/delight/hourly-01.jpg
```

## Open Threads

- Google Search Console에서 sitemap 제출 및 주요 URL 색인 요청을 계속 확인해야 합니다.
- Google이 title link나 thumbnail을 임의로 바꿀 수 있으므로, 검색 결과 반영은 며칠 단위로 확인해야 합니다.
- 오타 후보는 많이 만들수록 spam 위험도 커집니다. 새 URL을 늘릴 때는 실제 사용자 입력 가능성과 페이지별 차이를 함께 검토합니다.
- 현재 `README.md`는 일부 환경에서 한글이 깨져 보입니다. 여유가 있으면 깨지지 않는 UTF-8 README로 재작성하는 것이 좋습니다.
