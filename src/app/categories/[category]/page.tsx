import Link from "next/link";
import AddNoteButton from "@/app/components/addNoteButton";
import { getNewsImageSrc } from "@/lib/newsImage";

interface Article {
  source?: { id?: string | null; name?: string };
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
}

async function getCategoryNews(category: string, country = "us") {
  const baseUrl = process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2";
  const apiKey = process.env.NEWS_API_KEY2 || process.env.NEWS_API_KEY;

  if (!apiKey) {
    return { articles: [] };
  }

  const res = await fetch(
    `${baseUrl}/top-headlines?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}&apiKey=${apiKey}`,
    { next: { revalidate: 300 } },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch news for category: ${category}`);
  }

  return res.json();
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
      <h1 className="mb-6 text-4xl font-bold capitalize">{category}</h1>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {articles.map((article, index) => (
            <article
              key={`${article.url ?? "article"}-${index}`}
              className="rounded-lg border p-4 transition-shadow hover:shadow-lg"
            >
              <img
                src={getNewsImageSrc(article.urlToImage)}
                alt={article.title ?? "News image"}
                className="mb-4 h-48 w-full rounded object-cover"
              />
              <h2 className="mb-2 text-xl font-semibold">
                {article.title ?? "Untitled article"}
              </h2>
              <p className="mb-4 text-gray-600">
                {article.description ?? "No description available."}
              </p>
              <div className="flex items-center justify-between gap-3">
                {article.url ? (
                  <Link
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Read more ➡️
                  </Link>
                ) : (
                  <span className="text-gray-400">Link unavailable</span>
                )}
                <AddNoteButton
                  title={article.title ?? "Untitled article"}
                  link={article.url ?? ""}
                  publishedAt={article.publishedAt}
                  sourceName={article.source?.name ?? "Unknown Source"}
                />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>No articles found for this category.</p>
      )}
    </main>
  );
}

