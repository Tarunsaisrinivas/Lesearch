import { NextRequest, NextResponse } from "next/server";

// Define types for the Semantic Scholar API response
type Author = {
  name: string;
};

type SemanticScholarPaper = {
  title: string;
  authors: Author[];
  abstract?: string;
  url: string;
};

type SemanticScholarResponse = {
  data: SemanticScholarPaper[];
};

type ProcessedPaper = {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
};

// Helper function to process paper data
const processPapers = (papers: SemanticScholarPaper[]): ProcessedPaper[] => {
  return papers.map((paper) => ({
    title: paper.title,
    authors: paper.authors.map((author) => author.name),
    abstract: paper.abstract || "No abstract available",
    url: paper.url,
  }));
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

    // Fetch data from Semantic Scholar
    const response = await fetch(
      `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=5&fields=title,authors,abstract,url`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Semantic Scholar API responded with status: ${response.status}`,
      );
    }

    // Parse the JSON response
    const data = (await response.json()) as SemanticScholarResponse;

    // Process the papers
    const papers = processPapers(data.data);

    // Return the processed papers
    return NextResponse.json(papers);
  } catch (error) {
    console.error("Error in Semantic Scholar API route:", error);

    // Determine if it's a parsing error or network error
    const errorMessage =
      error instanceof Error
        ? `Failed to process request: ${error.message}`
        : "Failed to fetch papers from Semantic Scholar";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
