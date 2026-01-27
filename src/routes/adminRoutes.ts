import { Router } from 'express';
import {
  createBanner,
  createSpeaker,
  createEvent,
  createSponsor,
  getRegistrations,
  updateRegistration,
} from '../controllers';
import { upload } from '../services/gridfs';
import { adminAuth } from '../middleware';

const router = Router();

router.use(adminAuth);

router.post('/banner', upload.single('banner_image'), createBanner);
router.post('/speakers', upload.single('headshot'), createSpeaker);
router.post('/events', upload.single('thumbnail'), createEvent);
router.post('/sponsors', upload.single('logo'), createSponsor);
router.get('/registrations', getRegistrations);
router.patch('/registrations/:id', updateRegistration);

export default router;
