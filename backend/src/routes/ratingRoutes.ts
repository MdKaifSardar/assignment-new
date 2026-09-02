import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/authMiddleware.js';
import { ratingSchema, validate } from '../middleware/validationMiddleware.js';

const router = Router();

router.use(authenticateToken, requireRole(['NORMAL_USER', 'ADMIN']));

// Submit or Modify rating for a store
router.post(
  '/',
  validate(ratingSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { storeId, value } = req.body;

      const store = await prisma.store.findUnique({ where: { id: storeId } });
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Upsert: Create rating or update existing rating if user already rated this store
      const rating = await prisma.rating.upsert({
        where: {
          userId_storeId: {
            userId,
            storeId,
          },
        },
        update: {
          value,
        },
        create: {
          userId,
          storeId,
          value,
        },
      });

      return res.json({
        message: 'Rating saved successfully',
        rating,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
