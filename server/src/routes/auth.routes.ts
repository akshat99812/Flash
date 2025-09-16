import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller.js';
import passport from 'passport';

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login', // Redirect on failure
        session: true, // Use sessions
    }),
    (req, res) => {
        // Successful authentication, redirect home.
        res.redirect('/profile');
    }
);

router.post('/signup', signup);
router.post('/login', login);

export default router;