import express from 'express';
import { IncentiveController } from '../controllers/incentive.controller.js';

const router = express.Router();

router.post('/', IncentiveController.create);
router.get('/', IncentiveController.getAll);
router.get('/:id', IncentiveController.getById);
router.put('/:id', IncentiveController.update);
router.delete('/:id', IncentiveController.remove);

export default router;

