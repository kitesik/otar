export type IndexingMode = "index" | "canonical-to-intent" | "noindex";
export type RegionScope = "global" | "korea" | "both";

export type ServiceCategory =
  | "Search & portals"
  | "Video & music"
  | "AI assistants"
  | "Work & productivity"
  | "Social & community"
  | "Shopping & local"
  | "Finance & crypto"
  | "Travel & maps";

export type TypoIntent = {
  slug: string;
  queries: string[];
  intendedService: string;
  intentLabel: string;
  locale: "ko-KR";
  canonicalPath: string;
  indexingMode: IndexingMode;
  destinationUrl: string;
  explanation: string;
  wink: string;
  keywordCluster: string[];
  category: ServiceCategory;
  region: RegionScope;
  aliases: string[];
  typoExamples: string[];
  audienceNote: string;
};

export type DelightItem = {
  date: string;
  title: string;
  caption: string;
  image: string;
  imageAlt: string;
  sourceUrl: string;
  sourceLicense: string;
  tags: string[];
};

type ServiceSeed = {
  slug: string;
  name: string;
  koreanName: string;
  category: ServiceCategory;
  region: RegionScope;
  aliases: string[];
  destinationUrl: string;
  typoExamples?: string[];
  note: string;
  wink?: string;
};

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://chmi.kr");

export const siteConfig = {
  name: "ㅊ미",
  domain: new URL(siteUrl).hostname,
  url: siteUrl,
  description:
    "cal을 ㅊ미로, youtube를 yoi로 친 사람을 위한 작은 오타 쉼터. 귀여운 사진 하나 보고 원래 목적지로 바로 돌아가세요.",
};

const dubeolsikMap: Record<string, string> = {
  q: "ㅂ",
  w: "ㅈ",
  e: "ㄷ",
  r: "ㄱ",
  t: "ㅅ",
  y: "ㅛ",
  u: "ㅕ",
  i: "ㅑ",
  o: "ㅐ",
  p: "ㅔ",
  a: "ㅁ",
  s: "ㄴ",
  d: "ㅇ",
  f: "ㄹ",
  g: "ㅎ",
  h: "ㅗ",
  j: "ㅓ",
  k: "ㅏ",
  l: "ㅣ",
  z: "ㅋ",
  x: "ㅌ",
  c: "ㅊ",
  v: "ㅍ",
  b: "ㅠ",
  n: "ㅜ",
  m: "ㅡ",
};

