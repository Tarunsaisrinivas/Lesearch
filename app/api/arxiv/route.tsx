import { NextRequest, NextResponse } from "next/server";
import { parseString } from "xml2js";

// Define types for better type safety
type Author = {
  name: string[];
};

type ArxivEntry = {
  title: string[];
  author: Author[];
  summary: string[];
  id: string[];
};

type ArxivResponse = {
  feed: {
    entry: ArxivEntry[];
  };
};

type ProcessedPaper = {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
};

// Helper function to process XML data
const processXmlData = (xmlData: string): Promise<ProcessedPaper[]> => {
  return new Promise((resolve, reject) => {
    parseString(xmlData, (err: Error | null, result: ArxivResponse) => {
      if (err) {
        reject(err);
        return;
      }

      const papers = result.feed.entry.map((entry) => ({
        title: entry.title[0],
        authors: entry.author.map((author) => author.name[0]),
        abstract: entry.summary[0],
        url: entry.id[0],
      }));

      resolve(papers);
    });
  });
};

export async function GET(request: NextRequest) {
  try {
    // Get search query from URL
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 },
      );
    }

    // Fetch data from arXiv using native fetch
    const response = await fetch(
      `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`,
    );

    if (!response.ok) {
      throw new Error(`ArXiv API responded with status: ${response.status}`);
    }

    // Get the XML text from the response
    const xmlData = await response.text();

    // Process the XML response
    const papers = await processXmlData(xmlData);

    // Return the processed papers
    return NextResponse.json(papers);
  } catch (error) {
    console.error("Error in arXiv API route:", error);

    // Determine if it's a parsing error or network error
    const errorMessage =
      error instanceof Error
        ? `Failed to process request: ${error.message}`
        : "Failed to fetch papers from arXiv";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
