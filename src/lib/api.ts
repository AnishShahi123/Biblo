export interface Author {
  name: string;
  birth_year: number | null;
  death_year: number | null;
}

export interface Book {
  id: number;
  title: string;
  authors: Author[];
  translators: Author[];
  subjects: string[];
  bookshelves: string[];
  languages: string[];
  copyright: boolean;
  media_type: string;
  formats: Record<string, string>;
  download_count: number;
}

export interface GutendexResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Book[];
}

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function fetchBooks(query: string = '', page: number = 1): Promise<GutendexResponse> {
  const url = new URL(BASE_URL);
  if (query) {
    url.searchParams.append('search', query);
  }
  if (page > 1) {
    url.searchParams.append('page', page.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error('Failed to fetch books');
  }
  return response.json();
}

export async function fetchBookById(id: number): Promise<Book> {
  const response = await fetch(`${BASE_URL}/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch book details');
  }
  return response.json();
}

export async function fetchBookContent(book: Book): Promise<string> {
  const formatKeys = Object.keys(book.formats);

  // Prefer US-ASCII /files/ URLs as they are often more stable than UTF-8 /ebooks/ URLs
  let targetFormat = formatKeys.find((k) => k.includes('text/plain; charset=us-ascii'));

  if (!targetFormat) {
    targetFormat = formatKeys.find((k) => k.includes('text/plain; charset=utf-8'));
  }

  if (!targetFormat) {
    targetFormat = formatKeys.find((k) => k.includes('text/plain'));
  }

  if (!targetFormat) {
    throw new Error('No readable text format found for this book.');
  }

  const url = book.formats[targetFormat];
  const secureUrl = url.replace('http://', 'https://');

  // Try a different proxy (corsproxy.io) which handles some redirects better
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(secureUrl)}`;

  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch book content: ${response.status} ${response.statusText}`);
  }

  return response.text();
}
