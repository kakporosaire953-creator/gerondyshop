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
const Product = require('./models/Product');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const Message = require('./models/Message');
const ConciergeRequest = require('./models/ConciergeRequest');
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
  limits: { fileSize: 10 * 1024 * 1024 },
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));
app.use(express.static(path.join(__dirname)));

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return res.status(401).json({ message: 'Token manquant ou session expirée.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Session invalide ou expirée.' });
  }
}

// Optional Auth (sets req.user if token present)
function optionalAuth(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_err) {
      req.user = null;
    }
  }
  next();
}

// ================= AUTHENTICATION =================
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role, city, district, storeName } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: 'Nom, email, mot de passe et téléphone sont obligatoires.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cette adresse email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'seller' ? 'seller' : 'user';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      phone,
      role: userRole,
      city: city || 'Cotonou',
      district: district || '',
      storeName: storeName || (userRole === 'seller' ? `${name} Store` : ''),
      walletBalance: 125000, // Bienvenue bonus 125 000 FCFA pour tester le Wallet
    });

    // Record initial wallet bonus transaction
    await Transaction.create({
      userId: user.id,
      type: 'deposit',
      amount: 125000,
      description: 'Solde de bienvenue Gérondy Wallet',
      reference: 'WELCOME-BONUS',
      status: 'completed',
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Compte créé avec succès !',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        avatar: user.avatar,
        city: user.city,
        district: user.district,
        storeName: user.storeName,
      },
      token,
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ message: 'Erreur lors de l’inscription.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Veuillez renseigner votre email et mot de passe.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Connexion réussie !',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        walletBalance: user.walletBalance,
        avatar: user.avatar,
        city: user.city,
        district: user.district,
        storeName: user.storeName,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    const { password, ...safeUser } = user;
    res.json({ user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur de récupération du profil.' });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, city, district, storeName, avatar } = req.body;
    const updated = await User.update(req.user.id, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(city && { city }),
      ...(district && { district }),
      ...(storeName && { storeName }),
      ...(avatar && { avatar }),
    });

    const { password, ...safeUser } = updated;
    res.json({ message: 'Profil mis à jour avec succès', user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur de mise à jour du profil.' });
  }
});

// ================= PRODUCTS & CATALOG =================
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sort, seller, inStock } = req.query;
    let products = await Product.findAll();

    if (category && category !== 'all') {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (seller) {
      products = products.filter(
        (p) => p.sellerEmail === seller || p.seller === seller
      );
    }

    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.shortSpecs && p.shortSpecs.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q) ||
          p.seller.toLowerCase().includes(q)
      );
    }

    if (minPrice) {
      products = products.filter((p) => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter((p) => p.price <= Number(maxPrice));
    }

    if (inStock === 'true') {
      products = products.filter((p) => p.stock > 0);
    }

    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'popular') {
      products.sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0));
    }

    res.json({ products, total: products.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des produits.' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.post('/api/products', authMiddleware, async (req, res) => {
  try {
    const { name, price, originalPrice, category, description, shortSpecs, specs, image, stock, badge } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Nom et prix sont obligatoires.' });
    }

    const user = await User.findById(req.user.id);
    const sellerName = user?.storeName || user?.name || 'Vendeur Gérondy';

    const product = await Product.create({
      name,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      category: category || 'tech',
      description: description || '',
      shortSpecs: shortSpecs || '',
      specs: specs || {},
      image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      seller: sellerName,
      sellerEmail: req.user.email,
      sellerId: req.user.id,
      stock: stock !== undefined ? Number(stock) : 10,
      badge: badge || 'Nouveau',
    });

    res.status(201).json({ message: 'Produit ajouté avec succès !', product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la création du produit.' });
  }
});

app.put('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    // Check ownership if not admin
    if (req.user.role !== 'admin' && product.sellerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce produit.' });
    }

    const updated = await Product.update(req.params.id, req.body);
    res.json({ message: 'Produit mis à jour avec succès', product: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du produit.' });
  }
});

app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit introuvable.' });
    }

    if (req.user.role !== 'admin' && product.sellerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce produit.' });
    }

    await Product.delete(req.params.id);
    res.json({ message: 'Produit supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors de la suppression.' });
  }
});

// ================= GÉRONDY WALLET =================
app.get('/api/wallet/balance', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    res.json({ balance: user.walletBalance || 0 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur wallet.' });
  }
});

app.get('/api/wallet/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.findByUser(req.user.id);
    res.json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur chargement transactions.' });
  }
});

