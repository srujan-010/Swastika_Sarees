import mongoose from 'mongoose';
import { connectDB } from './api/db/db.js';
import { Product } from './api/db/models.js';

async function checkLatestProduct() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Find the product by slug from the user's payload
    const slug = 'new-ajrakh-gajji-crepe-silk-saree';
    let product = await Product.findOne({ slug }).lean();
    
    if (!product) {
       console.log('Product not found in database:', slug);
       // Try getting the latest created product instead
       const latest = await Product.findOne().sort({ createdAt: -1 }).lean();
       if (latest) {
          console.log('\n--- LATEST PRODUCT INSTEAD ---');
          console.log('Name:', latest.name);
          product = latest;
       } else {
         process.exit(0);
       }
    }
    
    console.log('\n--- PRODUCT IN DB ---');
    console.log('Name:', product.name);
    console.log('Slug:', product.slug);
    console.log('mainProduct:', JSON.stringify(product.mainProduct, null, 2));
    console.log('images (root):', JSON.stringify(product.images, null, 2));
    console.log('colorName (root):', product.colorName);
    console.log('colorHex (root):', product.colorHex);
    console.log('variants:', JSON.stringify(product.variants, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkLatestProduct();
