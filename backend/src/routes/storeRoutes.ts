import { Router, Response } from 'express';
import { prisma } from '../config/db.js';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/authMiddleware.js';

const router = Router();

// Normal User Store Listings with Search & Ratings
router.get(
  '/user-stores',
  authenticateToken,
  requireRole(['NORMAL_USER', 'ADMIN']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id;
      const { searchName, searchAddress, sortBy = 'name', sortOrder = 'asc' } = req.query;

      const whereClause: any = {};

      if (searchName) {
        whereClause.name = { contains: String(searchName) };
      }
      if (searchAddress) {
        whereClause.address = { contains: String(searchAddress) };
      }

      const stores = await prisma.store.findMany({
        where: whereClause,
        include: {
          ratings: {
            select: {
              userId: true,
              value: true,
            },
          },
        },
      });

      const formattedStores = stores.map((store) => {
        const ratingCount = store.ratings.length;
        const overallRating =
          ratingCount > 0
            ? Number(
                (
                  store.ratings.reduce((acc, curr) => acc + curr.value, 0) /
                  ratingCount
                ).toFixed(1)
              )
            : 0;

        const userRatingObj = store.ratings.find((r) => r.userId === userId);
        const userSubmittedRating = userRatingObj ? userRatingObj.value : null;

        return {
          id: store.id,
          name: store.name,
          address: store.address,
          email: store.email,
          overallRating,
          ratingCount,
          userSubmittedRating,
        };
      });

      const validSortFields = ['name', 'address', 'overallRating'];
      const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'name';
      const isDesc = String(sortOrder).toLowerCase() === 'desc';

      formattedStores.sort((a: any, b: any) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });

      return res.json({ stores: formattedStores });
    } catch (err) {
      next(err);
    }
  }
);

// Store Owner Dashboard
router.get(
  '/owner/dashboard',
  authenticateToken,
  requireRole(['STORE_OWNER']),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const ownerId = req.user!.id;

      const store = await prisma.store.findFirst({
        where: { ownerId },
        include: {
          ratings: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  address: true,
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
          },
        },
      });

      if (!store) {
        return res.json({
          hasStore: false,
          message: 'No store currently registered for this owner account',
          store: null,
          averageRating: 0,
          totalRatings: 0,
          ratingsList: [],
        });
      }

      const totalRatings = store.ratings.length;
      const averageRating =
        totalRatings > 0
          ? Number(
              (
                store.ratings.reduce((acc, r) => acc + r.value, 0) / totalRatings
              ).toFixed(1)
            )
          : 0;

      const ratingsList = store.ratings.map((r) => ({
        id: r.id,
        user: r.user,
        rating: r.value,
        submittedAt: r.updatedAt,
      }));

      return res.json({
        hasStore: true,
        store: {
          id: store.id,
          name: store.name,
          address: store.address,
          email: store.email,
        },
        averageRating,
        totalRatings,
        ratingsList,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