function toHangulKeyboard(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((letter) => dubeolsikMap[letter] ?? letter)
    .join("");
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function typoMutations(alias: string) {
  const normalized = alias.toLowerCase();
  const mutations = [
    toHangulKeyboard(normalized),
    normalized.length > 3 ? normalized.slice(0, -1) : "",
    normalized.length > 4
      ? `${normalized.slice(0, 2)}${normalized.slice(3)}`
      : "",
    normalized.length > 4
      ? `${normalized.slice(0, 2)}${normalized[3]}${normalized[2]}${normalized.slice(4)}`
      : "",
  ];

  return dedupe(mutations).filter((value) => value !== normalized);
}

const serviceSeeds: ServiceSeed[] = [
  {
    slug: "chmi",
    name: "Google Calendar",
    koreanName: "구글 캘린더",
    category: "Work & productivity",
    region: "both",
    aliases: ["cal", "calendar", "google calendar", "gcal"],
    destinationUrl: "https://calendar.google.com/calendar/u/0/r",
    typoExamples: ["ㅊ미", "cal 한영", "cal 잘못침", "구글 캘린더 오타"],
    note: "영문 입력으로 cal을 치려던 손가락이 한글 자판에 남아 있으면 ㅊ미가 됩니다.",
    wink: "일정은 안 열렸지만, 오늘의 작은 쉼표는 열렸어요.",
  },
  {
    slug: "youtube-typo",
    name: "YouTube",
    koreanName: "유튜브",
    category: "Video & music",
    region: "both",
    aliases: ["youtube", "you", "yt", "yutub"],
    destinationUrl: "https://www.youtube.com/",
    typoExamples: ["yoi", "yoiu", "youtub", "yotube", "youutbe", "유튜브 오타"],
    note: "주소창 자동완성을 믿고 치다 보면 youtube가 yoi, yoiu, yotube처럼 반쯤만 도착할 때가 있습니다.",
    wink: "영상은 잠깐 뒤에 봐도 됩니다. 먼저 3초만 웃고 가요.",
  },
  {
    slug: "google-search",
    name: "Google",
    koreanName: "구글",
    category: "Search & portals",
    region: "both",
    aliases: ["google", "goog", "g"],
    destinationUrl: "https://www.google.com/",
    typoExamples: ["gogle", "googel", "goole", "googlr", "해ㅐ히"],
    note: "검색하려고 들어간 주소창에서 google의 o/e 순서가 흔들리거나 한영키가 남아 있을 때 생기는 오타입니다.",
  },
  {
    slug: "naver",
    name: "Naver",
    koreanName: "네이버",
    category: "Search & portals",
    region: "korea",
    aliases: ["naver", "nv", "naver.com"],
    destinationUrl: "https://www.naver.com/",
    typoExamples: ["nver", "navr", "nave", "ㅜㅁㅍㄷㄱ", "네이버 오타"],
    note: "국내 사용자가 주소창에서 가장 자주 찾는 포털 중 하나라 영문 누락과 한영 전환 실수를 함께 잡습니다.",
  },
  {
    slug: "daum",
    name: "Daum",
    koreanName: "다음",
    category: "Search & portals",
    region: "korea",
    aliases: ["daum", "hanmail"],
    destinationUrl: "https://www.daum.net/",
    typoExamples: ["dum", "daun", "ㅇ며ㅡ", "다음 오타"],
    note: "짧은 서비스명은 한 글자 누락과 한영 전환 실수만으로도 검색 의도가 꽤 선명합니다.",
  },
  {
    slug: "gmail",
    name: "Gmail",
    koreanName: "지메일",
    category: "Work & productivity",
    region: "both",
    aliases: ["gmail", "mail", "google mail"],
    destinationUrl: "https://mail.google.com/mail/u/0/",
    typoExamples: ["gamil", "gmial", "gmai", "ㅎㅡ먀ㅣ", "지메일 오타"],
    note: "메일을 급히 열다가 gmail의 a/i가 뒤집히거나 마지막 l이 빠지는 경우를 묶습니다.",
  },
  {
    slug: "google-drive",
    name: "Google Drive",
    koreanName: "구글 드라이브",
    category: "Work & productivity",
    region: "both",
    aliases: ["drive", "gdrive", "google drive"],
    destinationUrl: "https://drive.google.com/",
    typoExamples: ["drvie", "drv", "ㅇ갸ㅍㄷ", "구글 드라이브 오타"],
    note: "파일을 찾으려는 의도는 drive, gdrive, 한영 자판 문자열에서 잘 드러납니다.",
  },
  {
    slug: "google-docs",
    name: "Google Docs",
    koreanName: "구글 문서",
    category: "Work & productivity",
    region: "both",
    aliases: ["docs", "doc", "google docs"],
    destinationUrl: "https://docs.google.com/document/u/0/",
    typoExamples: ["docx", "dcos", "ㅇㅐㅊㄴ", "구글 독스 오타"],
    note: "문서 편집으로 가려던 사람을 docs/doc/docx 계열 오타로 연결합니다.",
  },
  {
    slug: "google-maps",
    name: "Google Maps",
    koreanName: "구글 지도",
    category: "Travel & maps",
    region: "both",
    aliases: ["maps", "map", "google maps"],
    destinationUrl: "https://www.google.com/maps",
    typoExamples: ["mpas", "maos", "ㅡㅁㅔㄴ", "구글 지도 오타"],
    note: "지도 서비스는 짧은 alias가 많아 누락, 인접키, 한영 전환을 함께 노출합니다.",
  },
  {
    slug: "google-translate",
    name: "Google Translate",
    koreanName: "구글 번역",
    category: "Work & productivity",
    region: "both",
    aliases: ["translate", "trans", "google translate"],
    destinationUrl: "https://translate.google.com/",
    typoExamples: ["trasnlate", "tranlate", "translatee", "구글 번역 오타"],
    note: "번역을 급히 찾는 사용자는 translate의 n/s 전치와 마지막 e 중복을 자주 남깁니다.",
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    koreanName: "챗지피티",
    category: "AI assistants",
    region: "both",
    aliases: ["chatgpt", "chat", "gpt", "openai"],
    destinationUrl: "https://chatgpt.com/",
    typoExamples: ["chatgtp", "chatgptt", "chatgpt.com", "챗gpt 오타", "ㅊㅗ묘ㅎㅔㅅ"],
    note: "AI 도구는 브랜드명과 짧은 별칭이 섞여 검색되므로 chatgpt, gpt, openai 계열을 함께 묶습니다.",
  },
  {
    slug: "claude",
    name: "Claude",
    koreanName: "클로드",
    category: "AI assistants",
    region: "both",
    aliases: ["claude", "claud", "anthropic"],
    destinationUrl: "https://claude.ai/",
    typoExamples: ["cluade", "claude ai", "claude.ai", "츠며ㅇㄷ", "클로드 오타"],
    note: "claude는 u/a 순서 전치와 .ai까지 입력한 검색어를 함께 처리합니다.",
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    koreanName: "퍼플렉시티",
    category: "AI assistants",
    region: "both",
    aliases: ["perplexity", "perplex", "pplx"],
    destinationUrl: "https://www.perplexity.ai/",
    typoExamples: ["perplextiy", "perplexcity", "pplx ai", "퍼플렉시티 오타"],
    note: "긴 영문 서비스명은 순서 전치와 발음 기반 변형이 같이 발생합니다.",
  },
  {
    slug: "gemini",
    name: "Gemini",
    koreanName: "제미나이",
    category: "AI assistants",
    region: "both",
    aliases: ["gemini", "bard", "google gemini"],
    destinationUrl: "https://gemini.google.com/",
    typoExamples: ["gemni", "gemeni", "gemin", "제미나이 오타"],
    note: "gemini는 i/e 혼동과 이전 브랜드명 bard까지 함께 검색 의도를 보강합니다.",
  },
  {
    slug: "copilot",
    name: "Microsoft Copilot",
    koreanName: "코파일럿",
    category: "AI assistants",
    region: "both",
    aliases: ["copilot", "bing chat", "ms copilot"],
    destinationUrl: "https://copilot.microsoft.com/",
    typoExamples: ["copliot", "copilt", "copilot ai", "코파일럿 오타"],
    note: "copilot은 인접 글자 전치와 bing chat 잔여 검색어를 함께 포괄합니다.",
  },
  {
    slug: "notion",
    name: "Notion",
    koreanName: "노션",
    category: "Work & productivity",
    region: "both",
    aliases: ["notion", "notion calendar"],
    destinationUrl: "https://www.notion.so/",
    typoExamples: ["notino", "notoin", "nition", "노션 오타"],
    note: "업무 도구는 자동완성 전 엔터가 눌려 중간 글자가 빠지는 패턴이 많습니다.",
  },
  {
    slug: "slack",
    name: "Slack",
    koreanName: "슬랙",
    category: "Work & productivity",
    region: "both",
    aliases: ["slack", "slk"],
    destinationUrl: "https://slack.com/signin",
    typoExamples: ["salck", "slakc", "sclak", "ㄴㅣㅁ차"],
    note: "짧은 협업툴 이름은 인접키 전치와 한영 전환 실수가 바로 검색어가 됩니다.",
  },
  {
    slug: "discord",
    name: "Discord",
    koreanName: "디스코드",
    category: "Social & community",
    region: "both",
    aliases: ["discord", "disc", "dc"],
    destinationUrl: "https://discord.com/app",
    typoExamples: ["dicord", "disocrd", "discoed", "디스코드 오타"],
    note: "커뮤니티 앱은 짧은 별칭과 전체 서비스명 오타를 함께 잡아야 합니다.",
  },
  {
    slug: "github",
    name: "GitHub",
    koreanName: "깃허브",
    category: "Work & productivity",
    region: "both",
    aliases: ["github", "git", "gh"],
    destinationUrl: "https://github.com/",
    typoExamples: ["gihub", "githb", "gitub", "ㅎㅑ소ㅕㅠ"],
    note: "개발자는 github, git, gh를 주소창 명령처럼 쓰기 때문에 세 별칭을 함께 묶습니다.",
  },
  {
    slug: "figma",
    name: "Figma",
    koreanName: "피그마",
    category: "Work & productivity",
    region: "both",
    aliases: ["figma", "fig"],
    destinationUrl: "https://www.figma.com/files",
    typoExamples: ["fimga", "figam", "figna", "피그마 오타"],
    note: "디자인 도구는 figma의 m/g 순서 전치가 대표적인 입력 실수입니다.",
  },
  {
    slug: "canva",
    name: "Canva",
    koreanName: "캔바",
    category: "Work & productivity",
    region: "both",
    aliases: ["canva", "cnva"],
    destinationUrl: "https://www.canva.com/",
    typoExamples: ["cavna", "canv", "canba", "캔바 오타"],
    note: "짧은 브랜드명은 마지막 글자 누락과 v/b 혼동을 같이 고려합니다.",
  },
  {
    slug: "instagram",
    name: "Instagram",
    koreanName: "인스타그램",
    category: "Social & community",
    region: "both",
    aliases: ["instagram", "insta", "ig"],
    destinationUrl: "https://www.instagram.com/",
    typoExamples: ["instgram", "intsagram", "insta gram", "인스타 오타"],
    note: "instagram은 insta 별칭과 공백이 들어간 검색어가 같이 발생합니다.",
  },
  {
    slug: "x-twitter",
    name: "X / Twitter",
    koreanName: "엑스 트위터",
    category: "Social & community",
    region: "both",
    aliases: ["x", "twitter", "tweetdeck"],
    destinationUrl: "https://x.com/",
    typoExamples: ["twiter", "twtter", "twitter x", "트위터 오타"],
    note: "브랜드 전환 이후 x와 twitter 의도가 함께 남아 있어 두 이름을 모두 연결합니다.",
  },
  {
    slug: "facebook",
    name: "Facebook",
    koreanName: "페이스북",
    category: "Social & community",
    region: "both",
    aliases: ["facebook", "fb", "meta"],
    destinationUrl: "https://www.facebook.com/",
    typoExamples: ["facebok", "facbook", "faecbook", "페이스북 오타"],
    note: "긴 소셜 서비스명은 중간 모음 누락과 순서 전치가 주된 신호입니다.",
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    koreanName: "링크드인",
    category: "Social & community",
    region: "both",
    aliases: ["linkedin", "linked in"],
    destinationUrl: "https://www.linkedin.com/",
    typoExamples: ["linkdin", "linkedn", "linked in", "링크드인 오타"],
    note: "공백이 들어간 linked in 검색어도 같은 의도로 처리합니다.",
  },
  {
    slug: "reddit",
    name: "Reddit",
    koreanName: "레딧",
    category: "Social & community",
    region: "both",
    aliases: ["reddit", "r"],
    destinationUrl: "https://www.reddit.com/",
    typoExamples: ["redit", "reddt", "redditt", "레딧 오타"],
    note: "reddit은 d 중복/누락과 단일 r 별칭을 같이 봅니다.",
  },
  {
    slug: "wikipedia",
    name: "Wikipedia",
    koreanName: "위키백과",
    category: "Search & portals",
    region: "both",
    aliases: ["wikipedia", "wiki"],
    destinationUrl: "https://www.wikipedia.org/",
    typoExamples: ["wikipeda", "wikpedia", "wikipidia", "위키 오타"],
    note: "정보 검색 서비스는 wiki 별칭과 긴 원문 오타를 함께 잡습니다.",
  },
  {
    slug: "netflix",
    name: "Netflix",
    koreanName: "넷플릭스",
    category: "Video & music",
    region: "both",
    aliases: ["netflix", "nfx"],
    destinationUrl: "https://www.netflix.com/",
    typoExamples: ["netfix", "netlfix", "netfilx", "넷플릭스 오타"],
    note: "엔터테인먼트 서비스는 자동완성 전에 한 글자 빠지는 검색어가 많습니다.",
  },
  {
    slug: "spotify",
    name: "Spotify",
    koreanName: "스포티파이",
    category: "Video & music",
    region: "both",
    aliases: ["spotify", "spot"],
    destinationUrl: "https://open.spotify.com/",
    typoExamples: ["spotfy", "spofity", "spotif", "스포티파이 오타"],
    note: "spotify는 i 누락과 f/t 주변 전치가 대표적인 입력 실수입니다.",
  },
  {
    slug: "melon",
    name: "Melon",
    koreanName: "멜론",
    category: "Video & music",
    region: "korea",
    aliases: ["melon", "melon music"],
    destinationUrl: "https://www.melon.com/",
    typoExamples: ["mellon", "melom", "ㅡ디ㅐㅜ", "멜론 오타"],
    note: "국내 음악 서비스는 영문 브랜드와 한국어 브랜드 검색이 함께 발생합니다.",
  },
  {
    slug: "tving",
    name: "TVING",
    koreanName: "티빙",
    category: "Video & music",
    region: "korea",
    aliases: ["tving", "tvn"],
    destinationUrl: "https://www.tving.com/",
    typoExamples: ["tivng", "tvingg", "tvign", "티빙 오타"],
    note: "OTT 서비스는 짧은 영문명이라 순서 전치와 중복 입력을 같이 처리합니다.",
  },
  {
    slug: "coupang-play",
    name: "Coupang Play",
    koreanName: "쿠팡플레이",
    category: "Video & music",
    region: "korea",
    aliases: ["coupang play", "coupangplay"],
    destinationUrl: "https://www.coupangplay.com/",
    typoExamples: ["coupang ply", "coupang paly", "쿠팡플레이 오타"],
    note: "공백 유무가 섞이는 서비스명은 두 alias를 같은 의도로 묶습니다.",
  },
  {
    slug: "coupang",
    name: "Coupang",
    koreanName: "쿠팡",
    category: "Shopping & local",
    region: "korea",
    aliases: ["coupang", "cupang"],
    destinationUrl: "https://www.coupang.com/",
    typoExamples: ["couapng", "coupnag", "coupan", "쿠팡 오타"],
    note: "국내 쇼핑 서비스는 영문/발음 기반 오타가 함께 검색됩니다.",
  },
  {
    slug: "baemin",
    name: "Baemin",
    koreanName: "배달의민족",
    category: "Shopping & local",
    region: "korea",
    aliases: ["baemin", "배민"],
    destinationUrl: "https://www.baemin.com/",
    typoExamples: ["baemim", "baein", "배민 오타", "배달의민족 오타"],
    note: "한국 사용자는 영문 baemin과 한글 배민을 모두 주소창 검색처럼 사용합니다.",
  },
  {
    slug: "toss",
    name: "Toss",
    koreanName: "토스",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["toss", "tosspay"],
    destinationUrl: "https://toss.im/",
    typoExamples: ["toos", "tss", "tospay", "토스 오타"],
    note: "짧은 금융 서비스명은 한 글자 중복/누락이 핵심 오타입니다.",
  },
  {
    slug: "kakao",
    name: "Kakao",
    koreanName: "카카오",
    category: "Social & community",
    region: "korea",
    aliases: ["kakao", "kakaotalk", "katalk"],
    destinationUrl: "https://www.kakao.com/",
    typoExamples: ["kaka", "kakako", "kakaotlak", "카카오톡 오타"],
    note: "카카오와 카카오톡은 같은 생태계 의도로 묶어 사용자의 다음 행동을 안내합니다.",
  },
  {
    slug: "kakao-map",
    name: "Kakao Map",
    koreanName: "카카오맵",
    category: "Travel & maps",
    region: "korea",
    aliases: ["kakao map", "kakaomap", "daum map"],
    destinationUrl: "https://map.kakao.com/",
    typoExamples: ["kakao ma", "kakaompa", "카카오맵 오타"],
    note: "국내 지도 검색은 kakao map과 daum map의 잔여 브랜드 의도가 공존합니다.",
  },
  {
    slug: "naver-map",
    name: "Naver Map",
    koreanName: "네이버 지도",
    category: "Travel & maps",
    region: "korea",
    aliases: ["naver map", "navermap", "nmap"],
    destinationUrl: "https://map.naver.com/",
    typoExamples: ["naver ma", "naver mpa", "네이버지도 오타"],
    note: "지도 검색은 포털명과 map 별칭이 같이 입력되는 경우가 많습니다.",
  },
  {
    slug: "carrot",
    name: "Karrot / Danggeun",
    koreanName: "당근",
    category: "Shopping & local",
    region: "korea",
    aliases: ["karrot", "danggeun", "당근"],
    destinationUrl: "https://www.daangn.com/",
    typoExamples: ["karot", "danggun", "daangn", "당근마켓 오타"],
    note: "당근은 한국어 서비스명, 글로벌명 Karrot, daangn 도메인형 검색이 함께 발생합니다.",
  },
  {
    slug: "musinsa",
    name: "Musinsa",
    koreanName: "무신사",
    category: "Shopping & local",
    region: "korea",
    aliases: ["musinsa", "musinsa store"],
    destinationUrl: "https://www.musinsa.com/",
    typoExamples: ["musisna", "musinsa stroe", "무신사 오타"],
    note: "패션 커머스는 브랜드명과 store 조합 오타를 함께 노출합니다.",
  },
  {
    slug: "kurly",
    name: "Kurly",
    koreanName: "컬리",
    category: "Shopping & local",
    region: "korea",
    aliases: ["kurly", "market kurly"],
    destinationUrl: "https://www.kurly.com/",
    typoExamples: ["kuly", "kurley", "marketkurly", "컬리 오타"],
    note: "브랜드 변경 전후의 market kurly 검색어를 같은 의도로 다룹니다.",
  },
  {
    slug: "amazon",
    name: "Amazon",
    koreanName: "아마존",
    category: "Shopping & local",
    region: "global",
    aliases: ["amazon", "amzn"],
    destinationUrl: "https://www.amazon.com/",
    typoExamples: ["amazn", "amzon", "amzaon", "아마존 오타"],
    note: "글로벌 쇼핑 서비스는 짧은 주식 티커형 alias까지 검색어로 남습니다.",
  },
  {
    slug: "upbit",
    name: "Upbit",
    koreanName: "업비트",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["upbit", "up bit"],
    destinationUrl: "https://upbit.com/",
    typoExamples: ["ubpit", "upbt", "up bitt", "업비트 오타"],
    note: "거래소 서비스는 공백 유무와 인접키 전치가 함께 발생합니다.",
  },
  {
    slug: "bithumb",
    name: "Bithumb",
    koreanName: "빗썸",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["bithumb", "bit thumb"],
    destinationUrl: "https://www.bithumb.com/",
    typoExamples: ["bithum", "bithunb", "bitumb", "빗썸 오타"],
    note: "bithumb는 마지막 b 누락과 n/m 인접키 실수가 대표적입니다.",
  },
  {
    slug: "binance",
    name: "Binance",
    koreanName: "바이낸스",
    category: "Finance & crypto",
    region: "global",
    aliases: ["binance", "bnance"],
    destinationUrl: "https://www.binance.com/",
    typoExamples: ["binnace", "binace", "biance", "바이낸스 오타"],
    note: "글로벌 거래소는 긴 영문명 순서 전치와 한국어 발음 검색을 함께 잡습니다.",
  },
  {
    slug: "airbnb",
    name: "Airbnb",
    koreanName: "에어비앤비",
    category: "Travel & maps",
    region: "both",
    aliases: ["airbnb", "air bnb"],
    destinationUrl: "https://www.airbnb.com/",
    typoExamples: ["airbn", "airbb", "air bnb", "에어비앤비 오타"],
    note: "여행 서비스는 공백 삽입과 마지막 b 누락이 자주 보이는 패턴입니다.",
  },
  {
    slug: "booking",
    name: "Booking.com",
    koreanName: "부킹닷컴",
    category: "Travel & maps",
    region: "both",
    aliases: ["booking", "booking.com"],
    destinationUrl: "https://www.booking.com/",
    typoExamples: ["bookign", "bookin", "booing", "부킹 오타"],
    note: "booking은 k/i 주변 전치와 도메인 포함 검색어를 함께 처리합니다.",
  },
];

function createIntent(seed: ServiceSeed): TypoIntent {
  const generatedTypos = seed.aliases.flatMap(typoMutations);
  const allQueries = dedupe([
    seed.koreanName,
    `${seed.koreanName} 오타`,
    `${seed.name} 오타`,
    ...seed.aliases,
    ...generatedTypos,
    ...(seed.typoExamples ?? []),
  ]);
  const typoExamples = dedupe([...(seed.typoExamples ?? []), ...generatedTypos]).slice(
    0,
    18,
  );

  return {
    slug: seed.slug,
    queries: allQueries,
    intendedService: seed.name,
    intentLabel: `${seed.name}로 가려던 주소창 오타`,
    locale: "ko-KR",
    canonicalPath: `/oops/${seed.slug}`,
    indexingMode: "index",
    destinationUrl: seed.destinationUrl,
    explanation: seed.note,
    wink: seed.wink ?? "목적지는 바로 열어드리고, 잠깐 웃을 거리도 놓고 갈게요.",
    keywordCluster: allQueries.slice(0, 24),
    category: seed.category,
    region: seed.region,
    aliases: seed.aliases,
    typoExamples,
    audienceNote:
      seed.region === "global"
        ? "글로벌 사용자가 주소창에서 바로 입력할 가능성이 높은 서비스입니다."
        : seed.region === "korea"
          ? "한국 사용자의 한글/영문 혼합 검색 의도를 우선 반영했습니다."
          : "한국과 글로벌 사용자 모두에게 주소창 입력 의도가 뚜렷한 서비스입니다.",
  };
}

export const typoIntents: TypoIntent[] = serviceSeeds.map(createIntent);

export const delightItems: DelightItem[] = [
  {
    date: "2026-05-21",
    title: "오늘의 숨 고르기",
    caption:
      "한영키가 삐끗한 날에는 잠깐 느리게 가도 괜찮습니다.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Gentoo%20Penguin.%20(9867788974).jpg",
    imageAlt: "눈밭 위의 젠투 펭귄 사진",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Gentoo_Penguin._(9867788974).jpg",
    sourceLicense: "CC0 1.0 Public Domain Dedication",
    tags: ["cute", "calendar", "mood"],
  },
  {
    date: "2026-05-19",
    title: "오늘의 작은 웃음",
    caption:
      "주소창에 이상한 단어가 남아도 하루가 이상해질 필요는 없으니까요.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Cat%20Meme.jpg",
    imageAlt: "벤치 위 고양이 사진",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Cat_Meme.jpg",
    sourceLicense: "CC BY-SA 2.0",
    tags: ["cute", "cat", "oops"],
  },
  {
    date: "2026-05-16",
    title: "오늘의 평온",
    caption:
      "캘린더는 놓쳤지만, 웃는 표정은 제시간에 도착했습니다.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/022%20Wild%20smiling%20harbor%20seal%20at%20J%C3%B6kuls%C3%A1rl%C3%B3n%20(Iceland)%20Photo%20by%20Giles%20Laurent.jpg",
    imageAlt: "얼음 위에서 쉬는 웃는 듯한 바다표범 사진",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:022_Wild_smiling_harbor_seal_at_J%C3%B6kuls%C3%A1rl%C3%B3n_(Iceland)_Photo_by_Giles_Laurent.jpg",
    sourceLicense: "Creative Commons license, Wikimedia Commons",
    tags: ["seal", "smile", "calendar"],
  },
  {
    date: "2026-05-14",
    title: "오늘의 어리둥절",
    caption:
      "yoi를 검색한 순간의 표정을 아주 오래전 인터넷이 이미 알고 있었습니다.",
    image:
      "https://commons.wikimedia.org/wiki/Special:FilePath/Lolwut%20cat.jpg",
    imageAlt: "놀란 듯한 표정의 고양이 사진",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Lolwut_cat.jpg",
    sourceLicense: "Creative Commons license, Wikimedia Commons",
    tags: ["cute", "youtube", "cat"],
  },
];

export const serviceCategories: ServiceCategory[] = [
  "Search & portals",
  "AI assistants",
  "Work & productivity",
  "Video & music",
  "Social & community",
  "Shopping & local",
  "Finance & crypto",
  "Travel & maps",
];

export function getTodayDelight() {
  return delightItems[0];
}

export function getIntentBySlug(slug: string) {
  return typoIntents.find((intent) => intent.slug === slug);
}

export function getIndexedIntents() {
  return typoIntents.filter((intent) => intent.indexingMode === "index");
}

export function getIntentsByCategory(category: ServiceCategory) {
  return typoIntents.filter((intent) => intent.category === category);
}

export function getFeaturedIntents() {
  return typoIntents.filter((intent) =>
    ["chmi", "youtube-typo", "chatgpt", "claude", "naver", "coupang"].includes(
      intent.slug,
    ),
  );
}

export function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}
