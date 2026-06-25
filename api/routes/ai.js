import express from 'express';
import { Product, Category } from '../db/models.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Helper to get compact catalog string for AI prompt
async function getCatalogContext() {
  try {
    const products = await Product.find({ isActive: true }).populate('category').limit(50);
    return products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      slug: p.slug,
      category: p.category?.name || 'Apparel',
      price: (p.price / 100).toFixed(0),
      fabric: p.fabric || 'Fabric',
      tags: [...(p.occasionTags || []), ...(p.styleTags || [])].join(', '),
      stock: p.stock
    }));
  } catch (error) {
    console.error('Error fetching catalog for AI:', error);
    return [];
  }
}

// 1. POST AI Product Description Generator (Admin)
router.post('/generate-description', requireAdmin, async (req, res) => {
  const { name, category, fabric, occasionTags, styleTags } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Product name is required for generation' });
  }

  const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Return high-quality Mock Description
    const occ = occasionTags && occasionTags.length ? occasionTags.join(', ') : 'festive celebrations';
    const st = styleTags && styleTags.length ? styleTags.join(' and ') : 'traditional';
    const fab = fabric || 'premium fabric';
    
    const mockDescription = `
      <p>Elevate your wardrobe with the elegant <strong>${name}</strong>, a true masterpiece from Swastika Sarees. Exquisitely crafted from ${fab}, this apparel combines luxurious textures with standard traditional craftsmanship.</p>
      <p>Perfect for ${occ}, it features a stunning design that highlights ${st} aesthetics. Designed for the modern Indian woman who loves to shine bright and make a lasting impression.</p>
      <p><strong>Product Highlights:</strong></p>
      <ul>
        <li><strong>Fabric:</strong> Premium ${fab}</li>
        <li><strong>Style:</strong> ${st} Indian ethnic wear</li>
        <li><strong>Occasion:</strong> Perfect for ${occ}</li>
        <li><strong>Care Instructions:</strong> Dry clean recommended to preserve the rich texture and shine.</li>
      </ul>
    `.trim();

    return res.json({ description: mockDescription });
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
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 600,
        messages: [{
          role: 'user',
          content: `Write a luxurious, warm, and feminine product description in HTML format (using tags like <p>, <strong>, <ul>, <li>) for an Indian boutique store called "Swastika Sarees".
          Here are the product details:
          - Product Name: ${name}
          - Category: ${category || 'Indian Ethnic Wear'}
          - Fabric: ${fabric || 'Premium Silk'}
          - Occasions: ${occasionTags ? occasionTags.join(', ') : 'All Festive Events'}
          - Style Tags: ${styleTags ? styleTags.join(', ') : 'Traditional'}
          
          Include an introductory paragraph, key style highlights in a list, and a closing tag recommending it as a premium wardrobe addition. Do not include page layout headers or wrapper elements.`
        }]
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      return res.json({ description: data.content[0].text });
    }
    throw new Error('Invalid Claude API response structure');
  } catch (error) {
    console.error('AI Description Generation Error:', error);
    res.status(500).json({ error: 'AI generation failed. Please try again or edit description manually.' });
  }
});

