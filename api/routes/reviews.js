import express from 'express';
import { Review, Product, Order, User } from '../db/models.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to detect sentiment using Anthropic API or a rule-based fallback
async function analyzeSentiment(text) {
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    // Fallback Rule-Based Classifier
    const lower = text.toLowerCase();
    const spamWords = ['buy cheap', 'viagra', 'slots', 'casino', 'free entry', 'subscribe', 'click link', 'promo'];
    const positiveWords = ['love', 'beautiful', 'great', 'good', 'gorgeous', 'soft', 'premium', 'excellent', 'amazing', 'best', 'nice', 'perfect', 'happy'];
    const negativeWords = ['bad', 'worst', 'poor', 'waste', 'cheap material', 'tear', 'torn', 'fake', 'disappointed', 'return', 'refund', 'hate', 'terrible', 'stole', 'fraud'];

    if (spamWords.some(w => lower.includes(w))) return 'flagged';
    if (negativeWords.some(w => lower.includes(w))) return 'negative';
    if (positiveWords.some(w => lower.includes(w))) return 'positive';
    return 'neutral';
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{
          role: 'user',
          content: `Analyze the sentiment of this review for an Indian ethnic apparel store. Return exactly one word from these options: 'positive', 'neutral', 'negative', or 'flagged' (for spam, profanity, or scam links). Do not return any other words or punctuation. Review: "${text.replace(/"/g, "'")}"`
        }]
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      const sentiment = data.content[0].text.trim().toLowerCase();
      if (['positive', 'neutral', 'negative', 'flagged'].includes(sentiment)) {
        return sentiment;
      }
    }
    return 'neutral';
  } catch (error) {
    console.error('AI Sentiment Analysis Error:', error);
    return 'neutral';
  }
}

// Helper to recalculate average ratings on a product
async function updateProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', average: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].average * 10) / 10,
      'ratings.count': stats[0].count
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': 0,
      'ratings.count': 0
    });
  }
}

// GET reviews for a product (Storefront - approved only)
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, isApproved: true }).sort({ createdAt: -1 });
    
    // Calculate breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (breakdown[r.rating] !== undefined) {
        breakdown[r.rating]++;
      }
    });

    res.json({ reviews, breakdown });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST submit a review (Customer - requireAuth)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;
    const customerName = req.user.fullName || 'Valued Customer';

    if (!productId || !rating || !comment) {
      return res.status(400).json({ error: 'Product ID, rating, and comment are required.' });
    }

    // Check if customer previously bought this product
    const previousPurchase = await Order.findOne({
      user: userId,
      status: 'delivered',
      'items.product': productId
    });
    
    const isVerified = !!previousPurchase;

    const sentiment = await analyzeSentiment(comment);

    const review = await Review.create({
      product: productId,
      user: userId,
      customerName,
      rating: parseInt(rating),
      comment,
      sentiment,
      isVerified,
      isApproved: false // Requires Admin Moderation
    });

    res.status(201).json({
      message: 'Review submitted successfully! It is pending moderation.',
      review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create a review manually (Admin only)
router.post('/manual', requireAdmin, async (req, res) => {
  try {
    const { productId, rating, comment, customerName, isVerified, isApproved } = req.body;

    if (!productId || !rating || !comment || !customerName) {
      return res.status(400).json({ error: 'Product, rating, comment, and customer name are required.' });
    }

    const sentiment = await analyzeSentiment(comment);

    const review = await Review.create({
      product: productId,
      user: req.user.id,
      customerName,
      rating: parseInt(rating),
      comment,
      sentiment,
      isVerified: !!isVerified,
      isApproved: isApproved !== false
    });

    if (review.isApproved) {
      await updateProductRating(productId);
    }

    res.status(201).json({
      message: 'Manual review created successfully!',
      review
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all reviews (Admin or Public)
router.get('/all', async (req, res) => {
  try {
    const { approved, rating, sentiment } = req.query;
    const query = {};

    // Check if the user is an admin
    let isAdmin = false;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token === 'mock-admin-token') {
        isAdmin = true;
      } else {
        const { supabase } = await import('../middleware/auth.js');
        if (supabase) {
          try {
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user) {
              const dbUser = await User.findOne({ id: user.id });
              if (dbUser && dbUser.role === 'admin') {
                isAdmin = true;
              }
            }
          } catch (_) {}
        }
      }
    }

    if (isAdmin) {
      if (approved !== undefined) {
        query.isApproved = approved === 'true';
      }
      if (sentiment) {
        query.sentiment = sentiment;
      }
    } else {
      // Non-admins can only see approved reviews
      query.isApproved = true;
    }

    if (rating) {
      query.rating = parseInt(rating);
    }

    const reviews = await Review.find(query)
      .populate('product', 'name slug')
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT approve review (Admin)
router.put('/:id/approve', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.isApproved = true;
    await review.save();
    
    // Recalculate product score
    await updateProductRating(review.product);

    res.json({ message: 'Review approved successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT reject/unapprove review (Admin)
router.put('/:id/reject', requireAdmin, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.isApproved = false;
    await review.save();
    
    // Recalculate product score
    await updateProductRating(review.product);

    res.json({ message: 'Review unapproved/rejected successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT admin reply to review (Admin)
router.put('/:id/reply', requireAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.adminReply = reply;
    await review.save();

    res.json({ message: 'Reply added successfully', review });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE review (Admin or Owner)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Must be admin or the reviewer
    if (req.user.role !== 'admin' && review.user !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate rating
    await updateProductRating(productId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
