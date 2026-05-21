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
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://otar.site");

export const siteConfig = {
  name: "otar.site",
  domain: new URL(siteUrl).hostname,
  url: siteUrl,
  description:
    "주소창에 ㅊ미, yoi, chatgtp처럼 잘못 입력한 사람을 위한 작은 오타 쉼터. 귀여운 사진 하나 보고 원래 목적지로 바로 돌아가세요.",
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

const qwertyNeighbors: Record<string, string[]> = {
  q: ["w", "a"],
  w: ["q", "e", "s"],
  e: ["w", "r", "d"],
  r: ["e", "t", "f"],
  t: ["r", "y", "g"],
  y: ["t", "u", "h"],
  u: ["y", "i", "j"],
  i: ["u", "o", "k"],
  o: ["i", "p", "l"],
  p: ["o"],
  a: ["q", "s", "z"],
  s: ["a", "w", "d", "x"],
  d: ["s", "e", "f", "c"],
  f: ["d", "r", "g", "v"],
  g: ["f", "t", "h", "b"],
  h: ["g", "y", "j", "n"],
  j: ["h", "u", "k", "m"],
  k: ["j", "i", "l"],
  l: ["k", "o"],
  z: ["a", "x"],
  x: ["z", "s", "c"],
  c: ["x", "d", "v"],
  v: ["c", "f", "b"],
  b: ["v", "g", "n"],
  n: ["b", "h", "m"],
  m: ["n", "j"],
};

const intentSearchModifiers = [
  "잘못침",
  "잘못 침",
  "잘못 쳤을때",
  "한영",
  "한영키",
  "검색어",
  "바로가기",
  "로그인",
  "login",
  "app",
];

function isMostlyAscii(input: string) {
  return /^[\x00-\x7F]+$/.test(input);
}

function toHangulKeyboard(input: string) {
  return input
    .toLowerCase()
    .split("")
    .map((letter) => dubeolsikMap[letter] ?? letter)
    .join("");
}

function dedupe(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}

function isDiagnosticQuery(value: string) {
  return value.includes("오타");
}

function aliasForms(alias: string) {
  const normalized = alias.toLowerCase().trim();
  const compact = normalized.replace(/[\s._-]+/g, "");
  const spaced = normalized.replace(/[._-]+/g, " ");
  const dotted = normalized.replace(/\s+/g, ".");
  const hyphenated = normalized.replace(/\s+/g, "-");
  const withoutPlus = normalized.replace(/\+/g, " plus");

  return dedupe([
    normalized,
    compact,
    spaced,
    dotted,
    hyphenated,
    withoutPlus,
    normalized.endsWith(".com") ? normalized.replace(/\.com$/, "") : "",
    normalized.includes(".") ? normalized.replace(/\./g, " ") : "",
  ]);
}

function adjacentTypos(input: string) {
  if (!isMostlyAscii(input)) {
    return [];
  }

  const normalized = input.toLowerCase();
  const typos: string[] = [];

  for (let index = 0; index < normalized.length; index += 1) {
    const letter = normalized[index];
    const neighbors = qwertyNeighbors[letter] ?? [];

    for (const neighbor of neighbors.slice(0, 2)) {
      typos.push(`${normalized.slice(0, index)}${neighbor}${normalized.slice(index + 1)}`);
    }
  }

  return typos;
}

function deletionTypos(input: string) {
  if (input.length < 4) {
    return [];
  }

  return input
    .split("")
    .map((_, index) => `${input.slice(0, index)}${input.slice(index + 1)}`)
    .filter((value) => value.length >= 2);
}

function transpositionTypos(input: string) {
  if (input.length < 4) {
    return [];
  }

  return input
    .split("")
    .flatMap((_, index) => {
      if (index >= input.length - 1) {
        return [];
      }

      return `${input.slice(0, index)}${input[index + 1]}${input[index]}${input.slice(index + 2)}`;
    });
}

function duplicationTypos(input: string) {
  if (input.length < 3) {
    return [];
  }

  return input
    .split("")
    .map((letter, index) => `${input.slice(0, index)}${letter}${input.slice(index)}`)
    .filter((value) => value.length <= 24);
}

function vowelDropTypos(input: string) {
  if (!isMostlyAscii(input) || input.length < 5) {
    return [];
  }

  return ["a", "e", "i", "o", "u"].map((vowel) => input.replace(vowel, ""));
}

function typoMutations(alias: string) {
  const forms = aliasForms(alias);
  const mutations = forms.flatMap((form) => {
    const compact = form.replace(/\s+/g, "");

    return [
      toHangulKeyboard(form),
      form.length > 3 ? form.slice(0, -1) : "",
      form.length > 3 ? `${form}.com` : "",
      form.length > 3 ? `${form} com` : "",
      ...deletionTypos(compact),
      ...transpositionTypos(compact),
      ...duplicationTypos(compact),
      ...adjacentTypos(compact),
      ...vowelDropTypos(compact),
    ];
  });

  return dedupe(mutations).filter((value) => !forms.includes(value));
}

function intentQueryPhrases(seed: ServiceSeed, baseQueries: string[]) {
  const headTerms = dedupe([
    seed.koreanName,
    seed.name,
    ...seed.aliases,
    ...(seed.typoExamples ?? []),
    ...baseQueries.slice(0, 18),
  ]);

  return headTerms.flatMap((term) =>
    intentSearchModifiers.map((modifier) => `${term} ${modifier}`),
  );
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
  {
    slug: "bing",
    name: "Bing",
    koreanName: "빙",
    category: "Search & portals",
    region: "both",
    aliases: ["bing", "bing search", "microsoft bing"],
    destinationUrl: "https://www.bing.com/",
    typoExamples: ["bign", "binh", "ㅠㅑㅜㅎ", "빙 오타"],
    note: "검색 엔진은 짧은 주소창 명령처럼 입력되므로 bing과 microsoft bing 계열을 함께 묶습니다.",
  },
  {
    slug: "yahoo",
    name: "Yahoo",
    koreanName: "야후",
    category: "Search & portals",
    region: "global",
    aliases: ["yahoo", "yahoo mail", "ymail"],
    destinationUrl: "https://www.yahoo.com/",
    typoExamples: ["yaho", "yahho", "yhaoo", "야후 오타"],
    note: "포털과 메일 의도가 섞이는 yahoo는 누락, 중복, 전치 오타를 같이 잡습니다.",
  },
  {
    slug: "duckduckgo",
    name: "DuckDuckGo",
    koreanName: "덕덕고",
    category: "Search & portals",
    region: "global",
    aliases: ["duckduckgo", "ddg", "duck duck go"],
    destinationUrl: "https://duckduckgo.com/",
    typoExamples: ["duckdukgo", "ducduckgo", "duck duckgo", "덕덕고 오타"],
    note: "긴 검색 엔진 이름은 반복 단어 누락과 ddg 약칭 검색이 함께 발생합니다.",
  },
  {
    slug: "baidu",
    name: "Baidu",
    koreanName: "바이두",
    category: "Search & portals",
    region: "global",
    aliases: ["baidu", "baidu.com"],
    destinationUrl: "https://www.baidu.com/",
    typoExamples: ["baid", "badiu", "baidu search", "바이두 오타"],
    note: "중국권 검색 의도는 baidu와 도메인형 검색어를 함께 연결합니다.",
  },
  {
    slug: "yandex",
    name: "Yandex",
    koreanName: "얀덱스",
    category: "Search & portals",
    region: "global",
    aliases: ["yandex", "yandex search"],
    destinationUrl: "https://yandex.com/",
    typoExamples: ["yandx", "yndex", "yandxe", "얀덱스 오타"],
    note: "글로벌 검색 엔진 후보로 yandex의 모음 누락과 글자 전치를 반영합니다.",
  },
  {
    slug: "google-sheets",
    name: "Google Sheets",
    koreanName: "구글 스프레드시트",
    category: "Work & productivity",
    region: "both",
    aliases: ["sheets", "sheet", "google sheets"],
    destinationUrl: "https://docs.google.com/spreadsheets/u/0/",
    typoExamples: ["shets", "sheetsz", "구글 시트 오타", "ㄴㅗㄷㄷㅅㄴ"],
    note: "업무용 주소창 단축 입력에서 sheets와 sheet는 매우 직접적인 의도를 가집니다.",
  },
  {
    slug: "google-slides",
    name: "Google Slides",
    koreanName: "구글 슬라이드",
    category: "Work & productivity",
    region: "both",
    aliases: ["slides", "slide", "google slides"],
    destinationUrl: "https://docs.google.com/presentation/u/0/",
    typoExamples: ["sldies", "slids", "slides google", "구글 슬라이드 오타"],
    note: "프레젠테이션 도구는 slides와 google slides 검색 의도가 함께 남습니다.",
  },
  {
    slug: "google-meet",
    name: "Google Meet",
    koreanName: "구글 미트",
    category: "Work & productivity",
    region: "both",
    aliases: ["meet", "gmeet", "google meet"],
    destinationUrl: "https://meet.google.com/",
    typoExamples: ["met", "meett", "meat", "구글 미트 오타"],
    note: "회의 직전 주소창 입력은 짧고 급해서 meet의 누락과 중복 오타가 잘 생깁니다.",
  },
  {
    slug: "google-photos",
    name: "Google Photos",
    koreanName: "구글 포토",
    category: "Work & productivity",
    region: "both",
    aliases: ["photos", "photo", "google photos"],
    destinationUrl: "https://photos.google.com/",
    typoExamples: ["phtos", "photots", "google photo", "구글 포토 오타"],
    note: "사진 서비스는 photos/photo 단수복수 검색어가 섞여 들어옵니다.",
  },
  {
    slug: "google-keep",
    name: "Google Keep",
    koreanName: "구글 킵",
    category: "Work & productivity",
    region: "both",
    aliases: ["keep", "gkeep", "google keep"],
    destinationUrl: "https://keep.google.com/",
    typoExamples: ["kep", "keeep", "kepp", "구글 킵 오타"],
    note: "메모 서비스는 짧은 keep 입력에서 e 중복과 마지막 글자 누락이 잦습니다.",
  },
  {
    slug: "google-forms",
    name: "Google Forms",
    koreanName: "구글 설문지",
    category: "Work & productivity",
    region: "both",
    aliases: ["forms", "form", "google forms"],
    destinationUrl: "https://docs.google.com/forms/u/0/",
    typoExamples: ["froms", "fomrs", "google form", "구글폼 오타"],
    note: "forms는 form과 froms 오타가 자연스럽게 섞이는 생산성 검색어입니다.",
  },
  {
    slug: "outlook",
    name: "Outlook",
    koreanName: "아웃룩",
    category: "Work & productivity",
    region: "both",
    aliases: ["outlook", "hotmail", "outlook mail"],
    destinationUrl: "https://outlook.live.com/mail/",
    typoExamples: ["outlok", "outllok", "outlookk", "아웃룩 오타"],
    note: "메일 서비스는 outlook과 hotmail 잔여 의도를 함께 다루는 편이 좋습니다.",
  },
  {
    slug: "microsoft-teams",
    name: "Microsoft Teams",
    koreanName: "마이크로소프트 팀즈",
    category: "Work & productivity",
    region: "both",
    aliases: ["teams", "ms teams", "microsoft teams"],
    destinationUrl: "https://teams.microsoft.com/",
    typoExamples: ["tems", "teamss", "ma teams", "팀즈 오타"],
    note: "업무 회의 도구는 teams, ms teams, microsoft teams가 같은 주소창 의도로 묶입니다.",
  },
  {
    slug: "onedrive",
    name: "OneDrive",
    koreanName: "원드라이브",
    category: "Work & productivity",
    region: "both",
    aliases: ["onedrive", "one drive", "ms drive"],
    destinationUrl: "https://onedrive.live.com/",
    typoExamples: ["onedrvie", "onedriv", "one drvie", "원드라이브 오타"],
    note: "클라우드 파일 서비스는 공백 유무와 drive 전치 오타가 함께 발생합니다.",
  },
  {
    slug: "office365",
    name: "Microsoft 365",
    koreanName: "마이크로소프트 365",
    category: "Work & productivity",
    region: "both",
    aliases: ["office", "office365", "microsoft 365"],
    destinationUrl: "https://www.office.com/",
    typoExamples: ["ofice", "offcie", "office 365", "오피스365 오타"],
    note: "office와 365 조합은 주소창에서 포털처럼 직접 입력되는 업무용 검색어입니다.",
  },
  {
    slug: "zoom",
    name: "Zoom",
    koreanName: "줌",
    category: "Work & productivity",
    region: "both",
    aliases: ["zoom", "zoom meeting", "zoom us"],
    destinationUrl: "https://zoom.us/",
    typoExamples: ["zoon", "zom", "zoom.us", "줌 오타"],
    note: "회의 링크를 찾는 사용자는 zoom과 zoom.us를 바로 주소창에 입력합니다.",
  },
  {
    slug: "dropbox",
    name: "Dropbox",
    koreanName: "드롭박스",
    category: "Work & productivity",
    region: "both",
    aliases: ["dropbox", "dbx"],
    destinationUrl: "https://www.dropbox.com/",
    typoExamples: ["dropox", "dropbx", "dorpbox", "드롭박스 오타"],
    note: "파일 공유 서비스는 dropbox의 b/o 누락과 dbx 약칭을 함께 잡습니다.",
  },
  {
    slug: "trello",
    name: "Trello",
    koreanName: "트렐로",
    category: "Work & productivity",
    region: "both",
    aliases: ["trello", "trelo"],
    destinationUrl: "https://trello.com/",
    typoExamples: ["trello board", "terllo", "trello.com", "트렐로 오타"],
    note: "프로젝트 보드 도구는 서비스명과 board 조합이 함께 검색됩니다.",
  },
  {
    slug: "asana",
    name: "Asana",
    koreanName: "아사나",
    category: "Work & productivity",
    region: "both",
    aliases: ["asana", "asana app"],
    destinationUrl: "https://app.asana.com/",
    typoExamples: ["asna", "asaana", "asana login", "아사나 오타"],
    note: "업무 도구는 app/login 조합과 단순 철자 누락을 같이 처리합니다.",
  },
  {
    slug: "jira",
    name: "Jira",
    koreanName: "지라",
    category: "Work & productivity",
    region: "both",
    aliases: ["jira", "atlassian jira"],
    destinationUrl: "https://www.atlassian.com/software/jira",
    typoExamples: ["jria", "jirra", "jira login", "지라 오타"],
    note: "개발 업무 도구는 jira와 atlassian 조합 검색이 함께 남습니다.",
  },
  {
    slug: "linear",
    name: "Linear",
    koreanName: "리니어",
    category: "Work & productivity",
    region: "both",
    aliases: ["linear", "linear app"],
    destinationUrl: "https://linear.app/",
    typoExamples: ["liner", "linea", "linear login", "리니어 오타"],
    note: "스타트업 업무 도구는 app/login과 브랜드명 누락 오타를 함께 봅니다.",
  },
  {
    slug: "miro",
    name: "Miro",
    koreanName: "미로",
    category: "Work & productivity",
    region: "both",
    aliases: ["miro", "miro board"],
    destinationUrl: "https://miro.com/app/",
    typoExamples: ["mior", "mirro", "miro app", "미로 오타"],
    note: "화이트보드 서비스는 board/app 조합이 주소창 입력으로 자주 남습니다.",
  },
  {
    slug: "stack-overflow",
    name: "Stack Overflow",
    koreanName: "스택 오버플로",
    category: "Work & productivity",
    region: "global",
    aliases: ["stackoverflow", "stack overflow", "stack"],
    destinationUrl: "https://stackoverflow.com/",
    typoExamples: ["stackoverlow", "stack overfloww", "stak overflow", "스택오버플로 오타"],
    note: "개발자는 stack, stack overflow, stackoverflow를 검색 명령처럼 사용합니다.",
  },
  {
    slug: "vercel",
    name: "Vercel",
    koreanName: "버셀",
    category: "Work & productivity",
    region: "global",
    aliases: ["vercel", "vercel dashboard"],
    destinationUrl: "https://vercel.com/dashboard",
    typoExamples: ["vercl", "vercel login", "vercle", "버셀 오타"],
    note: "배포 대시보드는 dashboard/login 조합 검색어까지 함께 묶는 편이 좋습니다.",
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    koreanName: "클라우드플레어",
    category: "Work & productivity",
    region: "global",
    aliases: ["cloudflare", "cf dashboard"],
    destinationUrl: "https://dash.cloudflare.com/",
    typoExamples: ["cloudfare", "cloudfalre", "cloudflare login", "클라우드플레어 오타"],
    note: "인프라 서비스는 dashboard/login과 긴 브랜드명 전치 오타가 같이 발생합니다.",
  },
  {
    slug: "aws",
    name: "AWS",
    koreanName: "아마존 웹 서비스",
    category: "Work & productivity",
    region: "global",
    aliases: ["aws", "aws console", "amazon aws"],
    destinationUrl: "https://aws.amazon.com/console/",
    typoExamples: ["aws login", "aws consle", "awsconsole", "아마존 aws 오타"],
    note: "클라우드 콘솔은 aws console을 주소창 명령으로 쓰는 사용자가 많습니다.",
  },
  {
    slug: "azure",
    name: "Microsoft Azure",
    koreanName: "애저",
    category: "Work & productivity",
    region: "global",
    aliases: ["azure", "azure portal", "ms azure"],
    destinationUrl: "https://portal.azure.com/",
    typoExamples: ["azuer", "azur", "azure protal", "애저 오타"],
    note: "클라우드 포털은 azure portal과 ms azure 의도를 함께 처리합니다.",
  },
  {
    slug: "npm",
    name: "npm",
    koreanName: "npm",
    category: "Work & productivity",
    region: "global",
    aliases: ["npm", "npmjs", "npm package"],
    destinationUrl: "https://www.npmjs.com/",
    typoExamples: ["npn", "mpm", "npm js", "npm 오타"],
    note: "개발 패키지 검색은 짧은 npm 입력과 npmjs 도메인형 검색이 섞입니다.",
  },
  {
    slug: "docker",
    name: "Docker",
    koreanName: "도커",
    category: "Work & productivity",
    region: "global",
    aliases: ["docker", "docker hub"],
    destinationUrl: "https://hub.docker.com/",
    typoExamples: ["dockr", "docer", "dockerhub", "도커 오타"],
    note: "컨테이너 이미지를 찾는 사용자는 docker와 docker hub를 함께 입력합니다.",
  },
  {
    slug: "huggingface",
    name: "Hugging Face",
    koreanName: "허깅페이스",
    category: "AI assistants",
    region: "global",
    aliases: ["huggingface", "hugging face", "hf"],
    destinationUrl: "https://huggingface.co/",
    typoExamples: ["hugingface", "huggingfase", "hugging face ai", "허깅페이스 오타"],
    note: "AI 모델 허브는 공백 유무와 hf 약칭까지 주소창 검색 의도가 선명합니다.",
  },
  {
    slug: "grok",
    name: "Grok",
    koreanName: "그록",
    category: "AI assistants",
    region: "global",
    aliases: ["grok", "grok ai", "xai"],
    destinationUrl: "https://grok.com/",
    typoExamples: ["gork", "grok ai login", "x ai", "그록 오타"],
    note: "AI 서비스는 grok, grok ai, xai처럼 브랜드와 회사명이 함께 검색됩니다.",
  },
  {
    slug: "deepseek",
    name: "DeepSeek",
    koreanName: "딥시크",
    category: "AI assistants",
    region: "global",
    aliases: ["deepseek", "deep seek", "deepseek ai"],
    destinationUrl: "https://chat.deepseek.com/",
    typoExamples: ["deepssek", "deepseak", "deep seek ai", "딥시크 오타"],
    note: "AI 챗 서비스는 공백 유무와 seek 철자 변형이 같이 발생합니다.",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    koreanName: "미드저니",
    category: "AI assistants",
    region: "global",
    aliases: ["midjourney", "mid journey", "mj"],
    destinationUrl: "https://www.midjourney.com/",
    typoExamples: ["midjounrey", "midjourny", "mid journey ai", "미드저니 오타"],
    note: "이미지 AI 서비스는 긴 철자 전치와 mj 약칭을 함께 처리합니다.",
  },
  {
    slug: "poe",
    name: "Poe",
    koreanName: "포",
    category: "AI assistants",
    region: "global",
    aliases: ["poe", "poe ai", "quora poe"],
    destinationUrl: "https://poe.com/",
    typoExamples: ["poe ai chat", "poee", "peo", "poe 오타"],
    note: "짧은 AI 서비스명은 ai/chat 조합을 붙여야 검색 의도가 뚜렷해집니다.",
  },
  {
    slug: "character-ai",
    name: "Character.AI",
    koreanName: "캐릭터 AI",
    category: "AI assistants",
    region: "global",
    aliases: ["character ai", "character.ai", "c.ai"],
    destinationUrl: "https://character.ai/",
    typoExamples: ["charcter ai", "characterai", "c ai", "캐릭터 ai 오타"],
    note: "AI 캐릭터 서비스는 도메인형, 공백형, 약칭형 검색이 함께 나타납니다.",
  },
  {
    slug: "tiktok",
    name: "TikTok",
    koreanName: "틱톡",
    category: "Social & community",
    region: "both",
    aliases: ["tiktok", "tik tok", "tt"],
    destinationUrl: "https://www.tiktok.com/",
    typoExamples: ["tiktock", "tikok", "tik tok", "틱톡 오타"],
    note: "숏폼 서비스는 공백 유무와 k/c 혼동 오타가 대표적입니다.",
  },
  {
    slug: "threads",
    name: "Threads",
    koreanName: "스레드",
    category: "Social & community",
    region: "both",
    aliases: ["threads", "thread", "meta threads"],
    destinationUrl: "https://www.threads.net/",
    typoExamples: ["threds", "therads", "threads app", "스레드 오타"],
    note: "소셜 서비스는 thread 단수와 threads 앱 검색이 함께 발생합니다.",
  },
  {
    slug: "whatsapp",
    name: "WhatsApp",
    koreanName: "왓츠앱",
    category: "Social & community",
    region: "global",
    aliases: ["whatsapp", "whats app", "wa"],
    destinationUrl: "https://www.whatsapp.com/",
    typoExamples: ["whatsap", "whatapp", "whats app", "왓츠앱 오타"],
    note: "메신저는 whatsapp과 whats app 공백형 검색을 같이 잡아야 합니다.",
  },
  {
    slug: "telegram",
    name: "Telegram",
    koreanName: "텔레그램",
    category: "Social & community",
    region: "both",
    aliases: ["telegram", "telegram web", "tg"],
    destinationUrl: "https://web.telegram.org/",
    typoExamples: ["telegrm", "telgram", "telegramm", "텔레그램 오타"],
    note: "웹 메신저는 telegram web과 짧은 tg 약칭 검색이 섞입니다.",
  },
  {
    slug: "line",
    name: "LINE",
    koreanName: "라인",
    category: "Social & community",
    region: "both",
    aliases: ["line", "line messenger", "line app"],
    destinationUrl: "https://line.me/",
    typoExamples: ["lien", "linee", "line web", "라인 오타"],
    note: "아시아권 메신저는 line app, line web, 서비스명 전치 오타를 함께 봅니다.",
  },
  {
    slug: "pinterest",
    name: "Pinterest",
    koreanName: "핀터레스트",
    category: "Social & community",
    region: "both",
    aliases: ["pinterest", "pin", "pins"],
    destinationUrl: "https://www.pinterest.com/",
    typoExamples: ["pintrest", "pinerest", "pinterestt", "핀터레스트 오타"],
    note: "이미지 탐색 서비스는 pinterest의 e 누락과 pin 약칭 검색이 자연스럽습니다.",
  },
  {
    slug: "snapchat",
    name: "Snapchat",
    koreanName: "스냅챗",
    category: "Social & community",
    region: "global",
    aliases: ["snapchat", "snap"],
    destinationUrl: "https://www.snapchat.com/",
    typoExamples: ["snapcht", "snachat", "snap chat", "스냅챗 오타"],
    note: "소셜 앱은 snap 약칭과 snap chat 공백형 검색을 함께 처리합니다.",
  },
  {
    slug: "twitch",
    name: "Twitch",
    koreanName: "트위치",
    category: "Video & music",
    region: "global",
    aliases: ["twitch", "twitch tv"],
    destinationUrl: "https://www.twitch.tv/",
    typoExamples: ["twicth", "twich", "twitchtv", "트위치 오타"],
    note: "라이브 스트리밍 서비스는 twitch tv와 도메인형 검색어가 함께 남습니다.",
  },
  {
    slug: "soop",
    name: "SOOP",
    koreanName: "숲",
    category: "Video & music",
    region: "korea",
    aliases: ["soop", "afreecatv", "afreeca"],
    destinationUrl: "https://www.sooplive.co.kr/",
    typoExamples: ["sop", "sooop", "afreeca tv", "숲 오타"],
    note: "국내 라이브 플랫폼은 브랜드 변경 전후의 SOOP, AfreecaTV 의도를 함께 묶습니다.",
  },
  {
    slug: "chzzk",
    name: "CHZZK",
    koreanName: "치지직",
    category: "Video & music",
    region: "korea",
    aliases: ["chzzk", "chzzk naver", "치지직"],
    destinationUrl: "https://chzzk.naver.com/",
    typoExamples: ["chzk", "chzz", "chzzk live", "치지직 오타"],
    note: "국내 라이브 서비스는 영문명 chzzk와 한글 치지직 검색이 함께 발생합니다.",
  },
  {
    slug: "naver-blog",
    name: "Naver Blog",
    koreanName: "네이버 블로그",
    category: "Social & community",
    region: "korea",
    aliases: ["naver blog", "blog naver", "블로그"],
    destinationUrl: "https://blog.naver.com/",
    typoExamples: ["naver blo", "naver blgo", "네이버블로그 오타"],
    note: "국내 콘텐츠 검색은 네이버 블로그와 blog naver 순서 변형이 함께 남습니다.",
  },
  {
    slug: "naver-cafe",
    name: "Naver Cafe",
    koreanName: "네이버 카페",
    category: "Social & community",
    region: "korea",
    aliases: ["naver cafe", "cafe naver", "카페"],
    destinationUrl: "https://section.cafe.naver.com/",
    typoExamples: ["naver caf", "naver cfae", "네이버카페 오타"],
    note: "커뮤니티 검색은 cafe와 naver cafe 조합을 함께 다루면 좋습니다.",
  },
  {
    slug: "naver-band",
    name: "Naver Band",
    koreanName: "네이버 밴드",
    category: "Social & community",
    region: "korea",
    aliases: ["band", "naver band", "밴드"],
    destinationUrl: "https://band.us/",
    typoExamples: ["bnad", "ban", "band us", "네이버밴드 오타"],
    note: "밴드는 한국 중장년층 커뮤니티 사용성이 강해 한글/영문 의도를 함께 잡습니다.",
  },
  {
    slug: "naver-webtoon",
    name: "Naver Webtoon",
    koreanName: "네이버 웹툰",
    category: "Video & music",
    region: "korea",
    aliases: ["webtoon", "naver webtoon", "웹툰"],
    destinationUrl: "https://comic.naver.com/",
    typoExamples: ["webton", "webtoon naver", "네이버웹툰 오타"],
    note: "웹툰 서비스는 webtoon 단독 검색과 네이버 조합 검색이 모두 큽니다.",
  },
  {
    slug: "namuwiki",
    name: "Namuwiki",
    koreanName: "나무위키",
    category: "Search & portals",
    region: "korea",
    aliases: ["namuwiki", "namu wiki", "나무위키"],
    destinationUrl: "https://namu.wiki/",
    typoExamples: ["namuwki", "namuwik", "namu.wiki", "나무위키 오타"],
    note: "국내 정보 검색에서 나무위키는 주소창 직접 입력 의도가 매우 강한 서비스입니다.",
  },
  {
    slug: "dcinside",
    name: "DCInside",
    koreanName: "디시인사이드",
    category: "Social & community",
    region: "korea",
    aliases: ["dcinside", "dc", "디시"],
    destinationUrl: "https://www.dcinside.com/",
    typoExamples: ["dcinsde", "dcinsidee", "디시 오타"],
    note: "국내 커뮤니티는 영문 도메인명과 짧은 dc 별칭이 함께 쓰입니다.",
  },
  {
    slug: "theqoo",
    name: "Theqoo",
    koreanName: "더쿠",
    category: "Social & community",
    region: "korea",
    aliases: ["theqoo", "the qoo", "더쿠"],
    destinationUrl: "https://theqoo.net/",
    typoExamples: ["theqo", "theqoo net", "더쿠 오타"],
    note: "국내 커뮤니티는 한글 서비스명과 도메인형 영문 검색이 함께 나타납니다.",
  },
  {
    slug: "gmarket",
    name: "Gmarket",
    koreanName: "지마켓",
    category: "Shopping & local",
    region: "korea",
    aliases: ["gmarket", "g market", "지마켓"],
    destinationUrl: "https://www.gmarket.co.kr/",
    typoExamples: ["gmakret", "gmarke", "g market", "지마켓 오타"],
    note: "오픈마켓은 공백 유무와 market 전치 오타가 같이 발생합니다.",
  },
  {
    slug: "auction",
    name: "Auction",
    koreanName: "옥션",
    category: "Shopping & local",
    region: "korea",
    aliases: ["auction", "옥션"],
    destinationUrl: "https://www.auction.co.kr/",
    typoExamples: ["aucton", "acution", "auction korea", "옥션 오타"],
    note: "국내 쇼핑 서비스는 영문명과 한글 브랜드 검색을 같이 잡아야 합니다.",
  },
  {
    slug: "11st",
    name: "11st",
    koreanName: "11번가",
    category: "Shopping & local",
    region: "korea",
    aliases: ["11st", "11 street", "11번가"],
    destinationUrl: "https://www.11st.co.kr/",
    typoExamples: ["11stt", "11 street", "11번가 오타"],
    note: "숫자 브랜드는 11st, 11 street, 한글 11번가가 같은 의도로 묶입니다.",
  },
  {
    slug: "ssg",
    name: "SSG",
    koreanName: "쓱",
    category: "Shopping & local",
    region: "korea",
    aliases: ["ssg", "ssg.com", "쓱"],
    destinationUrl: "https://www.ssg.com/",
    typoExamples: ["sgg", "ssg com", "쓱 오타"],
    note: "짧은 쇼핑 브랜드는 도메인 포함 검색과 한글 별칭을 함께 처리합니다.",
  },
  {
    slug: "lotteon",
    name: "LotteON",
    koreanName: "롯데온",
    category: "Shopping & local",
    region: "korea",
    aliases: ["lotteon", "lotte on", "롯데온"],
    destinationUrl: "https://www.lotteon.com/",
    typoExamples: ["loteon", "lotte onn", "lotte on", "롯데온 오타"],
    note: "공백 유무가 있는 쇼핑 서비스명은 두 형태를 같은 랜딩 의도로 봅니다.",
  },
  {
    slug: "oliveyoung",
    name: "Olive Young",
    koreanName: "올리브영",
    category: "Shopping & local",
    region: "korea",
    aliases: ["oliveyoung", "olive young", "올리브영"],
    destinationUrl: "https://www.oliveyoung.co.kr/",
    typoExamples: ["oliveyong", "olive youn", "olive young", "올리브영 오타"],
    note: "뷰티 쇼핑 서비스는 공백형과 붙여쓴 영문형 검색이 함께 발생합니다.",
  },
  {
    slug: "zigzag",
    name: "Zigzag",
    koreanName: "지그재그",
    category: "Shopping & local",
    region: "korea",
    aliases: ["zigzag", "zig zag", "지그재그"],
    destinationUrl: "https://zigzag.kr/",
    typoExamples: ["zigzga", "zigag", "zig zag", "지그재그 오타"],
    note: "반복형 브랜드는 중간 글자 누락과 공백 삽입 오타가 자연스럽습니다.",
  },
  {
    slug: "ably",
    name: "Ably",
    koreanName: "에이블리",
    category: "Shopping & local",
    region: "korea",
    aliases: ["ably", "a-bly", "에이블리"],
    destinationUrl: "https://m.a-bly.com/",
    typoExamples: ["abliy", "ablyy", "a bly", "에이블리 오타"],
    note: "패션 앱은 앱 이름과 도메인형 a-bly 검색어가 함께 남습니다.",
  },
  {
    slug: "aliexpress",
    name: "AliExpress",
    koreanName: "알리익스프레스",
    category: "Shopping & local",
    region: "both",
    aliases: ["aliexpress", "ali express", "ali"],
    destinationUrl: "https://www.aliexpress.com/",
    typoExamples: ["aliexpres", "alixpress", "ali express", "알리 오타"],
    note: "글로벌 쇼핑 서비스는 ali 약칭과 공백형 브랜드 검색이 함께 발생합니다.",
  },
  {
    slug: "temu",
    name: "Temu",
    koreanName: "테무",
    category: "Shopping & local",
    region: "both",
    aliases: ["temu", "temu shopping"],
    destinationUrl: "https://www.temu.com/",
    typoExamples: ["teum", "temuu", "temu app", "테무 오타"],
    note: "짧은 쇼핑 앱 이름은 인접 글자 전치와 app 조합 검색이 함께 생깁니다.",
  },
  {
    slug: "ebay",
    name: "eBay",
    koreanName: "이베이",
    category: "Shopping & local",
    region: "global",
    aliases: ["ebay", "e bay"],
    destinationUrl: "https://www.ebay.com/",
    typoExamples: ["ebya", "ebayy", "e bay", "이베이 오타"],
    note: "글로벌 마켓플레이스는 붙여쓰기와 공백형 검색 모두를 포괄합니다.",
  },
  {
    slug: "walmart",
    name: "Walmart",
    koreanName: "월마트",
    category: "Shopping & local",
    region: "global",
    aliases: ["walmart", "wal mart"],
    destinationUrl: "https://www.walmart.com/",
    typoExamples: ["wallmart", "walamrt", "wal mart", "월마트 오타"],
    note: "대형 리테일 서비스는 l 중복과 공백형 브랜드 검색이 함께 발생합니다.",
  },
  {
    slug: "shein",
    name: "SHEIN",
    koreanName: "쉬인",
    category: "Shopping & local",
    region: "both",
    aliases: ["shein", "shein korea"],
    destinationUrl: "https://www.shein.com/",
    typoExamples: ["shien", "sheiin", "shein app", "쉬인 오타"],
    note: "패션 커머스는 i/e 전치와 app/korea 조합 검색을 함께 봅니다.",
  },
  {
    slug: "etsy",
    name: "Etsy",
    koreanName: "엣시",
    category: "Shopping & local",
    region: "global",
    aliases: ["etsy", "etsy shop"],
    destinationUrl: "https://www.etsy.com/",
    typoExamples: ["esty", "etsyy", "etsy store", "엣시 오타"],
    note: "마켓플레이스는 shop/store 조합 검색이 함께 발생합니다.",
  },
  {
    slug: "agoda",
    name: "Agoda",
    koreanName: "아고다",
    category: "Travel & maps",
    region: "both",
    aliases: ["agoda", "agoda booking"],
    destinationUrl: "https://www.agoda.com/",
    typoExamples: ["agoda hotel", "agdoa", "agoda.com", "아고다 오타"],
    note: "숙박 예약 서비스는 hotel/booking 조합과 도메인형 검색이 함께 남습니다.",
  },
  {
    slug: "expedia",
    name: "Expedia",
    koreanName: "익스피디아",
    category: "Travel & maps",
    region: "global",
    aliases: ["expedia", "expedia travel"],
    destinationUrl: "https://www.expedia.com/",
    typoExamples: ["expdia", "expedi", "expedia hotel", "익스피디아 오타"],
    note: "여행 예약 서비스는 hotel/travel 조합과 긴 철자 누락이 함께 발생합니다.",
  },
  {
    slug: "tripcom",
    name: "Trip.com",
    koreanName: "트립닷컴",
    category: "Travel & maps",
    region: "both",
    aliases: ["trip.com", "tripcom", "trip"],
    destinationUrl: "https://www.trip.com/",
    typoExamples: ["trip com", "tirp.com", "trip.com hotel", "트립닷컴 오타"],
    note: "도메인 자체가 브랜드인 서비스는 점 유무와 공백형 검색을 함께 잡습니다.",
  },
  {
    slug: "skyscanner",
    name: "Skyscanner",
    koreanName: "스카이스캐너",
    category: "Travel & maps",
    region: "both",
    aliases: ["skyscanner", "sky scanner"],
    destinationUrl: "https://www.skyscanner.com/",
    typoExamples: ["skyscaner", "skyscannr", "sky scanner", "스카이스캐너 오타"],
    note: "항공권 검색 서비스는 scanner의 n 중복/누락과 공백형 검색이 함께 발생합니다.",
  },
  {
    slug: "uber",
    name: "Uber",
    koreanName: "우버",
    category: "Travel & maps",
    region: "global",
    aliases: ["uber", "uber ride"],
    destinationUrl: "https://www.uber.com/",
    typoExamples: ["ubre", "uberr", "uber app", "우버 오타"],
    note: "모빌리티 앱은 app/ride 조합과 짧은 브랜드 전치 오타가 함께 생깁니다.",
  },
  {
    slug: "kakao-t",
    name: "Kakao T",
    koreanName: "카카오 T",
    category: "Travel & maps",
    region: "korea",
    aliases: ["kakao t", "kakaot", "카카오택시"],
    destinationUrl: "https://www.kakaomobility.com/",
    typoExamples: ["kakao taxi", "kakaotaxi", "카카오t 오타", "카카오택시 오타"],
    note: "국내 모빌리티는 카카오T와 카카오택시 잔여 검색 의도가 함께 남습니다.",
  },
  {
    slug: "korail",
    name: "Korail",
    koreanName: "코레일",
    category: "Travel & maps",
    region: "korea",
    aliases: ["korail", "letskorail", "ktx"],
    destinationUrl: "https://www.letskorail.com/",
    typoExamples: ["korial", "korail ktx", "letskorial", "코레일 오타"],
    note: "기차 예매 의도는 korail, letskorail, ktx가 같은 목적지로 이어집니다.",
  },
  {
    slug: "yanolja",
    name: "Yanolja",
    koreanName: "야놀자",
    category: "Travel & maps",
    region: "korea",
    aliases: ["yanolja", "야놀자"],
    destinationUrl: "https://www.yanolja.com/",
    typoExamples: ["yanolza", "yanolaj", "yanolja hotel", "야놀자 오타"],
    note: "국내 숙박 앱은 영문 브랜드와 한글 브랜드 검색을 함께 처리합니다.",
  },
  {
    slug: "yeogi",
    name: "Yeogi Eottae",
    koreanName: "여기어때",
    category: "Travel & maps",
    region: "korea",
    aliases: ["yeogi", "yeogi eottae", "여기어때"],
    destinationUrl: "https://www.yeogi.com/",
    typoExamples: ["yeog", "yeogi hotel", "여기어떄", "여기어때 오타"],
    note: "국내 여행 서비스는 한글 오타와 영문 발음형 검색을 함께 잡습니다.",
  },
  {
    slug: "kakao-bank",
    name: "KakaoBank",
    koreanName: "카카오뱅크",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["kakaobank", "kakao bank", "카카오뱅크"],
    destinationUrl: "https://www.kakaobank.com/",
    typoExamples: ["kakaobnak", "kakao ban", "카뱅 오타", "카카오뱅크 오타"],
    note: "금융 앱은 정식명과 줄임말 카뱅이 함께 검색됩니다.",
  },
  {
    slug: "kbank",
    name: "Kbank",
    koreanName: "케이뱅크",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["kbank", "k bank", "케이뱅크"],
    destinationUrl: "https://www.kbanknow.com/",
    typoExamples: ["kbak", "kbnak", "k bank", "케이뱅크 오타"],
    note: "인터넷 은행은 공백형 k bank와 붙여쓴 kbank 검색이 함께 발생합니다.",
  },
  {
    slug: "kakao-pay",
    name: "Kakao Pay",
    koreanName: "카카오페이",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["kakao pay", "kakaopay", "카카오페이"],
    destinationUrl: "https://www.kakaopay.com/",
    typoExamples: ["kakao py", "kakaopayy", "카페이 오타", "카카오페이 오타"],
    note: "간편결제 서비스는 공백 유무와 줄임말 검색 의도가 함께 남습니다.",
  },
  {
    slug: "naver-pay",
    name: "Naver Pay",
    koreanName: "네이버페이",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["naver pay", "naverpay", "네이버페이"],
    destinationUrl: "https://pay.naver.com/",
    typoExamples: ["naver py", "naverpayy", "네페 오타", "네이버페이 오타"],
    note: "결제 서비스는 네이버페이, 네페, naverpay가 같은 의도로 묶입니다.",
  },
  {
    slug: "samsung-pay",
    name: "Samsung Pay",
    koreanName: "삼성페이",
    category: "Finance & crypto",
    region: "korea",
    aliases: ["samsung pay", "samsungpay", "삼성페이"],
    destinationUrl: "https://www.samsung.com/sec/samsung-pay/",
    typoExamples: ["samsng pay", "samsung py", "삼페 오타", "삼성페이 오타"],
    note: "간편결제 검색은 정식명, 붙여쓰기, 줄임말 삼페가 함께 발생합니다.",
  },
  {
    slug: "paypal",
    name: "PayPal",
    koreanName: "페이팔",
    category: "Finance & crypto",
    region: "global",
    aliases: ["paypal", "pay pal"],
    destinationUrl: "https://www.paypal.com/",
    typoExamples: ["payapl", "paypl", "pay pal", "페이팔 오타"],
    note: "글로벌 결제 서비스는 공백형과 철자 전치 오타를 함께 봅니다.",
  },
  {
    slug: "coinbase",
    name: "Coinbase",
    koreanName: "코인베이스",
    category: "Finance & crypto",
    region: "global",
    aliases: ["coinbase", "coin base"],
    destinationUrl: "https://www.coinbase.com/",
    typoExamples: ["coinbse", "coinbae", "coin base", "코인베이스 오타"],
    note: "글로벌 거래소는 공백 유무와 base 철자 누락이 함께 발생합니다.",
  },
  {
    slug: "robinhood",
    name: "Robinhood",
    koreanName: "로빈후드",
    category: "Finance & crypto",
    region: "global",
    aliases: ["robinhood", "robin hood"],
    destinationUrl: "https://robinhood.com/",
    typoExamples: ["robinhod", "robin hood", "robinhood login", "로빈후드 오타"],
    note: "투자 앱은 공백형 브랜드와 login 조합 검색이 함께 나타납니다.",
  },
  {
    slug: "disney-plus",
    name: "Disney+",
    koreanName: "디즈니플러스",
    category: "Video & music",
    region: "both",
    aliases: ["disney plus", "disney+", "disneyplus"],
    destinationUrl: "https://www.disneyplus.com/",
    typoExamples: ["dinsey plus", "disney plsu", "디즈니플러스 오타"],
    note: "OTT 서비스는 plus, +, 붙여쓰기 형태가 모두 같은 의도를 가집니다.",
  },
  {
    slug: "prime-video",
    name: "Prime Video",
    koreanName: "프라임 비디오",
    category: "Video & music",
    region: "global",
    aliases: ["prime video", "amazon prime video", "primevideo"],
    destinationUrl: "https://www.primevideo.com/",
    typoExamples: ["prime vidoe", "primevideo", "amazon prime", "프라임비디오 오타"],
    note: "영상 서비스는 Amazon Prime과 Prime Video 의도가 섞여 입력됩니다.",
  },
  {
    slug: "apple-tv",
    name: "Apple TV",
    koreanName: "애플 TV",
    category: "Video & music",
    region: "both",
    aliases: ["apple tv", "appletv", "apple tv+"],
    destinationUrl: "https://tv.apple.com/",
    typoExamples: ["appel tv", "appletv", "apple tv plus", "애플티비 오타"],
    note: "Apple TV는 공백 유무와 plus 표기 검색이 함께 발생합니다.",
  },
  {
    slug: "wavve",
    name: "Wavve",
    koreanName: "웨이브",
    category: "Video & music",
    region: "korea",
    aliases: ["wavve", "wave", "웨이브"],
    destinationUrl: "https://www.wavve.com/",
    typoExamples: ["wavee", "wavv", "wavve tv", "웨이브 오타"],
    note: "국내 OTT는 wavve와 일반 단어 wave가 주소창에서 섞일 수 있습니다.",
  },
  {
    slug: "watcha",
    name: "Watcha",
    koreanName: "왓챠",
    category: "Video & music",
    region: "korea",
    aliases: ["watcha", "왓챠"],
    destinationUrl: "https://watcha.com/",
    typoExamples: ["wacha", "watchaa", "watcha tv", "왓챠 오타"],
    note: "국내 OTT는 영문 발음형과 한글 서비스명 검색을 함께 처리합니다.",
  },
  {
    slug: "apple-music",
    name: "Apple Music",
    koreanName: "애플뮤직",
    category: "Video & music",
    region: "both",
    aliases: ["apple music", "applemusic"],
    destinationUrl: "https://music.apple.com/",
    typoExamples: ["appel music", "apple musci", "애플뮤직 오타"],
    note: "음악 서비스는 apple music 공백형과 붙여쓰기 검색이 같이 발생합니다.",
  },
  {
    slug: "soundcloud",
    name: "SoundCloud",
    koreanName: "사운드클라우드",
    category: "Video & music",
    region: "global",
    aliases: ["soundcloud", "sound cloud"],
    destinationUrl: "https://soundcloud.com/",
    typoExamples: ["soundclound", "sound clud", "sound cloud", "사운드클라우드 오타"],
    note: "음악 플랫폼은 cloud 철자와 공백 유무가 대표적인 오타 지점입니다.",
  },
  {
    slug: "genie",
    name: "Genie",
    koreanName: "지니뮤직",
    category: "Video & music",
    region: "korea",
    aliases: ["genie", "genie music", "지니뮤직"],
    destinationUrl: "https://www.genie.co.kr/",
    typoExamples: ["geni", "geine", "genie music", "지니뮤직 오타"],
    note: "국내 음악 서비스는 영어 브랜드와 한글 지니뮤직 검색이 함께 남습니다.",
  },
  {
    slug: "bugs",
    name: "Bugs",
    koreanName: "벅스",
    category: "Video & music",
    region: "korea",
    aliases: ["bugs", "bugs music", "벅스"],
    destinationUrl: "https://music.bugs.co.kr/",
    typoExamples: ["bug", "bugss", "bugs music", "벅스 오타"],
    note: "짧은 음악 서비스명은 단수/복수와 music 조합 검색이 함께 발생합니다.",
  },
  {
    slug: "flo",
    name: "FLO",
    koreanName: "플로",
    category: "Video & music",
    region: "korea",
    aliases: ["flo", "flo music", "플로"],
    destinationUrl: "https://www.music-flo.com/",
    typoExamples: ["flp", "floo", "flo music", "플로 오타"],
    note: "짧은 브랜드명은 중복 입력과 music 조합을 함께 잡아야 합니다.",
  },
];

function createIntent(seed: ServiceSeed): TypoIntent {
  const generatedTypos = seed.aliases.flatMap(typoMutations);
  const directTypoExamples = dedupe(seed.typoExamples ?? []).filter(
    (query) => !isDiagnosticQuery(query),
  );
  const baseQueries = dedupe([
    ...directTypoExamples,
    ...generatedTypos,
    ...seed.aliases,
    seed.koreanName,
    seed.name,
  ]);
  const allQueries = dedupe([
    ...baseQueries,
    ...intentQueryPhrases(seed, baseQueries),
  ]).filter((query) => !isDiagnosticQuery(query));
  const typoExamples = dedupe([...directTypoExamples, ...generatedTypos]).slice(
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
