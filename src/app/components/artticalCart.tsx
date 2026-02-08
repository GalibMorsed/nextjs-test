"use client";

interface Article {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface ArticleCardProps {
  article: Article;
  index: number;
  formattedDate: string;
}

export default function ArticleCard({
  article,
  index,
  formattedDate,
}: ArticleCardProps) {
  return (
    <article className="flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100">
      <div className="relative h-52 w-full overflow-hidden bg-gray-200">
        <img
          src={article.urlToImage || "/news.avif"}
          alt={article.title || "News Article"}
          onError={(e) => {
            e.currentTarget.src = "/news.avif";
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <span className="inline-block bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {article.source?.name || "Unknown Source"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center text-xs text-gray-500 font-medium uppercase tracking-wider">
          {formattedDate || "Date Not Available"}
        </div>

        <h2 className="mb-3 text-lg font-bold text-gray-900 leading-snug line-clamp-3 group-hover:text-blue-600 transition-colors">
          {article.title || "No Title Available"}
        </h2>
        <p className="mb-4 text-sm text-gray-600 line-clamp-3 flex-1">
          {article.description || "Click to read the full story."}
        </p>
        <div className="mt-auto pt-4 border-t border-gray-50">
          <a
            href={article.url || "#"}
            target={article.url ? "_blank" : "_self"}
            rel={article.url ? "noopener noreferrer" : ""}
            className={`inline-flex items-center text-sm font-semibold transition-colors ${
              article.url
                ? "text-blue-600 hover:text-blue-700 cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {article.url ? "Read Full Story" : "Link Not Available"}
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
