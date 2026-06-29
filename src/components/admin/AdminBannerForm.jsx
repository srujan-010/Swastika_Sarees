import React, { useState, useEffect } from 'react';
import { useModalStore } from '../../store/modalStore';
import { X, Check, Image as ImageIcon, Upload, LayoutTemplate, AlignLeft, AlignRight, AlignCenter, Maximize, Circle, Waves, Sparkles, Droplets } from 'lucide-react';
import BannerPreview from './BannerPreview';

export default function AdminBannerForm({ isOpen, onClose, initialData, onSave, token }) {
  const [formData, setFormData] = useState({
    type: 'custom',
    title: '',
    subtitle: '',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    imageUrl: '',
    layout: 'left-image',
    background: 'white-premium',
    backgroundImage: '',
    decorativeTheme: 'none',
    displayOrder: 0,
    isActive: true,
    // Hidden defaults to maintain frontend compatibility
    gradientOverlay: 'none',
    textAlignment: 'left',
    badge: '',
    overrideTitle: '',
    overrideSubtitle: '',
    secondaryButtonText: '',
    secondaryButtonLink: ''
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isBgUploading, setIsBgUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          type: 'custom', // Force custom
          title: initialData.title || initialData.overrideTitle || (initialData.productId?.name) || '',
          subtitle: initialData.subtitle || initialData.overrideSubtitle || '',
          ctaText: initialData.ctaText || 'Shop Now',
          ctaLink: initialData.ctaLink || '/shop',
          imageUrl: initialData.imageUrl || initialData.selectedImage || '',
          layout: initialData.layout || 'left-image',
          background: initialData.background || 'white-premium',
          backgroundImage: initialData.backgroundImage || '',
          decorativeTheme: initialData.decorativeTheme || 'none',
          displayOrder: initialData.displayOrder || 0,
          isActive: initialData.isActive !== false,
          gradientOverlay: initialData.gradientOverlay || 'none',
          textAlignment: initialData.textAlignment || 'left',
          badge: initialData.badge || '',
          overrideTitle: initialData.overrideTitle || '',
          overrideSubtitle: initialData.overrideSubtitle || '',
          secondaryButtonText: initialData.secondaryButtonText || '',
          secondaryButtonLink: initialData.secondaryButtonLink || ''
        });
      } else {
        setFormData({
          type: 'custom',
          title: '',
          subtitle: '',
          ctaText: 'Shop Now',
          ctaLink: '/shop',
          imageUrl: '',
          layout: 'left-image',
          background: 'premium-beige-gradient',
          backgroundImage: '',
          decorativeTheme: 'none',
          displayOrder: 0,
          isActive: true,
          gradientOverlay: 'none',
          textAlignment: 'left',
          badge: '',
          overrideTitle: '',
          overrideSubtitle: '',
          secondaryButtonText: '',
          secondaryButtonLink: ''
        });
      }
    }
  }, [isOpen, initialData]);

  // Update text alignment automatically based on layout
  useEffect(() => {
    if (formData.layout === 'center' || formData.layout === 'full-width') {
      setFormData(prev => ({ ...prev, textAlignment: 'center' }));
    } else if (formData.layout === 'right-image') {
      setFormData(prev => ({ ...prev, textAlignment: 'left' }));
    } else if (formData.layout === 'left-image') {
      setFormData(prev => ({ ...prev, textAlignment: 'left' }));
    }
  }, [formData.layout]);

  const handleImageUpload = async (file, isBg = false) => {
    if (!file) return;
    isBg ? setIsBgUploading(true) : setIsUploading(true);
    const data = new FormData();
    data.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const resData = await res.json();
      if (res.ok && resData.url) {
        if (isBg) {
          setFormData({ ...formData, backgroundImage: resData.url });
        } else {
          setFormData({ ...formData, imageUrl: resData.url });
        }
      } else {
        useModalStore.getState().error('Upload Failed', resData.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error(err);
      useModalStore.getState().error('Upload Error', 'Failed to upload image');
    } finally {
      isBg ? setIsBgUploading(false) : setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      useModalStore.getState().info('Information', 'Banner Image is required.');
      return;
    }
    if (formData.background === 'transparent' && !formData.backgroundImage) {
      useModalStore.getState().info('Information', 'Custom Background Image is required when Custom Image style is selected.');
      return;
    }

    const method = initialData ? 'PUT' : 'POST';
    const endpoint = initialData ? `/api/banners/${initialData._id}` : '/api/banners';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        onSave();
        onClose();
      } else {
        const err = await res.json();
        useModalStore.getState().error('Error', err.error || 'Banner save failed');
      }
    } catch (err) {
      console.error(err);
      useModalStore.getState().error('Error', 'Network error occurred.');
    }
  };

  if (!isOpen) return null;

  const bgOptions = [
    { id: 'white-premium', label: 'Premium White', color: 'bg-white border-gray-200' },
    { id: 'premium-beige-gradient', label: 'Warm Beige', color: 'bg-[#F4ECE1] border-[#EAD9C0]' },
    { id: 'golden-ambient-lighting', label: 'Soft Gold', color: 'bg-[#EAD9C0] border-[#D4AF37]' },
    { id: 'dark-luxury', label: 'Dark Luxury', color: 'bg-[#1A1A1A] border-gray-800 text-white' },
    { id: 'transparent', label: 'Custom Image', color: 'bg-gradient-to-tr from-gray-100 to-gray-200 border-gray-300' }
  ];

  const layoutOptions = [
    { id: 'left-image', label: 'Right Text + Left Image', icon: <AlignRight size={20} className="mb-2 opacity-70" /> },
    { id: 'right-image', label: 'Left Text + Right Image', icon: <AlignLeft size={20} className="mb-2 opacity-70" /> },
    { id: 'center', label: 'Center Content', icon: <AlignCenter size={20} className="mb-2 opacity-70" /> },
    { id: 'full-width', label: 'Full Width', icon: <Maximize size={20} className="mb-2 opacity-70" /> }
  ];

  const decorOptions = [
    { id: 'none', label: 'None', icon: <X size={18} /> },
    { id: 'luxury-circles', label: 'Luxury Circle', icon: <Circle size={18} /> },
    { id: 'abstract-curves', label: 'Soft Curves', icon: <Waves size={18} /> },
    { id: 'floral-watermark', label: 'Floating Shapes', icon: <Sparkles size={18} /> },
    { id: 'soft-bokeh-lighting', label: 'Glass Effect', icon: <Droplets size={18} /> },
    { id: 'gold-accent-lines', label: 'Premium Waves', icon: <Waves size={18} /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative bg-[#F9F9F9] rounded-2xl w-full max-w-[1400px] h-[90vh] shadow-2xl z-10 flex overflow-hidden font-sans flex-col md:flex-row">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className="w-full md:w-[50%] lg:w-[45%] flex flex-col h-full bg-white border-r border-gray-200 shadow-sm relative z-20">
          
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <div>
              <h2 className="font-display font-semibold text-2xl text-gray-900 tracking-tight">
                {initialData ? 'Edit Banner' : 'Create Banner'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">Design your premium homepage experience.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-400"/></button>
          </div>
          
          <div className="p-8 overflow-y-auto flex-grow space-y-10 custom-scrollbar">
            
            {/* SECTION 1: CONTENT */}
            <section className="space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">1</div>
                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Banner Content</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Banner Title</label>
                  <input type="text" placeholder="e.g. Premium Silk Collection" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all" />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-2">Subtitle / Description</label>
                  <textarea rows={2} placeholder="Short elegant description..." value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Primary Button Text</label>
                    <input type="text" placeholder="Shop Now" value={formData.ctaText} onChange={e => setFormData({...formData, ctaText: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-2">Primary Button Link</label>
                    <input type="text" placeholder="/shop" value={formData.ctaLink} onChange={e => setFormData({...formData, ctaLink: e.target.value})} className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all" />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: IMAGE */}
            <section className="space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">2</div>
                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Banner Image</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                {!formData.imageUrl ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                        <Upload size={20} className="text-gray-500" />
                      </div>
                      <p className="mb-2 text-sm text-gray-600 font-medium"><span className="text-black font-semibold">Click to upload</span> or drag and drop</p>
                      <p className="text-xs text-gray-400">PNG, JPG or WEBP (Max 5MB)</p>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} disabled={isUploading} />
                  </label>
                ) : (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-[16/9] sm:aspect-video">
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Banner" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4 backdrop-blur-sm">
                      <label className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg cursor-pointer hover:bg-gray-100 transition-colors shadow-lg">
                        Replace
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e.target.files?.[0])} disabled={isUploading} />
                      </label>
                      <button onClick={() => setFormData({...formData, imageUrl: ''})} className="px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-red-600 transition-colors shadow-lg">
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 flex items-center">
                  <div className="h-px bg-gray-200 flex-grow"></div>
                  <span className="px-3 text-xs text-gray-400 font-medium uppercase tracking-wider">OR PASTE URL</span>
                  <div className="h-px bg-gray-200 flex-grow"></div>
                </div>
                <input 
                  type="text" 
                  placeholder="https://..." 
                  value={formData.imageUrl} 
                  onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                  className="w-full mt-4 bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm" 
                />
              </div>
            </section>

            {/* SECTION 3: BACKGROUND */}
            <section className="space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">3</div>
                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Background</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {bgOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => setFormData({...formData, background: opt.id})}
                    className={`cursor-pointer rounded-xl p-4 border-2 transition-all flex flex-col items-center justify-center text-center space-y-2 h-24 ${formData.background === opt.id ? 'border-black shadow-md scale-[1.02]' : 'border-transparent hover:border-gray-200'} ${opt.color}`}
                  >
                    <span className="text-sm font-semibold tracking-tight">{opt.label}</span>
                    {formData.background === opt.id && <Check size={16} className={opt.id === 'dark-luxury' ? 'text-white' : 'text-black'} />}
                  </div>
                ))}
              </div>
              
              {formData.background === 'transparent' && (
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm mt-3 animate-fade-in">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">Custom Background Image</label>
                  <div className="flex space-x-3">
                    <input 
                      type="text" 
                      placeholder="Paste image URL here" 
                      value={formData.backgroundImage} 
                      onChange={e => setFormData({...formData, backgroundImage: e.target.value})} 
                      className="flex-grow bg-gray-50 border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all text-sm" 
                    />
                    <label className="bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-lg font-semibold cursor-pointer select-none text-center flex items-center justify-center min-w-[120px] transition-colors shadow-sm">
                      <input type="file" accept="image/*" className="hidden" disabled={isBgUploading} onChange={(e) => handleImageUpload(e.target.files?.[0], true)} />
                      {isBgUploading ? '...' : 'Upload'}
                    </label>
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 4: LAYOUT */}
            <section className="space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">4</div>
                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Layout Structure</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {layoutOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => setFormData({...formData, layout: opt.id})}
                    className={`cursor-pointer rounded-xl p-5 border-2 transition-all flex flex-col items-center justify-center text-center bg-white ${formData.layout === opt.id ? 'border-black shadow-md text-black' : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-800'}`}
                  >
                    {opt.icon}
                    <span className="text-sm font-semibold tracking-tight">{opt.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 5: DECORATIVE STYLE */}
            <section className="space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">5</div>
                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Decorative Style</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {decorOptions.map((opt) => (
                  <div 
                    key={opt.id}
                    onClick={() => setFormData({...formData, decorativeTheme: opt.id})}
                    className={`cursor-pointer rounded-xl py-4 px-2 border-2 transition-all flex flex-col items-center justify-center text-center bg-white ${formData.decorativeTheme === opt.id ? 'border-black shadow-md text-black scale-[1.02]' : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:text-gray-800'}`}
                  >
                    <div className="mb-2 opacity-80">{opt.icon}</div>
                    <span className="text-xs font-semibold tracking-tight">{opt.label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 6: VISIBILITY */}
            <section className="space-y-5">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">6</div>
                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">Visibility</h3>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4 w-1/2">
                  <label className="text-sm font-medium text-gray-700">Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })} className="w-20 bg-gray-50 border border-gray-200 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 text-center font-semibold" />
                </div>
                <div className="w-px h-10 bg-gray-200"></div>
                <label className="flex items-center space-x-3 cursor-pointer select-none group w-1/2 justify-end">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-black">Show in Homepage</span>
                  <div className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${formData.isActive ? 'bg-black' : 'bg-gray-300'}`}>
                    <input type="checkbox" className="hidden" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    <div className={`w-4 h-4 bg-white rounded-full absolute transition-transform shadow-sm ${formData.isActive ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </div>
                </label>
              </div>
            </section>

          </div>

          <div className="px-8 py-5 border-t border-gray-200 flex justify-end space-x-4 bg-white sticky bottom-0 z-30">
            <button onClick={onClose} className="px-6 py-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors">Cancel</button>
            <button onClick={handleSubmit} className="px-8 py-3 rounded-lg font-bold text-white bg-black hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              {initialData ? 'Save Changes' : 'Create Banner'}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PREVIEW */}
        <div className="hidden md:flex w-[50%] lg:w-[55%] bg-[#F0F0F0] relative items-center justify-center p-8 lg:p-12">
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold uppercase tracking-widest text-black rounded-full shadow-sm flex items-center space-x-2 z-20">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>Live Preview</span>
          </div>
          
          <div className="w-full aspect-[4/5] xl:aspect-video relative rounded-2xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border-4 border-white/40 bg-white group transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)]">
            <BannerPreview formData={formData} />
          </div>
        </div>

      </div>
    </div>
  );
}
