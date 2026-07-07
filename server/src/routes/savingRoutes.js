import { Router } from 'express';
import { 
  createGoal, 
  getAllGoals, 
  getGoalDetail, 
  updateGoal, 
  deleteGoal 
} from '../controllers/savingController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

// Apply authMiddleware to all saving goal routes
router.use(authMiddleware);

router.post('/', createGoal);
router.get('/', getAllGoals);
router.get('/:id', getGoalDetail);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

export default router;
