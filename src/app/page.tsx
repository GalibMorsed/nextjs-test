import { notFound } from "next/navigation";

// 1. Define types matching your API response
interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

// 2. Create a data fetching function
async function getNews(): Promise<Article[]> {
  // Ensure you have this in your .env.local file
  const apiKey = process.env.NEWS_API_KEY2;

  if (!apiKey) {
    console.error("NEWS_API_KEY is missing");
    return []; // Or throw an error depending on desired behavior
  }

  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`,
      {
        // Revalidate every hour (3600 seconds)
        next: { revalidate: 3600 },
      },
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch news: ${res.status} ${res.statusText}`);
    }

    const data: NewsResponse = await res.json();
    return data.articles;
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return empty array or rethrow to trigger error.tsx
    return [];
  }
}

// 3. Async Server Component
export default async function Home() {
  const articles = await getNews();

  if (!articles || articles.length === 0) {
    return (
      <main className="p-4">
        <h1 className="text-2xl font-bold">News Feed</h1>
        <p>No news available at the moment.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Top Headlines</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article) => (
          <article
            key={article.url}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {article.urlToImage ? (
              <img
                src={article.urlToImage}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2 line-clamp-2">
                {article.title}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {article.description}
              </p>
              <div className="flex justify-between items-center mt-auto">
                <span className="text-xs text-gray-500">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm font-medium"
                >
                  Read Full Story
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
