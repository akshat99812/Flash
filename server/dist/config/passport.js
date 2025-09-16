import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../utils/prisma.js';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback', // Must match your Google Cloud Console redirect URI
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });
        if (!user) {
            // Create new user if they don't exist
            user = await prisma.user.create({
                data: {
                    email: profile.emails?.[0]?.value ?? '',
                    password: '', // Password is not used for Google auth
                    googleId: profile.id,
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error, false);
    }
});
//# sourceMappingURL=passport.js.map