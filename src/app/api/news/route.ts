import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");
  const date = searchParams.get("date");
  const category = searchParams.get("category");
  const country = searchParams.get("country") || "us";

  const baseUrl = process.env.NEWS_API_BASE_URL || "https://newsapi.org/v2";
  const apiKey = process.env.NEWS_API_KEY2 || process.env.NEWS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing NEWS API key in environment variables" },
      { status: 500 },
    );
  }

  let url = `${baseUrl}/top-headlines?country=${encodeURIComponent(country)}&apiKey=${apiKey}`;

  if (category) {
    url += `&category=${encodeURIComponent(category)}`;
  }

  if (query) {
    url = `${baseUrl}/everything?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;
    if (date) {
      url += `&from=${encodeURIComponent(date)}&sortBy=publishedAt`;
    }
  }

  const res = await fetch(url, { next: { revalidate: 60 } });
  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}
