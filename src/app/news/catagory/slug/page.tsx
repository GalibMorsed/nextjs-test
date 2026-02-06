import NoteEditor from "../../../components/noteEditor";

import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const title = params.slug.replaceAll("-", " ");

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
