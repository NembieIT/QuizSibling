import { Router } from 'express';
import { getSets, getSetById, createSet, updateSet, deleteSet } from '../controllers/setController.js';

const router = Router();

router.route('/').get(getSets).post(createSet);
router.route('/:id').get(getSetById).put(updateSet).delete(deleteSet);

export default router;