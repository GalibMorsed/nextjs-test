import React from "react";

async function getNews(category: string, country: string = "us") {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/news?category=${category}&country=${country}`,
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
  params: { category: string };
}) {
  const data = await getNews(params.category);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold capitalize mb-6">{params.category}</h1>
      {data.articles && data.articles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {data.articles.map((article: any, index: number) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              {article.image && (
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover rounded mb-4"
                />
              )}
              <h2 className="text-xl font-semibold mb-2">{article.title}</h2>
              <p className="text-gray-600 mb-4">{article.description}</p>
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Read more
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No articles found for this category.</p>
      )}
    </div>
  );
}
