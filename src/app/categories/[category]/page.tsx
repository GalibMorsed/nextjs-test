import Link from "next/link";

interface Article {
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string;
}

async function getCategoryNews(category: string, country = "us") {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  const res = await fetch(
    `${baseUrl}/api/news?category=${encodeURIComponent(category)}&country=${encodeURIComponent(country)}`,
    { cache: "no-store" },
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
      <h1 className="text-4xl font-bold capitalize mb-6">{category}</h1>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((article, index) => (
            <article
              key={`${article.url ?? "article"}-${index}`}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title ?? "News image"}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">
                {article.title ?? "Untitled article"}
              </h2>
              <p className="text-gray-600 mb-4">
                {article.description ?? "No description available."}
              </p>
              {article.url ? (
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Read more
                </Link>
              ) : (
                <span className="text-gray-400">Link unavailable</span>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p>No articles found for this category.</p>
      )}
    </main>
  );
}
