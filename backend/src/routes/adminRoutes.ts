import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/authMiddleware.js';
import {
  createUserSchema,
  createStoreSchema,
  validate,
} from '../middleware/validationMiddleware.js';

const router = Router();

// Protect all admin routes
router.use(authenticateToken, requireRole(['ADMIN']));

// 1. Dashboard Statistics
router.get('/dashboard-stats', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      prisma.user.count(),
      prisma.store.count(),
      prisma.rating.count(),
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalStores,
        totalRatings,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. Add New User (Admin, Normal User, Store Owner)
router.post(
  '/users',
  validate(createUserSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { name, email, password, address, role } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'A user with this email already exists' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          address,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          role: true,
          createdAt: true,
        },
      });

      return res.status(201).json({
        message: 'User created successfully',
        user,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 3. Add New Store
router.post(
  '/stores',
  validate(createStoreSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { name, email, address, ownerId } = req.body;

      if (ownerId) {
        const owner = await prisma.user.findUnique({ where: { id: ownerId } });
        if (!owner) {
          return res.status(400).json({ error: 'Specified store owner does not exist' });
        }
      }

      const store = await prisma.store.create({
        data: {
          name,
          email,
          address,
          ownerId: ownerId || null,
        },
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return res.status(201).json({
        message: 'Store added successfully',
        store,
      });
    } catch (err) {
      next(err);
    }
  }
);

// 4. View Users Listing (with Name, Email, Address, Role filtering & sorting)
router.get('/users', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, email, address, role, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const whereClause: any = {};

    if (name) {
      whereClause.name = { contains: String(name) };
    }
    if (email) {
      whereClause.email = { contains: String(email) };
    }
    if (address) {
      whereClause.address = { contains: String(address) };
    }
    if (role && ['ADMIN', 'NORMAL_USER', 'STORE_OWNER'].includes(String(role))) {
      whereClause.role = String(role);
    }

    const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
    const sortField = validSortFields.includes(String(sortBy)) ? String(sortBy) : 'name';
    const direction = String(sortOrder).toLowerCase() === 'desc' ? 'desc' : 'asc';

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
        ownedStores: {
          select: {
            id: true,
            name: true,
            ratings: {
              select: { value: true },
            },
          },
        },
      },
      orderBy: {
        [sortField]: direction,
      },
    });

    const formattedUsers = users.map((u) => {
      let rating: number | string = 'N/A';
      if (u.role === 'STORE_OWNER' && u.ownedStores.length > 0) {
        const store = u.ownedStores[0];
        if (store.ratings.length > 0) {
          const sum = store.ratings.reduce((acc, curr) => acc + curr.value, 0);
          rating = Number((sum / store.ratings.length).toFixed(1));
        } else {
          rating = 0;
        }
      }

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        address: u.address,
        role: u.role,
        createdAt: u.createdAt,
        rating,
      };
    });

    return res.json({ users: formattedUsers });
  } catch (err) {
    next(err);
  }
});

// 5. View Stores Listing (with Name, Email, Address filtering, sorting & calculated Rating)
router.get('/stores', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, email, address, sortBy = 'name', sortOrder = 'asc' } = req.query;

    const whereClause: any = {};

    if (name) {
      whereClause.name = { contains: String(name) };
    }
    if (email) {
      whereClause.email = { contains: String(email) };
    }
    if (address) {
      whereClause.address = { contains: String(address) };
    }

    const stores = await prisma.store.findMany({
      where: whereClause,
      include: {
        ratings: {
          select: { value: true },
        },
        owner: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    const formattedStores = stores.map((s) => {
      const ratingCount = s.ratings.length;
      const averageRating =
        ratingCount > 0
          ? Number(
              (
                s.ratings.reduce((acc, curr) => acc + curr.value, 0) / ratingCount
              ).toFixed(1)
            )
          : 0;

      return {
        id: s.id,
        name: s.name,
        email: s.email,
        address: s.address,
        rating: averageRating,
        ratingCount,
        owner: s.owner,
        createdAt: s.createdAt,
      };
    });

    const validSortFields = ['name', 'email', 'address', 'rating'];
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
});

// Helper route to get all Store Owner users (for dropdown in create store)
router.get('/store-owners', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: 'STORE_OWNER' },
      select: { id: true, name: true, email: true },
    });
    return res.json({ storeOwners: owners });
  } catch (err) {
    next(err);
  }
});

export default router;
