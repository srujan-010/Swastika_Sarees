import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { User } from '../db/models.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Initialize Supabase Client
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Mock Token Check for Local Testing / Sandbox
    if (token === 'mock-admin-token') {
      req.user = { id: 'mock-admin-id', email: 'admin@swastikasarees.com', role: 'admin' };
      // Sync mock user
      let dbUser = await User.findOne({ id: 'mock-admin-id' });
      if (!dbUser) {
        dbUser = await User.create({
          id: 'mock-admin-id',
          email: 'admin@swastikasarees.com',
          fullName: 'Mock Admin User',
          phone: '918888888888',
          role: 'admin'
        });
      }
      return next();
    }

    if (token === 'mock-customer-token') {
      req.user = { id: 'mock-customer-id', email: 'customer@swastikasarees.com', role: 'customer' };
      // Sync mock user
      let dbUser = await User.findOne({ id: 'mock-customer-id' });
      if (!dbUser) {
        dbUser = await User.create({
          id: 'mock-customer-id',
          email: 'customer@swastikasarees.com',
          fullName: 'Mock Customer User',
          phone: '917777777777',
          role: 'customer'
        });
      }
      return next();
    }

    if (!supabase) {
      return res.status(503).json({ error: 'Supabase is not configured on the server. Please use mock tokens.' });
    }

    // Verify token using Supabase Client
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }

    // Sync User with MongoDB
    let dbUser = await User.findOne({ id: user.id });
    if (!dbUser) {
      // Check if this is the very first user in the database to auto-assign admin role
      const userCount = await User.countDocuments();
      const role = userCount === 0 ? 'admin' : 'customer';

      dbUser = await User.create({
        id: user.id,
        email: user.email,
        fullName: user.user_metadata?.full_name || user.user_metadata?.name || '',
        phone: user.phone || user.user_metadata?.phone || '',
        role: role
      });
      console.log(`Synced new user ${user.email} with role: ${role}`);
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      fullName: dbUser.fullName,
      phone: dbUser.phone,
      role: dbUser.role
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(500).json({ error: 'Authentication failed internally' });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access Denied: Admin privileges required' });
    }
  });
}
