import mongoose from 'mongoose';

const { Schema } = mongoose;

// 1. Address Schema (Reusable)
const AddressSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

// 2. User Schema
const UserSchema = new Schema({
  id: { type: String, required: true, unique: true }, // Maps to Supabase Auth user UUID
  email: { type: String, required: true, unique: true },
  fullName: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  addresses: [AddressSchema],
}, { timestamps: true });

// 3. Category Schema
const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  imageUrl: { type: String },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  subCategories: [{
    name: { type: String, required: true },
    slug: { type: String, required: true },
    imageUrl: { type: String }
  }]
}, { timestamps: true });

// 4. Variant Schema (Nested inside Product)
const VariantSchema = new Schema({
  colorName: { type: String },
  colorHex: { type: String },
  size: { type: String },
  stock: { type: Number, default: 0 },
  extraPricePaise: { type: Number, default: 0 } // Extra price to add to product base price
});

// 5. Image Schema (Nested inside Product)
const ImageSchema = new Schema({
  url: { type: String, required: true },
  altText: { type: String },
  displayOrder: { type: Number, default: 0 },
  isPrimary: { type: Boolean, default: false }
});

// 6. Product Schema
const ProductSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: String },
  description: { type: String },
  fabric: { type: String },
  careInstructions: { type: String },
  occasionTags: [{ type: String }], // e.g. Casual, Festive, Wedding, Party, Daily Wear
  styleTags: [{ type: String }], // e.g. Traditional, Contemporary, Designer, Ethnic
  price: { type: Number, required: true }, // base price in paise (INR * 100)
  originalPrice: { type: Number }, // strikethrough price in paise
  stock: { type: Number, default: 0 },
  weightGrams: { type: Number, default: 500 },
  sku: { type: String },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  isBestseller: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  images: [ImageSchema],
  variants: [VariantSchema],
  seo: {
    metaTitle: { type: String },
    metaDescription: { type: String },
    keywords: [{ type: String }]
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  showSizeChart: { type: Boolean, default: true } // if false, hide size selector on storefront
}, { timestamps: true });

// Index for search optimization
ProductSchema.index({ name: 'text', description: 'text', fabric: 'text', occasionTags: 'text', styleTags: 'text' });
ProductSchema.index({ slug: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ isActive: 1 });

// 7. Order Item Schema (Nested inside Order)
const OrderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // price in paise at time of purchase
  color: { type: String },
  size: { type: String },
  imageUrl: { type: String }
});

// 8. Order Schema
const OrderSchema = new Schema({
  orderId: { type: String, required: true, unique: true }, // SS-10001 format
  user: { type: String, default: 'guest' }, // Supabase Auth User UUID or 'guest'
  items: [OrderItemSchema],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  pricing: {
    subtotal: { type: Number, required: true }, // in paise
    discount: { type: Number, default: 0 }, // in paise (auto-discount, e.g. markdown)
    couponDiscount: { type: Number, default: 0 }, // in paise
    shippingCharge: { type: Number, default: 0 }, // in paise
    total: { type: Number, required: true } // in paise
  },
  couponApplied: { type: String }, // coupon code
  payment: {
    method: { type: String, enum: ['razorpay', 'cod'], required: true },
    transactionId: { type: String }, // Razorpay payment ID
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    refundDetails: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  tracking: {
    courierName: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String }
  },
  internalNotes: { type: String },
  cancelReason: { type: String }
}, { timestamps: true });

OrderSchema.index({ orderId: 1 });
OrderSchema.index({ user: 1 });

// 9. Coupon Schema
const CouponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percentage', 'flat'], required: true },
  value: { type: Number, required: true }, // discount percentage or value in paise
  minOrderValue: { type: Number, default: 0 }, // min order in paise
  maxUses: { type: Number },
  usedCount: { type: Number, default: 0 },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 10. Review Schema
const ReviewSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: String, required: true }, // Supabase Auth User UUID
  customerName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  sentiment: { type: String, enum: ['positive', 'neutral', 'negative', 'flagged'], default: 'neutral' },
  isVerified: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: false },
  adminReply: { type: String }
}, { timestamps: true });

