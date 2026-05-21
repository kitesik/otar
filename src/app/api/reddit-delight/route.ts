import { NextResponse } from "next/server";

type RedditChild = {
  data?: {
    title?: string;
    url_overridden_by_dest?: string;
    permalink?: string;
    over_18?: boolean;
    is_video?: boolean;
    post_hint?: string;
    subreddit_name_prefixed?: string;
    ups?: number;
    author?: string;
  };
};

const subreddits = ["wholesomememes", "aww", "memes"];
const blockedWords = [
  "nsfw",
  "politic",
  "gore",
  "death",
  "kill",
  "war",
  "slur",
  "porn",
];

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(url);
}

function isSafeTitle(title: string) {
  const normalized = title.toLowerCase();
  return !blockedWords.some((word) => normalized.includes(word));
}

export async function GET() {
  const candidates = [];

  for (const subreddit of subreddits) {
    try {
      const response = await fetch(
        `https://www.reddit.com/r/${subreddit}/top.json?t=week&limit=18`,
        {
          headers: {
            "User-Agent": "otar-local-preview/0.1 by kitesik",
          },
          next: {
            revalidate: 60 * 30,
          },
        },
      );

      if (!response.ok) {
        continue;
      }

      const payload = await response.json();
      const children: RedditChild[] = payload?.data?.children ?? [];

      for (const child of children) {
        const post = child.data;
        const image = post?.url_overridden_by_dest;
        const title = post?.title;

        if (!post || !image || !title) {
          continue;
        }

        if (post.over_18 || post.is_video || !isImageUrl(image) || !isSafeTitle(title)) {
          continue;
        }

        candidates.push({
          id: `${subreddit}-${post.permalink}`,
          source: "Reddit",
          title,
          caption: `${post.subreddit_name_prefixed ?? `r/${subreddit}`} 주간 top · ${post.ups ?? 0} upvotes`,
          image,
          imageAlt: `${title} 이미지`,
          sourceUrl: `https://www.reddit.com${post.permalink ?? `/r/${subreddit}`}`,
          sourceLicense: "User-submitted Reddit content; linked to original post",
          author: post.author,
        });
      }
    } catch {
      continue;
    }
  }

  candidates.sort((a, b) => {
    const aVotes = Number(a.caption.match(/(\d+) upvotes/)?.[1] ?? 0);
    const bVotes = Number(b.caption.match(/(\d+) upvotes/)?.[1] ?? 0);
    return bVotes - aVotes;
  });

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    candidates: candidates.slice(0, 18),
  });
}
