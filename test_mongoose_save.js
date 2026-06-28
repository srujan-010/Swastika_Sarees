import mongoose from 'mongoose';
import { connectDB } from './api/db/db.js';
import { Product } from './api/db/models.js';

async function testVariantSave() {
  await connectDB();
  
  // Create a mock product directly via Mongoose
  const product = new Product({
    name: "Test Saree",
    slug: "test-saree-" + Date.now(),
    category: new mongoose.Types.ObjectId(),
    price: 1000,
    colorName: "Red",
    colorHex: "#FF0000",
    images: [{ url: "main1.jpg", isPrimary: true }],
    variants: [
      {
        colorName: "Blue",
        colorHex: "#0000FF",
        images: [{ url: "blue1.jpg", isPrimary: true }]
      }
    ]
  });

  const saved = await product.save();
  console.log("SAVED PRODUCT FROM MONGOOSE:");
  console.log(JSON.stringify(saved, null, 2));

  // Now test updating via API-like mongoose update
  const updatedData = {
    variants: [
      {
        colorName: "Green",
        colorHex: "#00FF00",
        images: [{ url: "green1.jpg", isPrimary: true }]
      }
    ]
  };

  const updated = await Product.findByIdAndUpdate(saved._id, updatedData, { new: true, runValidators: true });
  console.log("\nUPDATED PRODUCT FROM MONGOOSE:");
  console.log(JSON.stringify(updated, null, 2));
  
  mongoose.disconnect();
}

testVariantSave().catch(console.error);
