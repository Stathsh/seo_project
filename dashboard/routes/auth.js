import { Router } from 'express';
import { validateCredentials } from '../lib/auth.js';
import { loginPage } from '../views/login.js';

const router = Router();

router.get('/login', (req, res) => {
  if (req.session && req.session.authenticated) return res.redirect('/');
  res.send(loginPage());
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (validateCredentials(username, password)) {
    req.session.authenticated = true;
    return res.redirect('/');
  }
  res.send(loginPage({ error: 'Invalid username or password.' }));
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

export default router;
