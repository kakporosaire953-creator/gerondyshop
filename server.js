const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
require('dotenv').config();

const User = require('./models/User');
const Message = require('./models/Message');
const ConciergeRequest = require('./models/ConciergeRequest');
const Product = require('./models/Product');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gerondyshop-secret-2026';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'schekinacamille@gmail.com';
const uploadDir = path.join(__dirname, 'data', 'uploads');

fs.mkdirSync(uploadDir, { recursive: true });

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname || '').toLowerCase() || '.png';
      const uniqueName = `${Date.now()}-${crypto.randomUUID().replace(/-/g, '')}${extension}`;
      cb(null, uniqueName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont autorisées.'));
    }
    return cb(null, true);
  },
});

let mailerTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  mailerTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname)));

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      phone,
    });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l’inscription.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/chat/send', authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Le message est requis.' });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      senderName: req.user.name,
      text: message,
    });

    res.json({ message: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de l’envoi du message.' });
  }
});

app.get('/api/chat/history', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.findRecent(50);
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement du chat.' });
  }
});

app.post('/api/concierge', authMiddleware, async (req, res) => {
  try {
    const { subject, details } = req.body;
    if (!subject || !details) {
      return res.status(400).json({ message: 'Sujet et détails requis.' });
    }

    const request = await ConciergeRequest.create({
      user: req.user.id,
      userName: req.user.name,
      subject,
      details,
    });

    try {
      if (mailerTransporter) {
        await mailerTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: ADMIN_EMAIL,
          subject: `Nouvelle demande concierge: ${subject}`,
          text: `Utilisateur: ${req.user.name} <${req.user.email || 'n/a'}>\nSujet: ${subject}\n\n${details}`,
        });
      } else {
        console.log('Mailer not configured - concierge notification:', { to: ADMIN_EMAIL, subject, details, user: req.user.name });
      }
    } catch (err) {
      console.error('Erreur en envoyant la notification email:', err);
    }

    res.json({ request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la demande.' });
  }
});

app.get('/api/concierge/all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });
    const requests = await ConciergeRequest.findAll();
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/notify', async (req, res) => {
  const { to, subject, text, html, csvName, csvContent } = req.body || {};
  const target = to || ADMIN_EMAIL;
  if (!subject || (!text && !html && !csvContent)) return res.status(400).json({ message: 'Sujet et contenu requis.' });
  if (!mailerTransporter) {
    return res.status(501).json({ message: 'SMTP non configuré sur le serveur.' });
  }
  try {
    const mailOpts = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: target,
      subject,
      text: text || undefined,
      html: html || undefined,
      attachments: [],
    };
    if (csvContent && csvName) {
      mailOpts.attachments.push({ filename: csvName, content: Buffer.from(csvContent), contentType: 'text/csv' });
    }
    await mailerTransporter.sendMail(mailOpts);
    res.json({ message: 'Email envoyé' });
  } catch (err) {
    console.error('notify error', err);
    res.status(500).json({ message: 'Erreur en envoyant l’email.' });
  }
});

app.get('/api/concierge', authMiddleware, async (req, res) => {
  try {
    const requests = await ConciergeRequest.findByUser(req.user.id);
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des demandes.' });
  }
});

app.post('/api/upload/image', imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucune image reçue.' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: imageUrl, filename: req.file.filename });
  } catch (err) {
    console.error('upload error', err);
    return res.status(500).json({ message: 'Erreur pendant l’upload de l’image.' });
  }
});

app.get('/api/products', async (_req, res) => {
  try {
    const products = await Product.findAll();
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors du chargement des produits.' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { id, name, price, category, description, image, seller } = req.body || {};
    if (!name || !price || !seller) {
      return res.status(400).json({ message: 'Nom, prix et vendeur requis.' });
    }

    const product = await Product.create({
      id: id ? Number(id) : undefined,
      name,
      price,
      category,
      description,
      image,
      seller,
    });

    return res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur lors de la sauvegarde du produit.' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.update(req.params.id, req.body || {});
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }
    return res.json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du produit.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }
    return res.json({ message: 'Produit supprimé.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression du produit.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Gérondy Shop backend démarré sur http://localhost:${PORT}`);
});
 