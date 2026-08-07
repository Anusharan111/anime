import { useEffect } from "react";

interface SEOMetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

const DEFAULT_TITLE = "Anime Battle — Multiplayer Anime Card Drafting & Party Games";
const DEFAULT_DESCRIPTION = "Play 4 anime-themed multiplayer games: Draft Battle, Anime Feud, Guess Who, and Party Games. Build teams, guess characters, and battle friends online. 1000+ characters from One Piece, Naruto, DBZ, Jujutsu Kaisen, and more.";
const DEFAULT_IMAGE = "https://Anusharan111.github.io/anime/og-image.png";
const BASE_URL = "https://Anusharan111.github.io/anime";

export function useSEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = BASE_URL,
  type = "website",
}: SEOMetaProps) {
  useEffect(() => {
    const fullTitle = title;
    const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
    const fullImage = image.startsWith("http") ? image : `${BASE_URL}${image}`;

    // Update document title
    document.title = fullTitle;

    // Helper to set/update meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let tag = document.querySelector(selector) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement("meta");
        if (isProperty) tag.setAttribute("property", name);
        else tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Helper to set/update link tag
    const setLink = (rel: string, href: string) => {
      let tag = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      if (!tag) {
        tag = document.createElement("link");
        tag.setAttribute("rel", rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute("href", href);
    };

    // Primary meta tags
    setMeta("title", fullTitle);
    setMeta("description", description);
    setMeta("og:title", fullTitle, true);
    setMeta("og:description", description, true);
    setMeta("og:image", fullImage, true);
    setMeta("og:url", fullUrl, true);
    setMeta("og:type", type, true);
    setMeta("og:site_name", "Anime Battle", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", fullImage);

    // Canonical URL
    setLink("canonical", fullUrl);
  }, [title, description, image, url, type]);
}

// Predefined SEO configs for each route
export const routeSEO = {
  landing: {
    title: "Anime Battle — Multiplayer Anime Card Drafting & Party Games",
    description: "Play 4 anime-themed multiplayer games: Draft Battle, Anime Feud, Guess Who, and Party Games. Build teams, guess characters, and battle friends online.",
    url: "/",
  },
  battle: {
    title: "Anime Battle Hub — Choose Your Game Mode",
    description: "Enter the Anime Battle hub. Select from Draft Battle, Anime Feud, Guess Who, or Party Games. Build your roster and start playing instantly.",
    url: "/#/battle",
  },
  draft: {
    title: "Anime Draft Battle — Build Your 6-Role Team",
    description: "Draft characters from 1000+ anime heroes. Assign roles: Captain, Vice Captain, Strategist, Defender, Healer, Speed Support, Power Support, Traitor. Battle with strategic role-based combat.",
    url: "/#/draft",
  },
  results: {
    title: "Battle Results — Anime Draft Showdown",
    description: "View the cinematic battle results of your Anime Draft match. See role-by-role duels, team synergies, and the final victor.",
    url: "/#/results",
  },
  feud: {
    title: "Anime Feud — Trivia Clash Game",
    description: "Guess the top anime answers in this Family Feud style trivia game. Steal rounds, score points, and prove your anime knowledge.",
    url: "/#/feud",
  },
  guesswho: {
    title: "Guess Who — Anime Character Deduction",
    description: "Ask clever yes/no questions to identify your opponent's secret anime character before they guess yours. Pure deduction gameplay.",
    url: "/#/guesswho",
  },
  party: {
    title: "Party Games — Online Multiplayer Anime Chaos",
    description: "Bring friends into quick rounds of Guess Character and Guess Imposter. 3-10 players, online multiplayer, anime-themed party games.",
    url: "/#/party",
  },
} as const;