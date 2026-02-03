import { Router } from 'express';
import * as conferenceController from '../controllers/conferenceController';

const router = Router();

// Public route - get active conference
router.get('/active', conferenceController.getActive);

export default router;
