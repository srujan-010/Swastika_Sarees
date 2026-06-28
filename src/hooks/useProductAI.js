import { useState } from 'react';
import { extractProductDetails } from '../services/ai/productExtraction';

const LOADING_STAGES = [
  "✨ Reading Supplier Details...",
  "🧵 Identifying Fabric & Style...",
  "🏷 Detecting Smart Categories...",
  "🧠 Generating Premium Description...",
  "📦 Filling Product Form..."
];

export const useProductAI = () => {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const generateDetails = async (supplierText) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    // Start loading animation intervals
    let stageIndex = 0;
    setLoadingStage(LOADING_STAGES[0]);
    
    const stageInterval = setInterval(() => {
      stageIndex = Math.min(stageIndex + 1, LOADING_STAGES.length - 1);
      setLoadingStage(LOADING_STAGES[stageIndex]);
    }, 1500); // Progress stage every 1.5s while waiting

    try {
      const data = await extractProductDetails(supplierText);
      clearInterval(stageInterval);
      setLoadingStage('');
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      return data;
    } catch (err) {
      clearInterval(stageInterval);
      setLoadingStage('');
      setLoading(false);
      setError(err.message || 'Unable to analyze supplier message. Please try again.');
      return null;
    }
  };

  const clearState = () => {
    setError(null);
    setSuccess(false);
    setLoading(false);
    setLoadingStage('');
  };

  return {
    generateDetails,
    loading,
    loadingStage,
    error,
    success,
    clearState
  };
};
