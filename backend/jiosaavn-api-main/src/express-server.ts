import express, { Request, Response } from 'express';
import cors from 'cors';
import { SearchService } from '#modules/search/services';
import { SongService } from '#modules/songs/services';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const searchService = new SearchService();
const songService = new SongService();

app.get('/api/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    if (!query) {
      return res.status(400).json({ success: false, message: 'query is required' });
    }
    const result = await searchService.searchAll(query);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/search/songs', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    const page = parseInt((req.query.page as string) || '0', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);

    if (!query) {
      return res.status(400).json({ success: false, message: 'query is required' });
    }

    const result = await searchService.searchSongs({ query, page, limit });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/songs', async (req: Request, res: Response) => {
  try {
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

    const result = parsedLink
      ? await songService.getSongByLink(parsedLink)
      : await songService.getSongByIds({ songIds: ids });

    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/songs/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await songService.getSongByIds({ songIds: id });
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Express API server running on port ${PORT}`);
});
