import axios from "axios";

export interface ApifyJumiaItem {
  title?: string;
  name?: string;
  productName?: string;

  price?: string | number;
  currentPrice?: string | number;
  priceText?: string;
  priceNumeric?: number;

  originalPrice?: string | number;
  oldPrice?: string | number;
  oldPriceText?: string;
  oldPriceNumeric?: number;

  image?: string;
  imageUrl?: string;
  image_url?: string;
  thumbnail?: string;
  images?: string[];

  url?: string;
  productUrl?: string;
  product_url?: string;
  link?: string;

  sku?: string;
  brand?: string;
  category?: string;
  categories?: string[];

  source?: string;
  searchQuery?: string;
  availability?: string;
  rating?: string | number;
  seller?: string;
  isBuyable?: boolean;

  [key: string]: unknown;
}

export const runJumiaKenyaScraper = async (
  searchQuery: string
): Promise<ApifyJumiaItem[]> => {
  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID || "fatihtahta~jumia-scraper";

  if (!token) {
    throw new Error("APIFY_TOKEN is missing in the .env file.");
  }

  const cleanToken = token.trim();

  const jumiaSearchUrl = `https://www.jumia.co.ke/catalog/?q=${encodeURIComponent(
    searchQuery
  )}`;

  const apiUrl = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items`;

  const inputPayload = {
    startUrls: [
      {
        url: jumiaSearchUrl,
      },
    ],
  };

  console.log("Sending request to Apify...");
  console.log("Actor ID:", actorId);
  console.log("Jumia search URL:", jumiaSearchUrl);
  console.log("Apify input payload:", JSON.stringify(inputPayload, null, 2));

  try {
    const response = await axios.post<ApifyJumiaItem[]>(
      apiUrl,
      inputPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanToken}`,
        },
        timeout: 300000,
      }
    );

    console.log("Apify response status:", response.status);
    console.log(
      "Apify item count:",
      Array.isArray(response.data) ? response.data.length : 0
    );

    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log("First Apify item keys:", Object.keys(response.data[0]));
      console.log(
        "First Apify item sample:",
        JSON.stringify(response.data[0], null, 2)
      );
    }

    if (!Array.isArray(response.data)) {
      return [];
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status;
      const apiMessage =
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message;

      console.error("Apify request error:", {
        statusCode,
        apiMessage,
      });

      throw new Error(
        `Apify request failed${
          statusCode ? ` with status code ${statusCode}` : ""
        }: ${apiMessage}`
      );
    }

    console.error("Unknown Apify request error:", error);

    throw new Error("Apify request failed due to an unknown error.");
  }
};