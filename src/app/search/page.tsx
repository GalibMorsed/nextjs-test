import Link from "next/link";
import { getNews } from "../../../lib/getNews";
import AddNoteButton from "../components/addNoteButton";

interface Article {
  source?: { id?: string | null; name?: string };
  title?: string;
  description?: string;
  url?: string;
  urlToImage?: string;
  publishedAt?: string;
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query =
    typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";

  if (!query) {
    return <div className="p-10">Please enter a search term.</div>;
  }

  const news = await getNews(query);
  const articles: Article[] = news.articles ?? [];

  return (
    <main className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Search Results for &quot;{query}&quot;
      </h1>

      {articles.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <div
              key={`${article.url ?? "article"}-${index}`}
              className="overflow-hidden rounded-lg border shadow-sm"
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title ?? "News image"}
                  className="h-48 w-full object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="mb-2 text-lg font-bold">{article.title}</h2>
                <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                  {article.description}
                </p>
                <div className="flex items-center justify-between gap-2">
                  {article.url ? (
                    <Link
                      href={article.url}
                      target="_blank"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Read more
                    </Link>
                  ) : (
                    <span className="text-sm text-gray-400">Link unavailable</span>
                  )}
                  <AddNoteButton
                    title={article.title ?? "Untitled article"}
                    link={article.url ?? ""}
                    publishedAt={article.publishedAt}
                    sourceName={article.source?.name ?? "Unknown Source"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
