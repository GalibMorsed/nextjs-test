import Link from "next/link";

const categories = ["technology", "sports", "business", "health", "science"];

export default function LegacyCategoryIndexPage() {
  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-4">News Categories</h1>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Link
            key={category}
            href={`/categories/${category}`}
            className="px-4 py-2 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100"
          >
            {category}
          </Link>
        ))}
      </div>
    </main>
  );
}
