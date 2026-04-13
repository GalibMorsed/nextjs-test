export default function sitemap() {
  return [
    {
      url: "https://nextnews.co.in",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://nextnews.co.in/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Add all your pages here
  ];
}
