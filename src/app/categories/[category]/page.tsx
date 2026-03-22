import CategoryContent from "./CategoryContent";

interface Article {
  source?: { id?: string | null; name?: string };
  author?: string | null;
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
}

async function getCategoryNews(category: string, country = "us") {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://next-news-six-rouge.vercel.app";

  try {
    const res = await fetch(
      `${siteUrl}/api/news?category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}&page=1&pageSize=20`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) {
      console.error(`Failed to fetch news for category: ${category} — status ${res.status}`);
      return { articles: [] };
    }

    return res.json();
  } catch (err) {
    console.error(`Error fetching news for category: ${category}`, err);
    return { articles: [] };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const data = await getCategoryNews(category);
  const articles: Article[] = data.articles ?? [];

  return (
    <main className="p-6">
      <CategoryContent
        category={category}
        initialArticles={articles}
        pageSize={20}
      />
    </main>
  );
}
