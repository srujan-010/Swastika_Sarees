import { connectDB } from './api/db/db.js';
import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function checkDB() {
  await connectDB();
  console.log("Connected to DB");
  
  const lastProduct = await Product.findOne().sort({ updatedAt: -1 });
  if (lastProduct) {
    console.log("LAST SAVED PRODUCT:");
    console.log(JSON.stringify(lastProduct, null, 2));
    console.log("\n--- SCHEMA CHECK ---");
    console.log("Root images:", lastProduct.images?.length);
    console.log("Root colorName:", lastProduct.colorName);
    console.log("Root colorHex:", lastProduct.colorHex);
    
    if (lastProduct.variants && lastProduct.variants.length > 0) {
      console.log("Variant images:", lastProduct.variants[0].images?.length);
      console.log("Variant colorName:", lastProduct.variants[0].colorName);
      console.log("Variant colorHex:", lastProduct.variants[0].colorHex);
    }
  } else {
    console.log("No product found");
  }
  
  mongoose.disconnect();
}

checkDB().catch(console.error);
