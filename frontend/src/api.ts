import type { Artwork } from './types';


export async function fetchArtworks(
  page = 1,
  limit = 10
): Promise<{ data: Artwork[]; total: number }> {
  const url = `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${limit}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const json = await res.json();
  return { data: json.data, total: json.pagination?.total || 0 };
}
