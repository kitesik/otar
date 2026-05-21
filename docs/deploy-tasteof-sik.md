# tasteof-sik 하위 도메인 배포 체크리스트

## 추천 URL

첫 SEO 실험용 주소는 아래처럼 짧은 하위 도메인을 권장합니다.

```text
https://otar.tasteof-sik.xyz
```

실제 보유 도메인은 `tasteof-sik.xyz`입니다.

## Vercel 설정

1. Vercel에서 `kitesik/otar` 저장소를 Import합니다.
2. Framework는 Next.js 자동 감지를 사용합니다.
3. Environment Variables에 아래 값을 추가합니다.

```text
NEXT_PUBLIC_SITE_URL=https://otar.tasteof-sik.xyz
```

4. 자연 사진까지 섞고 싶으면 선택적으로 아래 값을 추가합니다.

```text
UNSPLASH_ACCESS_KEY=<unsplash access key>
```

5. 페이지 안 방문자 카운터를 실제 값으로 쓰려면 Upstash Redis 또는 Vercel KV를 연결하고 아래 값 중 한 쌍을 추가합니다.

```text
KV_REST_API_URL=<vercel kv rest url>
KV_REST_API_TOKEN=<vercel kv rest token>
```

또는:

```text
UPSTASH_REDIS_REST_URL=<upstash redis rest url>
UPSTASH_REDIS_REST_TOKEN=<upstash redis rest token>
```

처음 누적 숫자를 1,000부터 시작하고 싶다면 선택적으로:

```text
VISIT_COUNTER_BASE_TOTAL=1000
```

## 도메인 연결

Vercel 프로젝트의 Domains 메뉴에서 하위 도메인을 추가합니다.

```text
otar.tasteof-sik.xyz
```

DNS 제공자에서 Vercel 안내에 맞춰 `A` 레코드를 추가합니다.

```text
Type: A
Name: otar
Value: 76.76.21.21
```

루트 도메인의 DNS를 Vercel로 위임해둔 상태라면 Vercel이 자동으로 레코드를 잡을 수 있습니다.

## 배포 후 검증

아래 URL을 확인합니다.

```text
https://otar.tasteof-sik.xyz
https://otar.tasteof-sik.xyz/oops/chmi
https://otar.tasteof-sik.xyz/sitemap.xml
https://otar.tasteof-sik.xyz/robots.txt
```

로컬에서 실제 도메인 기준 SEO 검증을 하려면:

```powershell
$env:SEO_BASE_URL="https://otar.tasteof-sik.xyz"
$env:SEO_PUBLIC_ORIGIN="https://otar.tasteof-sik.xyz"
npm.cmd run validate:seo
```

## Search Console

1. Google Search Console에서 `https://otar.tasteof-sik.xyz` URL-prefix 속성을 추가합니다.
2. Vercel 도메인이 붙은 뒤 HTML/meta 또는 DNS 방식으로 소유권을 확인합니다.
3. `https://otar.tasteof-sik.xyz/sitemap.xml`을 제출합니다.
4. 먼저 아래 URL들을 URL 검사로 색인 요청합니다.

```text
https://otar.tasteof-sik.xyz/
https://otar.tasteof-sik.xyz/oops/chmi
https://otar.tasteof-sik.xyz/oops/youtube-typo
https://otar.tasteof-sik.xyz/oops/chatgpt
https://otar.tasteof-sik.xyz/dictionary
```
