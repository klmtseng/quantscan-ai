/**
 * Type definitions for OpenAlex API responses
 * OpenAlex API Documentation: https://docs.openalex.org/
 */

export interface OpenAlexAuthor {
  display_name?: string;
  id?: string;
  orcid?: string;
}

export interface OpenAlexAuthorship {
  author?: OpenAlexAuthor;
  institutions?: Array<{
    id?: string;
    display_name?: string;
  }>;
  raw_affiliation_string?: string;
}

export interface OpenAlexSource {
  id?: string;
  display_name?: string;
  issn_l?: string;
  issn?: string[];
  type?: string;
}

export interface OpenAlexLocation {
  source?: OpenAlexSource;
  landing_page_url?: string;
  pdf_url?: string;
  is_oa?: boolean;
  version?: string;
}

/**
 * OpenAlex stores abstracts as inverted indexes to save bandwidth
 * Example: { "machine": [0, 5], "learning": [1] } => "machine learning ... machine"
 */
export type OpenAlexInvertedIndex = Record<string, number[]>;

export interface OpenAlexWork {
  id: string;
  doi?: string | null;
  title?: string;
  display_name?: string;
  publication_year?: number;
  publication_date?: string;
  type?: string;
  cited_by_count?: number;

  /**
   * List of authors and their affiliations
   */
  authorships?: OpenAlexAuthorship[];

  /**
   * Primary publication location (journal, repository, etc.)
   */
  primary_location?: OpenAlexLocation;

  /**
   * Additional publication locations
   */
  locations?: OpenAlexLocation[];

  /**
   * Abstract stored as inverted index for efficient storage
   * Use createAbstractFromInvertedIndex() to reconstruct full text
   */
  abstract_inverted_index?: OpenAlexInvertedIndex;

  /**
   * Bibliographic information
   */
  biblio?: {
    volume?: string;
    issue?: string;
    first_page?: string;
    last_page?: string;
  };

  /**
   * Concepts/topics associated with this work
   */
  concepts?: Array<{
    id: string;
    wikidata?: string;
    display_name: string;
    level: number;
    score: number;
  }>;

  /**
   * Keywords extracted from the work
   */
  keywords?: Array<{
    keyword: string;
    score: number;
  }>;

  /**
   * Open access status
   */
  open_access?: {
    is_oa: boolean;
    oa_status?: string;
    oa_url?: string;
  };

  /**
   * Sustainable Development Goals related to this work
   */
  sustainable_development_goals?: Array<{
    id: string;
    display_name: string;
    score: number;
  }>;
}

/**
 * Response structure from OpenAlex API
 */
export interface OpenAlexResponse {
  /**
   * Array of works matching the query
   */
  results: OpenAlexWork[];

  /**
   * Metadata about the results
   */
  meta?: {
    count: number;
    db_response_time_ms: number;
    page: number;
    per_page: number;
  };

  /**
   * Group-by results (if using group_by parameter)
   */
  group_by?: Array<{
    key: string;
    key_display_name: string;
    count: number;
  }>;
}

/**
 * Query parameters for OpenAlex API
 */
export interface OpenAlexQueryParams {
  filter?: string;
  search?: string;
  sort?: string;
  page?: number;
  per_page?: number;
  select?: string;
  mailto?: string;
}