app.post('/api/wallet/recharge', authMiddleware, async (req, res) => {
  try {
    const { amount, method, phone } = req.body;
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 500) {
      return res.status(400).json({ message: 'Le montant minimum de recharge est de 500 FCFA.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const newBalance = (user.walletBalance || 0) + numAmount;
    await User.update(user.id, { walletBalance: newBalance });

    const ref = `RECHARGE-${method || 'MOMO'}-${Date.now().toString(36).toUpperCase()}`;
    const tx = await Transaction.create({
      userId: user.id,
      type: 'deposit',
      amount: numAmount,
      description: `Recharge Wallet via ${method || 'Mobile Money'} (${phone || user.phone})`,
      reference: ref,
      status: 'completed',
    });

    res.json({
      message: `Recharge de ${numAmount.toLocaleString('fr-FR')} FCFA effectuée avec succès !`,
      balance: newBalance,
      transaction: tx,
    });
  } catch (err) {
    console.error('Wallet recharge error:', err);
    res.status(500).json({ message: 'Erreur lors de la recharge du Wallet.' });
  }
});

// ================= ORDERS & CHECKOUT =================
app.post('/api/orders', authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({ message: 'Votre panier est vide.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    // Calculate subtotal and check stock
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.id);
      if (!product) {
        return res.status(400).json({ message: `Produit "${item.name}" non trouvé.` });
      }
      const qty = Number(item.quantity || 1);
      if (product.stock < qty) {
        return res.status(400).json({
          message: `Stock insuffisant pour "${product.name}". Il ne reste que ${product.stock} unité(s).`,
        });
      }
      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.image,
        seller: product.seller,
        sellerEmail: product.sellerEmail,
        specsSummary: item.specsSummary || product.shortSpecs,
      });

      // Deduct product stock
      await Product.update(product.id, { stock: Math.max(0, product.stock - qty) });
    }

    const shippingCost = subtotal >= 100000 ? 0 : 1500; // Livraison offerte dès 100 000 FCFA
    const totalAmount = subtotal + shippingCost;

    // Handle Wallet Payment
    if (paymentMethod === 'wallet') {
      if ((user.walletBalance || 0) < totalAmount) {
        return res.status(400).json({
          message: `Solde Wallet insuffisant (${(user.walletBalance || 0).toLocaleString('fr-FR')} FCFA). Montant requis: ${totalAmount.toLocaleString('fr-FR')} FCFA. Veuillez recharger votre Wallet ou choisir un autre mode de paiement.`,
        });
      }

      // Deduct from buyer wallet
      const newBuyerBalance = user.walletBalance - totalAmount;
      await User.update(user.id, { walletBalance: newBuyerBalance });

      // Create debit transaction
      await Transaction.create({
        userId: user.id,
        type: 'payment',
        amount: totalAmount,
        description: `Paiement commande #${orderItems[0].name}${orderItems.length > 1 ? ` + ${orderItems.length - 1} autre(s)` : ''}`,
        reference: `CMD-${Date.now().toString(36).toUpperCase()}`,
        status: 'completed',
      });
    }

    const order = await Order.create({
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: shippingAddress?.phone || user.phone,
      shippingAddress: {
        country: shippingAddress?.country || 'Bénin',
        city: shippingAddress?.city || user.city || 'Cotonou',
        district: shippingAddress?.district || user.district || '',
        street: shippingAddress?.street || '',
        notes: notes || shippingAddress?.notes || '',
      },
      items: orderItems,
      subtotal,
      shippingCost,
      totalAmount,
      paymentMethod: paymentMethod || 'wallet',
      paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending_cash',
      status: 'processing',
      sellerEmail: orderItems[0]?.sellerEmail || 'seller@gerondyshop.com',
    });

    res.status(201).json({
      message: 'Commande enregistrée avec succès !',
      order,
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ message: 'Erreur lors de la création de la commande.' });
  }
});

app.get('/api/orders/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findByUser(req.user.id);
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur chargement commandes.' });
  }
});

app.get('/api/orders/seller-orders', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Accès réservé aux vendeurs.' });
    }
    const orders = user.role === 'admin' ? await Order.findAll() : await Order.findBySeller(user.email);
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur chargement commandes vendeur.' });
  }
});

app.get('/api/orders/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable.' });

    if (order.userId !== req.user.id && req.user.role !== 'admin' && order.sellerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.put('/api/orders/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable.' });

    if (req.user.role !== 'admin' && order.sellerEmail !== req.user.email) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    const updated = await Order.updateStatus(req.params.id, status, paymentStatus);
    res.json({ message: 'Statut de commande mis à jour.', order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour commande.' });
  }
});

