export default function sitemap() {
  return [
    {
      url: "https://www.nextnews.co.in/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://www.nextnews.co.in/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Add all your pages here
  ];
}
