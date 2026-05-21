# SEO Indexing Strategy

## Goal

`otar`는 주소창에 잘못 입력한 사용자를 위한 오타 의도 사전입니다.
검색엔진을 조작하기 위한 대량 doorway page가 아니라, 사용자가 실제로 찾으려던 서비스와 작은 기분 전환을 함께 제공하는 people-first 페이지를 목표로 합니다.

## Current Coverage

대표 서비스는 `src/lib/site.ts`의 `serviceSeeds`에 정의되어 있습니다.

- Search & portals: Google, Naver, Daum, Wikipedia
- AI assistants: ChatGPT, Claude, Perplexity, Gemini, Copilot
- Work & productivity: Google Calendar, Gmail, Drive, Docs, Translate, Notion, Slack, GitHub, Figma, Canva
- Video & music: YouTube, Netflix, Spotify, Melon, TVING, Coupang Play
- Social & community: Discord, Instagram, X/Twitter, Facebook, LinkedIn, Reddit, Kakao
- Shopping & local: Coupang, Baemin, Karrot/Danggeun, Musinsa, Kurly, Amazon
- Finance & crypto: Toss, Upbit, Bithumb, Binance
- Travel & maps: Google Maps, Kakao Map, Naver Map, Airbnb, Booking.com

## Query Generation Rules

각 서비스의 검색어 후보는 아래 입력을 합쳐 생성합니다.

- 한국어 서비스명: `구글 캘린더`, `챗지피티`, `네이버 지도`
- 한국어 오타 검색 표현: `{서비스명} 오타`
- 영문 브랜드 오타 검색 표현: `{Service} 오타`
- 주소창 alias: `cal`, `youtube`, `chatgpt`, `claude`, `naver`, `github`
- 한영 자판 실수: `cal -> ㅊ미`, `youtube -> ㅛㅐㅕ셔ㅠㄷ`
- 마지막 글자 누락: `youtube -> youtub`
- 중간 글자 누락: `google -> gogle`
- 인접 글자 전치: `claude -> cluade`
- 수동 큐레이션 오타: `yoi`, `yoiu`, `chatgtp`, `kakaotlak`

## Indexing Policy

- `/oops/[service-slug]` 대표 서비스 페이지는 `index` 대상입니다.
- `/dictionary`는 모든 검색어 후보를 탐색 가능한 사전으로 노출합니다.
- `/sitemap.xml`에는 대표 서비스 URL만 포함합니다.
- 중복/세부 오타 URL을 대량 생성하지 않습니다.
- future variant route를 추가할 경우 기본값은 canonical-to-intent 또는 noindex입니다.

이 정책은 Google Search Central의 people-first content, canonical, robots meta, spam 정책을 기준으로 잡았습니다.

## Search Console Checklist

1. `https://chmi.kr` 또는 실제 배포 도메인을 Search Console에 등록합니다.
2. `https://chmi.kr/sitemap.xml`을 제출합니다.
3. URL 검사로 아래 페이지를 먼저 요청합니다.
   - `/`
   - `/dictionary`
   - `/oops/chmi`
   - `/oops/youtube-typo`
   - `/oops/chatgpt`
   - `/oops/claude`
4. 2~4주 동안 노출 검색어를 확인합니다.
   - `ㅊ미`
   - `cal 한영`
   - `youtube 오타`
   - `yoi`
   - `chatgpt 오타`
   - `claude 오타`
5. 노출이 없는 서비스는 본문 설명을 강화하거나 사전 노출 순서를 조정합니다.
6. 내용이 얇은 신규 오타 페이지는 만들지 않고, 기존 대표 페이지에 검색어를 추가합니다.

## Quality Rules

- 공식 서비스처럼 보이게 만들지 않습니다.
- 외부 목적지 버튼은 명확히 외부 링크로 표시합니다.
- 콘텐츠 출처와 라이선스를 표시합니다.
- 키워드를 숨기거나 반복하지 않습니다.
- 검색어가 늘어날수록 대표 페이지/사전 구조로 묶어 중복을 줄입니다.
