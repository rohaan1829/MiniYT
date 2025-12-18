import { Router } from 'express';
import { searchService } from '../services/search.service';

const router = Router();

// GET /api/search/suggestions?q=...
router.get('/suggestions', async (req, res, next) => {
    try {
        const query = req.query.q as string;
        const suggestions = await searchService.getSuggestions(query);
        return res.json({ success: true, data: suggestions });
    } catch (error) {
        return next(error);
    }
});

// GET /api/search?q=...
router.get('/', async (req, res, next) => {
    try {
        const query = req.query.q as string;
        if (!query) {
            return res.json({ success: true, data: { videos: [], channels: [] } });
        }

        const results = await searchService.search(query);
        return res.json({ success: true, data: results });
    } catch (error) {
        return next(error);
    }
});

export default router;
