const baseUrl = process.env.SEO_BASE_URL ?? "http://127.0.0.1:3000";
const publicOrigin = process.env.SEO_PUBLIC_ORIGIN ?? "https://otar.site";

const requiredDictionaryTerms = [
  "ㅊ미",
  "ccal",
  "yoi",
  "chatgpt",
  "claude",
  "네이버",
  "Coupang",
];

function localizePublicUrl(url) {
  return url.replace(publicOrigin, baseUrl);
}

async function text(pathOrUrl) {
  const url = pathOrUrl.startsWith("http")
    ? pathOrUrl
    : `${baseUrl}${pathOrUrl}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.text();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const robots = await text("/robots.txt");
assert(robots.includes(`Sitemap: ${publicOrigin}/sitemap.xml`), "robots.txt sitemap is missing");
assert(robots.includes("Allow: /"), "robots.txt should allow crawling");

const sitemap = await text("/sitemap.xml");
const urls = Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map(
  (match) => match[1],
);

assert(urls.includes(`${publicOrigin}/`), "home is missing from sitemap");
assert(urls.includes(`${publicOrigin}/dictionary`), "dictionary is missing from sitemap");
assert(urls.includes(`${publicOrigin}/oops/chmi`), "chmi page is missing from sitemap");
assert(urls.includes(`${publicOrigin}/oops/ccal`), "ccal variant page is missing from sitemap");
assert(urls.includes(`${publicOrigin}/oops/aver`), "aver variant page is missing from sitemap");
assert(urls.includes(`${publicOrigin}/oops/ggoogle`), "ggoogle variant page is missing from sitemap");
assert(urls.includes(`${publicOrigin}/oops/youtube-typo`), "youtube page is missing from sitemap");
assert(urls.includes(`${publicOrigin}/oops/chatgpt`), "chatgpt page is missing from sitemap");
assert(urls.length >= 45, `expected at least 45 sitemap URLs, got ${urls.length}`);

for (const publicUrl of urls.slice(0, 12)) {
  const html = await text(localizePublicUrl(publicUrl));
  assert(!html.includes('name="robots" content="noindex'), `${publicUrl} is noindex but appears in sitemap`);
  assert(html.includes('rel="canonical"'), `${publicUrl} is missing canonical`);
}

const dictionary = await text("/dictionary");
for (const term of requiredDictionaryTerms) {
  assert(dictionary.toLowerCase().includes(term.toLowerCase()), `dictionary missing ${term}`);
}

const chmi = await text("/oops/chmi");
assert(chmi.includes("ㅊ미"), "chmi page missing ㅊ미");
assert(!chmi.includes("cal 한영"), "chmi page should not include cal 한영");
assert(!chmi.includes("cal 잘못침"), "chmi page should not include cal 잘못침");
assert(chmi.includes(`href="${publicOrigin}/oops/chmi"`), "chmi canonical mismatch");
assert(
  chmi.includes("ㅊ미는 Google Calendar 오타예요"),
  "chmi page missing natural typo heading",
);
assert(chmi.includes("ViewAction"), "chmi page missing destination action structured data");
assert(chmi.includes("DefinedTerm"), "chmi page missing typo term structured data");
assert(
  chmi.includes("max-image-preview:large"),
  "chmi page missing large image preview robots hint",
);
assert(
  chmi.includes("/oops/gmail") || chmi.includes("/oops/google-drive"),
  "chmi page missing related internal typo links",
);

const ccal = await text("/oops/ccal");
assert(ccal.includes("ccal"), "ccal page missing ccal label");
assert(ccal.includes(`href="${publicOrigin}/oops/ccal"`), "ccal canonical mismatch");

const aver = await text("/oops/aver");
assert(aver.includes("aver"), "aver page missing aver label");
assert(aver.includes(`href="${publicOrigin}/oops/aver"`), "aver canonical mismatch");

const ggoogle = await text("/oops/ggoogle");
assert(ggoogle.includes("ggoogle"), "ggoogle page missing ggoogle label");
assert(ggoogle.includes(`href="${publicOrigin}/oops/ggoogle"`), "ggoogle canonical mismatch");

const chatgpt = await text("/oops/chatgpt");
assert(chatgpt.toLowerCase().includes("chatgtp"), "chatgpt page missing chatgtp");
assert(chatgpt.includes("챗지피티"), "chatgpt page missing Korean keyword");

console.log(
  `SEO validation passed: ${urls.length} sitemap URLs, ${requiredDictionaryTerms.length} dictionary probes`,
);