// 2. POST AI Style Assistant Chat (Storefront)
router.post('/style-assistant', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages history array is required.' });
  }

  const catalog = await getCatalogContext();
  const apiKey = process.env.VITE_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  const userMessage = messages[messages.length - 1]?.content || '';

  // Standard Mock Fallback Assistant if key is missing or calls fail
  if (!apiKey) {
    const lowerMessage = userMessage.toLowerCase();
    let replyText = "Hello! I'm Swastika's Style Assistant 👗. I'd love to help you find the perfect outfit.";
    let recommendedIds = [];

    // Simple keyword checking matching local catalog database
    if (lowerMessage.includes('saree') || lowerMessage.includes('sari')) {
      replyText = "Sarees are our absolute specialty! We have beautiful choices. Here are some of our finest active sarees. Do you prefer a particular fabric like Silk or Chiffon?";
      const matches = catalog.filter(p => p.category.toLowerCase().includes('saree') || p.name.toLowerCase().includes('saree')).slice(0, 3);
      recommendedIds = matches.map(m => m.id);
    } else if (lowerMessage.includes('kurti') || lowerMessage.includes('kurta')) {
      replyText = "Our Kurti collection is trendy, elegant, and perfect for daily wear or celebrations. Here are some options that are currently in stock:";
      const matches = catalog.filter(p => p.category.toLowerCase().includes('kurti') || p.name.toLowerCase().includes('kurta') || p.name.toLowerCase().includes('kurti')).slice(0, 3);
      recommendedIds = matches.map(m => m.id);
    } else if (lowerMessage.includes('wedding') || lowerMessage.includes('festive') || lowerMessage.includes('party')) {
      replyText = "For grand celebrations, I highly recommend our designer wedding collection featuring rich embroidery and gold weaves. Take a look at these featured outfits:";
      const matches = catalog.filter(p => p.tags.toLowerCase().includes('wedding') || p.tags.toLowerCase().includes('festive') || p.name.toLowerCase().includes('banarasi') || p.name.toLowerCase().includes('silk')).slice(0, 3);
      recommendedIds = matches.map(m => m.id);
    } else if (lowerMessage.includes('cheap') || lowerMessage.includes('under') || lowerMessage.includes('price') || lowerMessage.includes('budget')) {
      // Find items under 2000 or lowest price
      let limit = 2000;
      const numMatch = lowerMessage.match(/\d+/);
      if (numMatch) limit = parseInt(numMatch[0]);

      replyText = `Absolutely! Here are some beautiful options from our budget collection under ₹${limit} that offer great value:`;
      const matches = catalog.filter(p => parseInt(p.price) <= limit).slice(0, 3);
      recommendedIds = matches.map(m => m.id);
    } else {
      replyText = "I would recommend exploring our bestseller collection, curated with traditional craftsmanship and contemporary style. Let me know if you are dressing up for a wedding, a casual outing, or looking for accessories!";
      const matches = catalog.slice(0, 3);
      recommendedIds = matches.map(m => m.id);
    }

    // Retrieve full product database rows for recommendations
    const matchingProducts = await Product.find({ _id: { $in: recommendedIds } }).populate('category');

    return res.json({
      message: replyText,
      recommendations: matchingProducts
    });
  }

  try {
    const compactCatalogString = JSON.stringify(catalog);
    const systemPrompt = `You are Swastika's Style Assistant, an expert fashion consultant and personal stylist for "Swastika Sarees", a premium Indian ethnic wear brand.
    Your goal is to guide customers, offer styling tips (e.g. what jewelry to wear with a Banarasi saree), and suggest specific products.
    
    Here is our current store catalog (JSON format):
    ${compactCatalogString}
    
    Guidelines:
    1. Respond in a warm, polite, elegant, and helpful Indian hostess tone.
    2. Suggest only active catalog products when answering customer queries.
    3. Return your main stylist advice in natural markdown.
    4. At the very end of your response, write a separate block listing the IDs of recommended products in JSON array format inside double curly brackets, exactly like: {{RECOMMENDATIONS: ["id1", "id2"]}}. Do not list more than 3 recommendations. If no specific products match, omit this block.
    
    Example output format:
    "For your sister's wedding, a Banarasi Silk saree is a majestic choice. Pair it with temple jewelry...
    
    {{RECOMMENDATIONS: ["65f12345678901234567890a"]}}"`;

    const claudeMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 500,
        system: systemPrompt,
        messages: claudeMessages
      })
    });

    const data = await response.json();
    if (data.content && data.content[0] && data.content[0].text) {
      const fullText = data.content[0].text;
      
      // Parse recommendations block
      let message = fullText;
      let recommendedIds = [];
      const jsonBlockRegex = /\{\{RECOMMENDATIONS:\s*(\[.*?\])\s*\}\}/;
      const match = fullText.match(jsonBlockRegex);
      
      if (match) {
        try {
          recommendedIds = JSON.parse(match[1]);
          message = fullText.replace(jsonBlockRegex, '').trim();
        } catch (e) {
          console.error('Failed parsing recommendations JSON from AI response', e);
        }
      }

      // Fetch actual matching products from DB
      const matchingProducts = await Product.find({ _id: { $in: recommendedIds } }).populate('category');

      return res.json({
        message,
        recommendations: matchingProducts
      });
    }
    throw new Error('Invalid Claude API response structure');
  } catch (error) {
    console.error('AI Style Assistant Error:', error);
    // Silent fallback to standard mock responses if API error occurs
    const matches = catalog.slice(0, 3).map(m => m.id);
    const matchingProducts = await Product.find({ _id: { $in: matches } }).populate('category');
    res.json({
      message: "I am having minor trouble connecting to our digital stylist brain, but I still highly recommend browsing our beautiful bestseller collection of handpicked sarees and kurtis:",
      recommendations: matchingProducts
    });
  }
});

export default router;
