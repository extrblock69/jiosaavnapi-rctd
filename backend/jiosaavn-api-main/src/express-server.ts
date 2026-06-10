import express, { Request, Response } from 'express';
import cors from 'cors';
import { SearchService } from '#modules/search/services';
import { SongService } from '#modules/songs/services';
import { AlbumService } from '#modules/albums/services';
import { ArtistService } from '#modules/artists/services';
import { PlaylistService } from '#modules/playlists/services';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const searchService = new SearchService();
const songService = new SongService();
const albumService = new AlbumService();
const artistService = new ArtistService();
const playlistService = new PlaylistService();

const handleRequest = async (req: Request, res: Response, serviceCall: () => Promise<any>) => {
  try {
    const result = await serviceCall();
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getParamString = (param: string | string[] | undefined): string => {
  if (!param) return '';
  return typeof param === 'string' ? param : param[0];
};

// ==========================================
// SEARCH ENDPOINTS
// ==========================================

app.get('/api/search', (req, res) => {
  const query = req.query.query as string;
  if (!query) return res.status(400).json({ success: false, message: 'query is required' });
  return handleRequest(req, res, () => searchService.searchAll(query));
});

app.get('/api/search/songs', (req, res) => {
  const query = req.query.query as string;
  const page = parseInt((req.query.page as string) || '0', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  if (!query) return res.status(400).json({ success: false, message: 'query is required' });
  return handleRequest(req, res, () => searchService.searchSongs({ query, page, limit }));
});

app.get('/api/search/albums', (req, res) => {
  const query = req.query.query as string;
  const page = parseInt((req.query.page as string) || '0', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  if (!query) return res.status(400).json({ success: false, message: 'query is required' });
  return handleRequest(req, res, () => searchService.searchAlbums({ query, page, limit }));
});

app.get('/api/search/artists', (req, res) => {
  const query = req.query.query as string;
  const page = parseInt((req.query.page as string) || '0', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  if (!query) return res.status(400).json({ success: false, message: 'query is required' });
  return handleRequest(req, res, () => searchService.searchArtists({ query, page, limit }));
});

app.get('/api/search/playlists', (req, res) => {
  const query = req.query.query as string;
  const page = parseInt((req.query.page as string) || '0', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  if (!query) return res.status(400).json({ success: false, message: 'query is required' });
  return handleRequest(req, res, () => searchService.searchPlaylists({ query, page, limit }));
});

// ==========================================
// SONG ENDPOINTS
// ==========================================

app.get('/api/songs', (req, res) => {
  const ids = req.query.ids as string;
  const link = req.query.link as string;

  if (!ids && !link) {
    return res.status(400).json({ success: false, message: 'Either song IDs or link is required' });
  }

  let parsedLink = link;
  if (link) {
    const match = link.match(/jiosaavn\.com\/song\/[^\/]+\/([^\/]+)$/);
    if (match) parsedLink = match[1];
  }

  return handleRequest(req, res, () =>
    parsedLink
      ? songService.getSongByLink(parsedLink)
      : songService.getSongByIds({ songIds: ids || '' })
  );
});

app.get('/api/songs/:id', (req, res) => {
  const id = getParamString(req.params.id);
  return handleRequest(req, res, () => songService.getSongByIds({ songIds: id }));
});

app.get('/api/songs/:id/suggestions', (req, res) => {
  const songId = getParamString(req.params.id);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  return handleRequest(req, res, () => songService.getSongSuggestions({ songId, limit }));
});

app.get('/api/songs/:id/station', (req, res) => {
  const songIds = getParamString(req.params.id);
  return handleRequest(req, res, () => songService.createSongStation(songIds));
});


// ==========================================
// ALBUM ENDPOINTS
// ==========================================

app.get('/api/albums', (req, res) => {
  const id = req.query.id as string;
  const link = req.query.link as string;

  if (!id && !link) return res.status(400).json({ success: false, message: 'Either album ID or link is required' });

  return handleRequest(req, res, () =>
    link ? albumService.getAlbumByLink(link) : albumService.getAlbumById(id)
  );
});

app.get('/api/albums/:id', (req, res) => {
  const id = getParamString(req.params.id);
  return handleRequest(req, res, () => albumService.getAlbumById(id));
});

// ==========================================
// PLAYLIST ENDPOINTS
// ==========================================

app.get('/api/playlists', (req, res) => {
  const id = req.query.id as string;
  const link = req.query.link as string;
  const page = parseInt((req.query.page as string) || '0', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  if (!id && !link) return res.status(400).json({ success: false, message: 'Either playlist ID or link is required' });

  return handleRequest(req, res, () =>
    link ? playlistService.getPlaylistByLink({ token: link, page, limit }) : playlistService.getPlaylistById({ id, page, limit })
  );
});

app.get('/api/playlists/:id', (req, res) => {
  const id = getParamString(req.params.id);
  const page = parseInt((req.query.page as string) || '0', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);
  return handleRequest(req, res, () => playlistService.getPlaylistById({ id, page, limit }));
});


// ==========================================
// ARTIST ENDPOINTS
// ==========================================

app.get('/api/artists', (req, res) => {
  const id = req.query.id as string;
  const link = req.query.link as string;
  const page = parseInt((req.query.page as string) || '0', 10);
  const songCount = parseInt((req.query.songCount as string) || '10', 10);
  const albumCount = parseInt((req.query.albumCount as string) || '10', 10);
  const sortBy = (req.query.sortBy as 'popularity' | 'latest' | 'alphabetical') || 'popularity';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

  if (!id && !link) return res.status(400).json({ success: false, message: 'Either artist ID or link is required' });

  return handleRequest(req, res, () =>
    link
      ? artistService.getArtistByLink({ token: link, page, songCount, albumCount, sortBy, sortOrder })
      : artistService.getArtistById({ artistId: id, page, songCount, albumCount, sortBy, sortOrder })
  );
});

app.get('/api/artists/:id', (req, res) => {
  const artistId = getParamString(req.params.id);
  const page = parseInt((req.query.page as string) || '0', 10);
  const songCount = parseInt((req.query.songCount as string) || '10', 10);
  const albumCount = parseInt((req.query.albumCount as string) || '10', 10);
  const sortBy = (req.query.sortBy as 'popularity' | 'latest' | 'alphabetical') || 'popularity';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

  return handleRequest(req, res, () => artistService.getArtistById({ artistId, page, songCount, albumCount, sortBy, sortOrder }));
});

app.get('/api/artists/:id/songs', (req, res) => {
  const artistId = getParamString(req.params.id);
  const page = parseInt((req.query.page as string) || '0', 10);
  const sortBy = (req.query.sortBy as 'popularity' | 'latest' | 'alphabetical') || 'popularity';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

  return handleRequest(req, res, () => artistService.getArtistSongs({ artistId, page, sortBy, sortOrder }));
});

app.get('/api/artists/:id/albums', (req, res) => {
  const artistId = getParamString(req.params.id);
  const page = parseInt((req.query.page as string) || '0', 10);
  const sortBy = (req.query.sortBy as 'popularity' | 'latest' | 'alphabetical') || 'popularity';
  const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';

  return handleRequest(req, res, () => artistService.getArtistAlbums({ artistId, page, sortBy, sortOrder }));
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express API server running on port ${PORT}`);
});
