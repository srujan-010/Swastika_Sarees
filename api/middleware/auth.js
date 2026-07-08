import dotenv from 'dotenv';
import { User } from '../db/models.js';
import jwt from 'jsonwebtoken';
import * as emailService from '../services/emailService.js';

let googleCertificates = {};
let lastFetchedCerts = 0;

async function fetchGoogleCerts() {
  const now = Date.now();
  if (now - lastFetchedCerts < 3600000 && Object.keys(googleCertificates).length > 0) {
    return googleCertificates;
  }
  try {
    const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    if (res.ok) {
      googleCertificates = await res.json();
      lastFetchedCerts = now;
    }
  } catch (error) {
    console.error('Failed to fetch Google certificates:', error);
  }
  return googleCertificates;
}

async function verifyFirebaseToken(token) {
  try {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
      return null;
    }
    
    const kid = decodedToken.header.kid;
    const certs = await fetchGoogleCerts();
    const cert = certs[kid];
    
    if (!cert) {
      return null;
    }
    
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'swastikasarees-e4765';
    const verified = jwt.verify(token, cert, {
      algorithms: ['RS256'],
      audience: projectId,
      issuer: 'https://securetoken.google.com/' + projectId
    });
    
    return verified;
  } catch (error) {
    return null;
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'swastika_sarees_default_secret_key_change_me';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Mock Token Check for Local Testing / Sandbox
    if (token === 'mock-admin-token') {
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
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        role: dbUser.role
      };
      return next();
    }

    if (token === 'mock-customer-token') {
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
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        role: dbUser.role
      };
      return next();
    }

    // Check if it is a Firebase token
    const firebasePayload = await verifyFirebaseToken(token);
    if (firebasePayload) {
      const firebaseUid = firebasePayload.sub || firebasePayload.user_id;
      let dbUser = await User.findOne({ id: firebaseUid });
      if (!dbUser) {
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'customer';
        dbUser = await User.create({
          id: firebaseUid,
          email: firebasePayload.email,
          fullName: firebasePayload.name || '',
          phone: '',
          role: role
        });
        console.log(`Synced new Firebase user ${firebasePayload.email} with role: ${role}`);
        
        // Trigger welcome & admin alert emails asynchronously
        emailService.sendWelcomeEmail(dbUser);
        emailService.sendAdminNewCustomer(dbUser);
      }
      
      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        role: dbUser.role
      };
      return next();
    }

    // Fallback to Native JWT Verification
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const dbUser = await User.findOne({ id: decoded.user.id });
      
      if (!dbUser) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        id: dbUser.id,
        email: dbUser.email,
        fullName: dbUser.fullName,
        phone: dbUser.phone,
        role: dbUser.role
      };
      
      return next();
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
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
