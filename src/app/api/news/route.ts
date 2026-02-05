import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const date = searchParams.get("date");

    const BASE_URL = process.env.NEWS_API_BASE_URL;
    const API_KEY = process.env.NEWS_API_KEY;
    let url = `${BASE_URL}/everything?q=${query}&apiKey=${API_KEY}`;

    if (date) {
        url += `&from=${date}&sortBy=publishedAt`;
    }

    const res = await fetch(url, { next: { revalidate: 60 } });
    const data = await res.json();

    return NextResponse.json(data);
}
