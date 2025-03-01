export interface Comment {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
  paper_url: string | null;
  parent_id: number | null;
  votes: number;
  user_vote: 1 | -1 | 0;
}

  
  export interface Paper {
    title?: string;
    authors?: string[];
    abstract?: string;
    url: string;
  }