import axios from "axios";

export interface ApifyJumiaItem {
  title?: string;
  name?: string;
  price?: string | number;
  currentPrice?: string | number;
  originalPrice?: string | number;
  oldPrice?: string | number;
  image?: string;
  imageUrl?: string;
  images?: string[];
  url?: string;
  productUrl?: string;
  link?: string;
  brand?: string;
  category?: string;
  availability?: string;
  rating?: string | number;
  seller?: string;
}

export const runJumiaKenyaScraper = async (
  searchQuery: string
): Promise<ApifyJumiaItem[]> => {
  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID || "fatihtahta~jumia-scraper";

  if (!token) {
    throw new Error("APIFY_TOKEN is missing in the .env file.");
  }

  const jumiaSearchUrl = `https://www.jumia.co.ke/catalog/?q=${encodeURIComponent(
    searchQuery
  )}`;

  const apiUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}`;

  const response = await axios.post<ApifyJumiaItem[]>(
    apiUrl,
    {
      startUrls: [jumiaSearchUrl],
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 300000,
    }
  );

  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data;
};