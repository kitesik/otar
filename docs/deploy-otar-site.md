# otar.site 배포 체크리스트

## Canonical URL

공식 랜딩 도메인은 아래 URL을 사용합니다.

```text
https://otar.site
```

## Vercel 설정

Vercel 프로젝트 `chmi`의 Production Environment Variable에 아래 값을 설정합니다.

```text
NEXT_PUBLIC_SITE_URL=https://otar.site
```

선택 환경 변수:

```text
UNSPLASH_ACCESS_KEY=<unsplash access key>
KV_REST_API_URL=<vercel kv rest url>
KV_REST_API_TOKEN=<vercel kv rest token>
VISIT_COUNTER_BASE_TOTAL=1000
```

또는 Upstash Redis를 쓸 경우:

```text
UPSTASH_REDIS_REST_URL=<upstash redis rest url>
UPSTASH_REDIS_REST_TOKEN=<upstash redis rest token>
```

## 도메인 연결

Vercel 프로젝트의 Domains 메뉴에 아래 도메인을 추가합니다.

```text
otar.site
```

Gabia DNS에서 Vercel 안내에 맞춰 루트 도메인 A 레코드를 추가합니다.

```text
Type: A
Host/Name: @
Value: 76.76.21.21
TTL: 기본값
```

Gabia 화면에서 `@` 입력을 지원하지 않으면 호스트/이름 칸을 비워두는 방식이 루트 도메인을 뜻할 수 있습니다.

선택적으로 `www.otar.site`도 받을 거라면 CNAME을 추가합니다.

```text
Type: CNAME
Host/Name: www
Value: cname.vercel-dns.com
TTL: 기본값
```

## 배포 후 검증

아래 URL을 확인합니다.

```text
https://otar.site
https://otar.site/oops/chmi
https://otar.site/sitemap.xml
https://otar.site/robots.txt
https://otar.site/opengraph-image
```

실제 도메인 기준 SEO 검증:

```powershell
$env:SEO_BASE_URL="https://otar.site"
$env:SEO_PUBLIC_ORIGIN="https://otar.site"
npm.cmd run validate:seo
```

Vercel 기본 도메인으로 먼저 검증해야 할 때:

```powershell
$env:SEO_BASE_URL="https://chmi.vercel.app"
$env:SEO_PUBLIC_ORIGIN="https://otar.site"
npm.cmd run validate:seo
```

## Search Console

1. Google Search Console에서 `https://otar.site` URL-prefix 속성을 추가합니다.
2. HTML/meta 또는 DNS 방식으로 소유권을 확인합니다.
3. `https://otar.site/sitemap.xml`을 제출합니다.
4. 먼저 아래 URL들을 URL 검사로 색인 요청합니다.

```text
https://otar.site/
https://otar.site/oops/chmi
https://otar.site/oops/youtube-typo
https://otar.site/oops/chatgpt
https://otar.site/oops/deepseek
https://otar.site/dictionary
```