// ================= CONCIERGERIE =================
app.post('/api/concierge', authMiddleware, async (req, res) => {
  try {
    const { productName, category, budgetMin, budgetMax, quantity, description, referenceLink, referenceImage } = req.body;
    if (!productName || !description) {
      return res.status(400).json({ message: 'Le nom du produit et la description sont requis.' });
    }

    const user = await User.findById(req.user.id);

    const request = await ConciergeRequest.create({
      user: req.user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      productName,
      category: category || 'High-Tech & Spécialisé',
      budgetMin: budgetMin ? Number(budgetMin) : null,
      budgetMax: budgetMax ? Number(budgetMax) : null,
      quantity: quantity ? Number(quantity) : 1,
      description,
      referenceLink: referenceLink || '',
      referenceImage: referenceImage || '',
      status: 'pending',
    });

    try {
      if (mailerTransporter) {
        await mailerTransporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: ADMIN_EMAIL,
          subject: `[Gérondy Conciergerie] Demande ${request.referenceCode}: ${productName}`,
          text: `Nouvelle demande de conciergerie reçue :\nCode: ${request.referenceCode}\nClient: ${user.name} (${user.email}, ${user.phone})\nProduit: ${productName}\nBudget: ${budgetMin || 0} - ${budgetMax || 0} FCFA\n\nDescription:\n${description}`,
        });
      }
    } catch (err) {
      console.warn('Email notification skipped:', err.message);
    }

    res.status(201).json({
      message: 'Votre demande a été transmise à notre service Conciergerie. Un agent étudie votre demande.',
      request,
    });
  } catch (err) {
    console.error('Concierge error:', err);
    res.status(500).json({ message: 'Erreur lors de l’envoi de votre demande.' });
  }
});

app.get('/api/concierge', authMiddleware, async (req, res) => {
  try {
    const requests = await ConciergeRequest.findByUser(req.user.id);
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur lors du chargement des demandes.' });
  }
});

app.get('/api/concierge/all', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
      return res.status(403).json({ message: 'Accès réservé.' });
    }
    const requests = await ConciergeRequest.findAll();
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

app.put('/api/concierge/:id/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'admin' && user.role !== 'seller')) {
      return res.status(403).json({ message: 'Accès non autorisé.' });
    }

    const { status, adminNotes, offer } = req.body;
    const updated = await ConciergeRequest.updateStatus(req.params.id, {
      status,
      adminNotes,
      offer,
    });

    res.json({ message: 'Demande conciergerie mise à jour.', request: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur mise à jour conciergerie.' });
  }
});

// ================= CHAT & SOCIAL COMMERCE =================
app.get('/api/chat/history', authMiddleware, async (req, res) => {
  try {
    const { conversationId } = req.query;
    let messages;
    if (conversationId) {
      messages = await Message.findByConversation(conversationId);
    } else {
      messages = await Message.findByUser(req.user.id);
    }
    res.json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur chargement messages.' });
  }
});

app.post('/api/chat/send', authMiddleware, async (req, res) => {
  try {
    const { message, text, conversationId, recipientId, recipientName, productContext } = req.body;
    const content = text || message;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Le contenu du message est requis.' });
    }

    const user = await User.findById(req.user.id);

    const newMessage = await Message.create({
      conversationId: conversationId || `conv-${user.id}-${recipientId || 'support'}`,
      senderId: user.id,
      senderName: user.name,
      recipientId: recipientId ? Number(recipientId) : null,
      recipientName: recipientName || 'Support Gérondy',
      text: content.trim(),
      productContext: productContext || null,
    });

    res.status(201).json({ message: newMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur envoi message.' });
  }
});

// ================= SELLER DASHBOARD ANALYTICS =================
app.get('/api/seller/analytics', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'seller' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Accès réservé aux vendeurs.' });
    }

    const products = user.role === 'admin' ? await Product.findAll() : await Product.findBySeller(user.email);
    const orders = user.role === 'admin' ? await Order.findAll() : await Order.findBySeller(user.email);

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalOrders = orders.length;
    const activeProducts = products.length;
    const lowStockProducts = products.filter((p) => p.stock <= 5);

    res.json({
      totalRevenue,
      totalOrders,
      activeProducts,
      lowStockProducts,
      walletBalance: user.walletBalance || 0,
      recentOrders: orders.slice(0, 5),
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ message: 'Erreur analyse vendeur.' });
  }
});

// ================= IMAGE UPLOAD =================
app.post('/api/upload/image', imageUpload.single('image'), (req, res) => {
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

// Static pages routing fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ message: 'Route API introuvable' });
  }
  const reqPath = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
  const filePath = path.join(__dirname, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✨ The Gérondy Shop serveur actif sur http://localhost:${PORT}`);
});
