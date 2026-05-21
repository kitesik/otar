# otar / ㅊ미

주소창에 `cal`을 치려다 한영키를 놓쳐 `ㅊ미`를 검색한 사람을 위한 오타 랜딩 사이트입니다.
서비스 목적은 사용자를 속여 클릭시키는 것이 아니라, 잘못 도착한 사람에게 실제 목적지 바로가기와 짧은 기분 전환을 제공하는 것입니다.

## What It Covers

- 한국/글로벌 주요 서비스 40개 이상
- Google, YouTube, Calendar, Gmail, ChatGPT, Claude, Naver, Kakao, Coupang, Toss, GitHub, Figma 등
- 영문 alias, 한국어 서비스명, 한영 자판 실수, 글자 누락, 인접 글자 전치, 대표 수동 오타
- `/dictionary`에서 전체 오타 의도 사전 확인
- `/oops/[slug]`에서 서비스별 SEO 랜딩 페이지 확인

## SEO Strategy

- 대표 서비스 페이지만 `index` 처리합니다.
- 오타 키워드는 대표 페이지 본문과 사전에 노출해 검색 의도를 설명합니다.
- 얇은 doorway page를 대량 생성하지 않습니다.
- `sitemap.xml`에는 대표 canonical URL만 넣습니다.
- `robots.txt`, canonical, Open Graph, Twitter card, JSON-LD를 기본 제공합니다.

자세한 내용은 [docs/seo-indexing-strategy.md](docs/seo-indexing-strategy.md)를 보세요.

## Local Development

```bash
npm.cmd install
npm.cmd run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Verification

```bash
npm.cmd run lint
npm.cmd run build
```

수동으로 확인할 주요 URL:

- `/`
- `/dictionary`
- `/archive`
- `/oops/chmi`
- `/oops/youtube-typo`
- `/oops/chatgpt`
- `/sitemap.xml`
- `/robots.txt`

## Content Operations

`src/lib/site.ts`가 현재 MVP의 데이터 원천입니다.

- `serviceSeeds`: 서비스/alias/대표 오타 후보
- `typoIntents`: index 가능한 대표 오타 의도 페이지
- `delightItems`: 오늘의 귀여운 사진/자연 사진/기분 전환 콘텐츠

콘텐츠는 저작권 안전한 이미지와 출처/라이선스를 포함해야 합니다.
