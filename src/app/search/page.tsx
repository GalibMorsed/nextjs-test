import React from 'react'


export default async function SearchPage({ searchParams }: any) {
  const { q, date } = searchParams;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/news?q=${q}&date=${date}`,
    { cache: "no-store" },
  );

  const data = await res.json();

  return (
    <div>
      <h1>
        Results for "{q}" {date && `from ${date}`}
      </h1>

      {data.articles?.map((article: any) => (
        <div key={article.title}>
          <h3>{article.title}</h3>
        </div>
      ))}
    </div>
  );
}
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return {
    title: searchParams.q
      ? `Search results for "${searchParams.q}"`
      : "Search News | NewsApp",
  };
}