// 11. Banner Schema
const BannerSchema = new Schema({
  title: { type: String },
  subtitle: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  imageUrl: { type: String, required: true },
  displayOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 12. Setting Schema
const SettingSchema = new Schema({
  storeName: { type: String, default: 'Swastika Sarees' },
  storeEmail: { type: String, default: 'contact@swastikasarees.com' },
  storePhone: { type: String, default: '919999999999' },
  currency: { type: String, default: 'INR' },
  taxRate: { type: Number, default: 0 }, // percentage
  freeShippingThreshold: { type: Number, default: 99900 }, // in paise (999 INR)
  flatShippingRate: { type: Number, default: 10000 }, // in paise (100 INR)
  codEnabled: { type: Boolean, default: true },
  codExtraCharge: { type: Number, default: 5000 }, // in paise (50 INR)
  nonServiceablePincodes: [{ type: String }],
  razorpayKeyId: { type: String, default: '' },
  razorpaySecret: { type: String, default: '' },
  defaultMetaTitle: { type: String, default: 'Swastika Sarees' },
  defaultMetaDescription: { type: String, default: 'Shine Bright, Get Your Sparkle On!' },
  googleAnalyticsId: { type: String, default: '' },
  facebookPixelId: { type: String, default: '' },
  instagramUrl: { type: String, default: 'https://instagram.com/swastikasarees_' },
  whatsAppNumber: { type: String, default: '919999999999' },
  returnPolicyText: { type: String, default: 'Easy 7-day returns on unused items.' },
  shippingPolicyText: { type: String, default: 'Free shipping on orders above Rs. 999. Standard delivery in 4-7 business days.' },
  termsConditionsText: { type: String, default: 'Terms and Conditions govern store usage.' },
  deliveryDays: { type: Number, default: 7 }, // expected delivery window in days
  homeCategoryHeading: { type: String, default: 'Shop by Category' },
  homeCategoryDescription: { type: String, default: 'Handcrafted fabrics tailored for festive sparkle, weddings, daily charm, and special moments.' },
  homePromoHeading: { type: String, default: 'Handpicked. Curated. Yours.' },
  homePromoDescription: { type: String, default: 'Unsure of fabric weight, shade match, or sizes? Skip the queue and consult directly with our catalog experts on WhatsApp for product videos, customized sizing checkups, and COD booking services.' },
  homePromoImage1: { type: String, default: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=350' },
  homePromoImage2: { type: String, default: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=350' },
  homePromoImage3: { type: String, default: 'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&q=80&w=350' },
  announcementText: { type: String, default: '🚚 Free shipping on orders above ₹999 | Use code SWASTIKA10 for 10% off your first order | Shipping all over India' },
  announcementActive: { type: Boolean, default: true },
  homeFeaturedHeading: { type: String, default: 'Featured Collection' },
  homeFeaturedSubheading: { type: String, default: 'Premium Wardrobe Curations' },
  homeFeaturedCategory: { type: String, default: '' },
  heroLandingActive: { type: Boolean, default: true },
  heroLandingHeading: { type: String, default: 'Craftsmanship You Can Feel In Every Fold!' },
  heroLandingSubheading: { type: String, default: 'Thoughtfully manufactured for modern Indian women.' },
  heroLandingCtaText: { type: String, default: 'Shop Now' },
  heroLandingCtaLink: { type: String, default: '/shop' },
  heroLandingMediaType: { type: String, enum: ['video', 'images'], default: 'images' },
  heroLandingVideoUrl: { type: String, default: '' },
  heroLandingImages: [{ type: String }]
}, { timestamps: true });

// Prevent model overwrite compiled errors on hot-reloading
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export const Review = mongoose.models.Review || mongoose.model('Review', ReviewSchema);
export const Banner = mongoose.models.Banner || mongoose.model('Banner', BannerSchema);
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
export const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);
