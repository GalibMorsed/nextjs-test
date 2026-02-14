import type { Metadata } from "next";
import NoteEditor from "@/app/components/noteEditor";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replaceAll("-", " ");

  return {
    title: `${title} | NewsApp`,
    description: `Read full article about ${title}`,
    openGraph: {
      title,
      description: `Detailed news article on ${title}`,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;
  const title = slug.replaceAll("-", " ");

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-3xl font-bold capitalize">{title}</h1>
      <NoteEditor title={title} slug={slug} />
    </main>
  );
}
