import React from 'react';
import { X } from 'lucide-react';

const SIZES = ['Free Size', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

export default function ProductSizeEditor({ sizes = [], onChange }) {
  
  const handleSizeChange = (sIdx, field, value) => {
    const newSizes = [...sizes];
    newSizes[sIdx] = { ...newSizes[sIdx], [field]: value };
    onChange(newSizes);
  };

  const addSizeRow = () => {
    onChange([...sizes, { size: 'Free Size', stock: 10, extraPricePaise: 0, variantSku: '' }]);
  };

  const removeSizeRow = (sIdx) => {
    onChange(sizes.filter((_, i) => i !== sIdx));
  };

  return (
    <div className="w-full bg-white border border-brand-border/60 rounded-lg overflow-hidden shadow-xs mt-3 mb-4">
      <div className="bg-brand-cream/30 px-3 py-2 border-b border-brand-border/60 flex items-center justify-between">
        <span className="text-[10px] font-bold text-brand-dark uppercase tracking-wider">Sizes & Stock</span>
        <span className="text-[10px] font-semibold text-brand-muted/70">{sizes.length} variants</span>
      </div>
      {sizes.length > 0 && (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-brand-cream/10 border-b border-brand-border/60 text-[10px] uppercase font-bold text-brand-muted tracking-wider">
              <th className="px-3 py-2 text-left">Size</th>
              <th className="px-3 py-2 text-left">Stock</th>
              <th className="px-3 py-2 text-left">Extra Price (₹)</th>
              <th className="px-3 py-2 text-left">SKU</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/60 text-xs">
            {sizes.map((s, sIdx) => (
              <tr key={sIdx} className="bg-brand-white hover:bg-brand-cream/10 transition-colors">
                <td className="px-3 py-2">
                  <select 
                    value={s.size || ''} 
                    onChange={(e) => handleSizeChange(sIdx, 'size', e.target.value)} 
                    className="w-full bg-transparent border-none focus:outline-none cursor-pointer font-semibold text-brand-dark"
                  >
                    {SIZES.map(sz => <option key={sz} value={sz}>{sz}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input 
                    type="number" 
                    value={s.stock ?? 0} 
                    onChange={(e) => handleSizeChange(sIdx, 'stock', parseInt(e.target.value) || 0)} 
                    className="w-16 bg-brand-cream/30 border border-brand-border rounded px-2 py-1 focus:outline-none focus:border-brand-gold transition-colors" 
                    required 
                  />
                </td>
                <td className="px-3 py-2">
                  <input 
                    type="number" 
                    step="0.01" 
                    value={s.extraPricePaise ? s.extraPricePaise / 100 : ''} 
                    onChange={(e) => handleSizeChange(sIdx, 'extraPricePaise', Math.round(parseFloat(e.target.value) * 100) || 0)} 
                    className="w-20 bg-brand-cream/30 border border-brand-border rounded px-2 py-1 focus:outline-none focus:border-brand-gold transition-colors" 
                    placeholder="0" 
                  />
                </td>
                <td className="px-3 py-2">
                  <input 
                    type="text" 
                    value={s.variantSku || ''} 
                    onChange={(e) => handleSizeChange(sIdx, 'variantSku', e.target.value)} 
                    className="w-full bg-brand-cream/30 border border-brand-border rounded px-2 py-1 focus:outline-none focus:border-brand-gold transition-colors" 
                    placeholder="SKU" 
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <button type="button" onClick={() => removeSizeRow(sIdx)} className="text-brand-crimson/70 hover:text-brand-crimson p-1 transition-colors"><X size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button type="button" onClick={addSizeRow} className="w-full text-center py-2 text-[10px] font-bold text-brand-dark uppercase bg-brand-cream/30 hover:bg-brand-gold/10 transition-colors border-t border-brand-border/60">
        + Add Size
      </button>
    </div>
  );
}
