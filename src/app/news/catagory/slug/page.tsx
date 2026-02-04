import React from "react";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  return <h1>Article: {params.slug}</h1>;
}
