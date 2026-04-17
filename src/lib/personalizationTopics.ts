export const AVAILABLE_PERSONALIZATION_TOPICS = [
  "Top Headlines",
  "Technology",
  "Business",
  "Entertainment",
  "Sports",
  "Health",
  "Science",
  "Politics",
  "Tourism",
  "Crime",
  "Environment",
  "Education",
  "Travel",
  "Food",
  "Fashion",
  "Finance",
  "Automotive",
  "Music",
  "Movies",
  "Books",
  "Art",
  "Culture",
  "Gaming",
  "Spirituality & Religion",
  "Mental Health",
  "Artificial Intelligence",
  "Cybersecurity",
  "Space & Astronomy",
  "Stock Market",
  "Trade & Economy",
  "Real Estate",
  "Defense & Military",
  "Agriculture & Farming",
  "World News",
  "Weather",
  "Energy",
  "Startups",
  "Law & Justice",
  "Social Media",
  "Personal Finance",
] as const;

export const DEFAULT_PERSONALIZATION_TOPICS = [
  "Top Headlines",
  "Technology",
  "Business",
  "Entertainment",
  "Sports",
  "Health",
  "Science",
] as const;

export const MAX_PERSONALIZATION_TOPICS = 10;

export function sanitizePersonalizationTopic(topic: string): string {
  return topic
    .replace(/[^\w\s&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

export function slugifyPersonalizationTopic(topic: string): string {
  const slug = sanitizePersonalizationTopic(topic)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "top-headlines";
}
