import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { config } from './env';
import prisma from './database';

passport.use(
    new GoogleStrategy(
        {
            clientID: config.google.clientId || 'PLACEHOLDER',
            clientSecret: config.google.clientSecret || 'PLACEHOLDER',
            callbackURL: `${config.nodeEnv === 'production' ? 'https://yiddishtishel.com' : 'http://localhost:4000'}/api/auth/google/callback`,
            scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('No email found in Google profile'));
                }

                // Check if account already exists
                const existingAccount = await prisma.account.findUnique({
                    where: {
                        provider_providerAccountId: {
                            provider: 'google',
                            providerAccountId: profile.id,
                        },
                    },
                    include: { user: true },
                });

                if (existingAccount) {
                    return done(null, existingAccount.user);
                }

                // Check if user exists by email
                let user = await prisma.user.findUnique({
                    where: { email },
                    include: { accounts: true },
                });

                if (user) {
                    // Link to existing user
                    await prisma.account.create({
                        data: {
                            userId: user.id,
                            type: 'oauth',
                            provider: 'google',
                            providerAccountId: profile.id,
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        },
                    });
                } else {
                    // Create new user
                    user = await prisma.user.create({
                        data: {
                            email,
                            name: profile.displayName,
                            username: `user_${Math.random().toString(36).substring(2, 10)}`,
                            image: profile.photos?.[0].value,
                            accounts: {
                                create: {
                                    type: 'oauth',
                                    provider: 'google',
                                    providerAccountId: profile.id,
                                    access_token: accessToken,
                                    refresh_token: refreshToken,
                                },
                            },
                        },
                        include: { accounts: true },
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error);
    }
});

export default passport;
