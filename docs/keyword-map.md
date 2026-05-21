# Keyword Map

이 문서는 사람이 읽기 위한 요약입니다. 실제 전체 검색어 후보의 source of truth는 `src/lib/site.ts`의 `serviceSeeds`와 생성 규칙입니다.

| Category | Services | Query Examples |
| --- | --- | --- |
| Search & portals | Google, Naver, Daum, Wikipedia | `gogle`, `googel`, `해ㅐ히`, `navr`, `ㅜㅁㅍㄷㄱ`, `위키 오타` |
| AI assistants | ChatGPT, Claude, Perplexity, Gemini, Copilot | `chatgtp`, `chatgptt`, `claude.ai`, `cluade`, `pplx ai`, `gemni`, `copliot` |
| Work & productivity | Calendar, Gmail, Drive, Docs, Translate, Notion, Slack, GitHub, Figma, Canva | `ㅊ미`, `cal 한영`, `gamil`, `gmial`, `drvie`, `dcos`, `notoin`, `salck`, `gihub`, `fimga`, `cavna` |
| Video & music | YouTube, Netflix, Spotify, Melon, TVING, Coupang Play | `yoi`, `yoiu`, `youtub`, `yotube`, `netfix`, `spotfy`, `mellon`, `tivng`, `coupang paly` |
| Social & community | Discord, Instagram, X/Twitter, Facebook, LinkedIn, Reddit, Kakao | `dicord`, `instgram`, `twiter`, `facebok`, `linkdin`, `redit`, `kakaotlak` |
| Shopping & local | Coupang, Baemin, Karrot/Danggeun, Musinsa, Kurly, Amazon | `couapng`, `baemim`, `danggun`, `musisna`, `marketkurly`, `amazn` |
| Finance & crypto | Toss, Upbit, Bithumb, Binance | `toos`, `ubpit`, `bithunb`, `binnace`, `바이낸스 오타` |
| Travel & maps | Google Maps, Kakao Map, Naver Map, Airbnb, Booking.com | `mpas`, `kakaompa`, `naver mpa`, `airbn`, `bookign` |

## Important Example

`cal`을 한글 자판 상태에서 입력하면 `ㅊ미`가 됩니다.
이 프로젝트의 대표 브랜드 페이지는 이 순간을 가장 먼저 잡습니다.

## Expansion Rule

새 서비스를 추가할 때는 아래 기준을 모두 만족해야 합니다.

- 실제 사용자가 주소창에 직접 입력할 가능성이 높다.
- alias 또는 오타가 검색 의도로 설명 가능하다.
- 공식 서비스 사칭처럼 보이지 않는다.
- 페이지 본문이 단순 키워드 나열을 넘어서 사용자에게 실제 도움이 된다.
