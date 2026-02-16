import session from 'express-session';
import crypto from 'crypto';

/**
 * Configure express-session middleware
 */
export function sessionMiddleware() {
  return session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    },
  });
}

/**
 * Middleware that redirects unauthenticated requests to /login
 */
export function requireAuth(req, res, next) {
  const publicPaths = ['/login', '/logout'];
  if (publicPaths.includes(req.path)) return next();
  if (req.session && req.session.authenticated) return next();
  res.redirect('/login');
}

/**
 * Validate credentials against environment variables.
 * Returns false if ADMIN_PASSWORD is not configured (locks out all logins).
 */
export function validateCredentials(username, password) {
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return username === adminUser && password === adminPassword;
}
