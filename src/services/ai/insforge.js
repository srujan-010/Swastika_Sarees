import { callOpenRouter } from './openrouter';

/**
 * InsForge Service Wrapper
 * This acts as the centralized AI service router. Currently, it delegates to OpenRouter.
 * Future modifications (like sending observability metrics or using an InsForge-specific SDK)
 * can be implemented here without changing the rest of the application.
 */

export const analyzeSupplierText = async (systemPrompt, supplierText) => {
  // We can inject InsForge specific tracking headers or SDK calls here in the future.
  
  // For now, delegate to OpenRouter
  return await callOpenRouter(systemPrompt, supplierText);
};
