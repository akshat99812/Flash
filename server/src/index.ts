import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import prisma from './utils/prisma.js';
import authRoutes from './routes/auth.routes.js';
import genaiRoutes from './routes/genai.routes.js';
import './config/passport.js'; // Import passport config
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Session and Passport middleware for authentication
//app.use(passport.initialize());
//app.use(passport.session());

// AI and Authentication Routes
app.use("/genai", genaiRoutes);
//app.use('/auth', authRoutes);

// Profile route for authenticated users
// app.get('/profile', (req: Request, res: Response) => {
//     if (req.isAuthenticated()) {
//         res.json({ message: 'Authenticated', user: req.user });
//     } else {
//         res.status(401).json({ message: 'Not authenticated' });
//     }
// });

// Start the server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    server.close(() => {
        console.log('Server shut down');
        process.exit(0);
    });
});