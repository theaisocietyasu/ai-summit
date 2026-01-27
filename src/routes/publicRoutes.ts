import { Router } from 'express';
import { getHome, getSpeakers, getEvents, getSponsors, getFile } from '../controllers';

const router = Router();

router.get('/home', getHome);
router.get('/speakers', getSpeakers);
router.get('/events', getEvents);
router.get('/sponsors', getSponsors);
router.get('/files/:fileId', getFile);

export default router;
