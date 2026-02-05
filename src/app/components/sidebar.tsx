import Link from "next/link";

const categories = [
  "technology",
  "sports",
  "business",
  "health",
  "science",
  "entertainment",
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <h2 className="font-semibold mb-3">Categories</h2>
      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat}>
            <Link href={`/news/${cat}`} className="capitalize">
              {cat}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
