import { Category, Banner, Product, Setting, User, Coupon } from './models.js';

export async function autoSeedDB() {
  try {
    // 1. Seed Store settings if empty
    const settingsCount = await Setting.countDocuments();
    if (settingsCount === 0) {
      await Setting.create({
        storeName: 'Swastika Sarees',
        storeEmail: 'contact@swastikasarees.com',
        storePhone: '919999999999',
        currency: 'INR',
        taxRate: 0,
        freeShippingThreshold: 99900, // ₹999 in paise
        flatShippingRate: 10000, // ₹100 in paise
        codEnabled: true,
        codExtraCharge: 5000, // ₹50 in paise
        nonServiceablePincodes: ['110001', '400001'],
        whatsAppNumber: '919999999999',
        returnPolicyText: 'Easy 7-day returns on unused items. Label tags must remain attached.',
        shippingPolicyText: 'Free shipping on orders above ₹999. Deliveries completed in 4-7 business days.'
      });
      console.log('Seeded default store settings.');
    }

    // 2. Seed Homepage Banners if empty
    const bannersCount = await Banner.countDocuments();
    if (bannersCount === 0) {
      await Banner.create([
        {
          title: 'Royal Banarasi Silk Collection',
          subtitle: 'Drape yourself in royal heritage. Crafted by master weavers of Varanasi.',
          ctaText: 'Shop Sarees',
          ctaLink: '/shop?category=sarees',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1200',
          displayOrder: 1,
          isActive: true
        },
        {
          title: 'Trendy Designer Kurtis',
          subtitle: 'Lightweight, vibrant, and elegant. Shine bright this festive season!',
          ctaText: 'Shop Kurtis',
          ctaLink: '/shop?category=kurtis',
          imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=1200',
          displayOrder: 2,
          isActive: true
        }
      ]);
      console.log('Seeded default homepage banners.');
    }

    // 3. Seed Categories if empty
    const categoriesCount = await Category.countDocuments();
    let sareeCatId, kurtiCatId, suitCatId, accessCatId;
    
    if (categoriesCount === 0) {
      const cats = await Category.create([
        {
          name: 'Sarees',
          slug: 'sarees',
          description: 'Luxurious Banarasi, Kanchipuram, and chiffon sarees.',
          imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=450',
          displayOrder: 1,
          isActive: true
        },
        {
          name: 'Kurtis',
          slug: 'kurtis',
          description: 'Elegant daily wear and festive kurtis.',
          imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=450',
          displayOrder: 2,
          isActive: true
        },
        {
          name: 'Dress Materials',
          slug: 'dress-materials',
          description: 'Premium unstitched salwar suits and handblock printed dress bundles.',
          imageUrl: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=450',
          displayOrder: 3,
          isActive: true
        },
        {
          name: 'Accessories',
          slug: 'accessories',
          description: 'Fashion jewelry, kundan earrings, and matching bags.',
          imageUrl: 'https://images.unsplash.com/photo-1598530028795-0e68f863a8a3?auto=format&fit=crop&q=80&w=450',
          displayOrder: 4,
          isActive: true
        }
      ]);
      sareeCatId = cats[0]._id;
      kurtiCatId = cats[1]._id;
      suitCatId = cats[2]._id;
      accessCatId = cats[3]._id;
      console.log('Seeded default categories.');
    } else {
      const cats = await Category.find();
      sareeCatId = cats.find(c => c.slug === 'sarees')?._id;
      kurtiCatId = cats.find(c => c.slug === 'kurtis')?._id;
      suitCatId = cats.find(c => c.slug === 'dress-materials')?._id;
      accessCatId = cats.find(c => c.slug === 'accessories')?._id;
    }

    // 4. Seed Products if empty
    const productsCount = await Product.countDocuments();
    if (productsCount === 0 && sareeCatId && kurtiCatId) {
      await Product.create([
        {
          name: 'Royal Banarasi Katan Silk Saree',
          slug: 'royal-banarasi-katan-silk-saree',
          category: sareeCatId,
          description: '<p>Wrap yourself in royal heritage. Crafted by master weavers of Varanasi, this Katan Silk saree is detailed with opulent gold zari floral borders and a rich brocade pallu.</p>',
          fabric: 'Katan Silk',
          careInstructions: 'Dry clean only to maintain zari gold weaves shine.',
          occasionTags: ['Wedding', 'Festive'],
          styleTags: ['Traditional', 'Ethnic'],
          price: 499900, // ₹4999 in paise
          originalPrice: 799900, // ₹7999 in paise
          stock: 12,
          sku: 'SWASTIKA-BNS-01',
          isActive: true,
          isFeatured: true,
          isBestseller: true,
          images: [
            { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500', altText: 'Banarasi Silk Red Saree', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=500', altText: 'Saree pallu close' }
          ],
          variants: [
            { colorName: 'Vermillion Red', colorHex: '#8B1A1A', size: 'Free Size', stock: 6, extraPricePaise: 0 },
            { colorName: 'Antique Gold', colorHex: '#C8832A', size: 'Free Size', stock: 6, extraPricePaise: 0 }
          ],
          ratings: { average: 5, count: 1 }
        },
        {
          name: 'Kanchipuram Pure Brocade Silk Saree',
          slug: 'kanchipuram-pure-brocade-silk-saree',
          category: sareeCatId,
          description: '<p>A majestic addition to your wedding wardrobe. Featuring handwoven pure gold zari motifs, structured motifs, and pure silk fabric with contrasting pallu trim.</p>',
          fabric: 'Pure Mulberry Silk',
          careInstructions: 'Dry clean only. Store wrapped in cotton cloth.',
          occasionTags: ['Wedding', 'Festive'],
          styleTags: ['Traditional', 'Ethnic', 'Designer'],
          price: 849900, // ₹8499 in paise
          originalPrice: 1299900, // ₹12999 in paise
          stock: 8,
          sku: 'SWASTIKA-KPM-02',
          isActive: true,
          isFeatured: true,
          isNewArrival: true,
          images: [
            { url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=500', altText: 'Kanchipuram Saree Brocade', isPrimary: true },
            { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500', altText: 'Saree detailed pleats' }
          ],
          variants: [
            { colorName: 'Rani Pink', colorHex: '#ED64A6', size: 'Free Size', stock: 4, extraPricePaise: 0 },
            { colorName: 'Royal Purple', colorHex: '#805AD5', size: 'Free Size', stock: 4, extraPricePaise: 0 }
          ],
          ratings: { average: 4.8, count: 2 }
        },
        {
          name: 'Festive Georgette Flared Anarkali Kurti',
          slug: 'festive-georgette-flared-anarkali-kurti',
          category: kurtiCatId,
          description: '<p>Lightweight, flared, and elegant. This beautiful georgette Anarkali kurti is detailed with floral prints, sequin neck borders, and includes a matching net dupatta.</p>',
          fabric: 'Faux Georgette',
          careInstructions: 'Gentle hand wash inside out.',
          occasionTags: ['Casual', 'Festive', 'Party'],
          styleTags: ['Contemporary', 'Ethnic'],
          price: 149900, // ₹1499 in paise
          originalPrice: 249900, // ₹2499 in paise
          stock: 25,
          sku: 'SWASTIKA-KURTI-03',
          isActive: true,
          isFeatured: true,
          isNewArrival: true,
          isBestseller: true,
          images: [
            { url: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=500', altText: 'Anarkali Kurti display', isPrimary: true }
          ],
          variants: [
            { colorName: 'Mustard Yellow', colorHex: '#ECC94B', size: 'S', stock: 5, extraPricePaise: 0 },
            { colorName: 'Mustard Yellow', colorHex: '#ECC94B', size: 'M', stock: 5, extraPricePaise: 0 },
            { colorName: 'Mustard Yellow', colorHex: '#ECC94B', size: 'L', stock: 5, extraPricePaise: 0 },
            { colorName: 'Teal Green', colorHex: '#38A169', size: 'S', stock: 5, extraPricePaise: 0 },
            { colorName: 'Teal Green', colorHex: '#38A169', size: 'M', stock: 5, extraPricePaise: 0 }
          ],
          ratings: { average: 5, count: 1 }
        },
        {
          name: 'Handblock Printed Unstitched Cotton Suit Set',
          slug: 'handblock-printed-unstitched-cotton-suit-set',
          category: suitCatId,
          description: '<p>Unstitched premium cotton suit set. Features organic handblock printed patterns from Jaipur, matching solid bottom material, and lightweight mulmul dupatta.</p>',
          fabric: '100% Organic Cotton',
          careInstructions: 'Hand wash with mild detergent.',
          occasionTags: ['Casual', 'Daily Wear'],
          styleTags: ['Traditional', 'Ethnic'],
          price: 189900, // ₹1899 in paise
          originalPrice: 299900, // ₹2999 in paise
          stock: 15,
          sku: 'SWASTIKA-DRESS-04',
          isActive: true,
          isFeatured: false,
          isBestseller: true,
          images: [
            { url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500', altText: 'Unstitched Suit Pack', isPrimary: true }
          ],
          variants: [
            { colorName: 'Indigo Blue', colorHex: '#3182CE', size: 'Free Size', stock: 10, extraPricePaise: 0 },
            { colorName: 'Ivory Cream', colorHex: '#FFF8F0', size: 'Free Size', stock: 5, extraPricePaise: 0 }
          ],
          ratings: { average: 0, count: 0 }
        },
        {
          name: 'Kundan Heavy Chandelier Jhumka Earrings',
          slug: 'kundan-heavy-chandelier-jhumka-earrings',
          category: accessCatId,
          description: '<p>Opulent Kundan Jhumka detailed with fine handworked pearls, floral gold plating, and matching hooks. Lightweight and perfect for wedding celebrations.</p>',
          fabric: 'Brass Alloy & Kundan Stones',
          careInstructions: 'Keep away from moisture and sprays. Store in ziplock pouch.',
          occasionTags: ['Wedding', 'Festive', 'Party'],
          styleTags: ['Traditional', 'Designer'],
          price: 89900, // ₹899 in paise
          originalPrice: 149900, // ₹1499 in paise
          stock: 30,
          sku: 'SWASTIKA-JHUMKA-05',
          isActive: true,
          isFeatured: true,
          isNewArrival: true,
          images: [
            { url: 'https://images.unsplash.com/photo-1598530028795-0e68f863a8a3?auto=format&fit=crop&q=80&w=500', altText: 'Pearl Kundan Jhumkas', isPrimary: true }
          ],
          variants: [
            { colorName: 'Emerald Green', colorHex: '#38A169', size: 'Free Size', stock: 15, extraPricePaise: 0 },
            { colorName: 'Ruby Red', colorHex: '#E53E3E', size: 'Free Size', stock: 15, extraPricePaise: 0 }
          ],
          ratings: { average: 4.5, count: 2 }
        }
      ]);
      console.log('Seeded default boutique products catalog.');
    }

    // 5. Seed one active test coupon code if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.create({
        code: 'SWASTIKA10',
        type: 'percentage',
        value: 10,
        minOrderValue: 99900, // ₹999 in paise
        maxUses: 100,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true
      });
      console.log('Seeded SWASTIKA10 coupon code.');
    }

  } catch (error) {
    console.error('Failed to auto-seed database:', error);
  }
}
