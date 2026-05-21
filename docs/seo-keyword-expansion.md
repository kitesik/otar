# SEO keyword expansion notes

## 2026-05-21 expansion

The typo intent dictionary was expanded from 47 service intents to 140 service intents.
The generated sitemap now includes 143 public URLs:

- `/`
- `/dictionary`
- `/archive`
- 140 `/oops/[slug]` typo intent pages

## Selection basis

Services were prioritized when they are likely to be typed directly into a browser address bar by Korean or global users.

The expansion was guided by:

- Global high-traffic services reported in Similarweb-style website rankings: Google, YouTube, Instagram, ChatGPT, X, Reddit, Wikipedia, Amazon, TikTok, WhatsApp, Yahoo, Bing, and related global platforms.
- Korean daily-use apps and services repeatedly appearing in Korean app usage reports: KakaoTalk, YouTube, Naver, Coupang, Naver Map, Instagram, Toss, Baemin, KakaoBank, Naver Band, Kakao Pay, Kakao T, and major local commerce/media services.
- Practical address-bar intent rather than only brand fame. For example, `meet`, `sheets`, `aws console`, `naver map`, `kakao t`, and `korail` are likely to be used as shortcut commands.

## Added clusters

- Search and portals: Bing, Yahoo, DuckDuckGo, Baidu, Yandex, Namuwiki
- Google productivity: Sheets, Slides, Meet, Photos, Keep, Forms
- Microsoft/work tools: Outlook, Teams, OneDrive, Microsoft 365, Zoom, Dropbox, Trello, Asana, Jira, Linear, Miro
- Developer tools: Stack Overflow, Vercel, Cloudflare, AWS, Azure, npm, Docker
- AI services: Hugging Face, Grok, DeepSeek, Midjourney, Poe, Character.AI
- Social/community: TikTok, Threads, WhatsApp, Telegram, LINE, Pinterest, Snapchat, Twitch, SOOP, CHZZK, Naver Blog, Naver Cafe, Naver Band, DCInside, Theqoo
- Shopping/local: Gmarket, Auction, 11st, SSG, LotteON, Olive Young, Zigzag, Ably, AliExpress, Temu, eBay, Walmart, SHEIN, Etsy
- Travel/maps: Agoda, Expedia, Trip.com, Skyscanner, Uber, Kakao T, Korail, Yanolja, Yeogi Eottae
- Finance: KakaoBank, Kbank, Kakao Pay, Naver Pay, Samsung Pay, PayPal, Coinbase, Robinhood
- Video/music: Disney+, Prime Video, Apple TV, Wavve, Watcha, Apple Music, SoundCloud, Genie, Bugs, FLO

## SEO guardrails

This site intentionally avoids generating arbitrary typo pages from every possible keyboard mutation.
Each indexed page should represent a recognizable service intent, include a real destination button, and show the typo/search terms transparently on the page.

If Search Console shows no impressions after several weeks, low-signal pages should be reviewed and either rewritten, consolidated, or moved to `noindex`.

## Validation

After the expansion:

```text
npm run lint
npm run validate:seo
npm run build
```

All passed locally.
