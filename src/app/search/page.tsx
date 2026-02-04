import React from 'react'


export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <h1>Search Results for: {searchParams.q}</h1>;
}
