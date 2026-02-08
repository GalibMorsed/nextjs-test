import { getNews } from "../../../lib/getNews"; // Import your fetch function
import Link from "next/link";

// Define the props type for the page
interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Extract the query string. Handle cases where it might be undefined or an array.
  const query = typeof searchParams.q === "string" ? searchParams.q : "";

  if (!query) {
    return <div className="p-10">Please enter a search term.</div>;
  }

  // Fetch news using the query
  const news = await getNews(query);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>

      {news.articles.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.articles.map((article: any, index: number) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg mb-2">{article.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                  {article.description}
                </p>
                <Link
                  href={article.url}
                  target="_blank"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Read more
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
