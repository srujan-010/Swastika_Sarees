import { analyzeSupplierText } from './insforge';
import { getProductExtractionPrompt } from './promptTemplates';

export const extractProductDetails = async (supplierText) => {
  if (!supplierText || !supplierText.trim()) {
    throw new Error('Supplier text is empty.');
  }

  const prompt = getProductExtractionPrompt(supplierText);
  
  // Call AI Service
  const responseJson = await analyzeSupplierText(prompt, supplierText);
  
  // Basic validation of the expected schema
  if (!responseJson || !responseJson.extracted || !responseJson.confidence) {
    throw new Error('AI returned an improperly formatted response.');
  }

  return responseJson;
};
