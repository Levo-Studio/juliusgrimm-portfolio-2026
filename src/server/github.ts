const REPO = "Levo-Studio/juliusgrimm-portfolio-2026";

type LastCommit = { date: Date; url: string };

/** Cached for an hour — the footer doesn't need to hit GitHub on every request. */
export const getLastMainCommit = async (): Promise<LastCommit | null> => {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      html_url?: string;
      commit?: { committer?: { date?: string }; author?: { date?: string } };
    };
    const rawDate = data.commit?.committer?.date ?? data.commit?.author?.date;
    if (!rawDate || !data.html_url) return null;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return null;

    return { date, url: data.html_url };
  } catch {
    return null;
  }
};
