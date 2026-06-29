import React from 'react';

export default function BannerPreview({ formData, product }) {
  // Determine displayed data
  let displayTitle = '';
  let displaySubtitle = '';
  let displayPrice = '';
  let displayImage = '';
  let displayBadge = formData.badge || '';

  if (formData.type === 'product' && product) {
    displayTitle = formData.overrideTitle || product.name;
    displaySubtitle = formData.overrideSubtitle || product.category?.name || '';
    displayPrice = `₹${product.price}`;
    displayImage = formData.selectedImage || product.mainProduct?.images?.[0] || '';
  } else {
    displayTitle = formData.title || 'Banner Title';
    displaySubtitle = formData.subtitle || 'Banner subtitle goes here';
    displayImage = formData.imageUrl || '';
  }

  // Layout classes
  let containerLayout = '';
  let textAlignmentClass = '';
  
  if (formData.layout === 'right-image') {
    containerLayout = 'flex-col md:flex-row';
    textAlignmentClass = 'items-center md:items-start pl-6';
  } else if (formData.layout === 'center') {
    containerLayout = 'flex-col justify-center items-center';
    textAlignmentClass = 'items-center mt-4';
  } else {
    // left-image default
    containerLayout = 'flex-col md:flex-row-reverse';
    textAlignmentClass = 'items-center md:items-start pl-6';
  }

  // Handle explicit text alignment
  let alignClass = 'text-left';
  if (formData.textAlignment === 'center' || (!formData.textAlignment && formData.layout === 'center')) alignClass = 'text-center';
  if (formData.textAlignment === 'right') alignClass = 'text-right';
  if (formData.textAlignment === 'left') alignClass = 'text-left';
  
  if (formData.layout === 'center' && !formData.textAlignment) alignClass = 'text-center';
  else if (!formData.textAlignment && formData.layout !== 'center') alignClass = 'text-center md:text-left';

  textAlignmentClass = `${alignClass} ${textAlignmentClass}`;

  // Background styles
  const getBgStyle = (bg) => {
    switch(bg) {
      case 'white-premium': return 'bg-white';
      case 'beige-luxury': return 'bg-[#FDFBF7]';
      case 'palace': return 'bg-gradient-to-b from-[#F9F6F0] to-[#F1EAD7]';
      case 'dark-luxury': return 'bg-brand-dark text-white';
      case 'minimal': return 'bg-gray-50';
      case 'transparent': return 'bg-transparent';
      // New premium styles
      case 'luxury-palace-interior': return 'bg-gradient-to-b from-[#EFE5D9] to-[#FDFBF7]';
      case 'heritage-haveli': return 'bg-[#F4F0E6]';
      case 'royal-archways': return 'bg-gradient-to-b from-[#F9F6F0] to-[#E6DBC8]';
      case 'marble-floor-shadows': return 'bg-[#FDFBF7]';
      case 'silk-fabric-texture': return 'bg-[#F7EFE5]';
      case 'premium-beige-gradient': return 'bg-gradient-to-br from-[#FDFBF7] via-[#F4ECE1] to-[#FDFBF7]';
      case 'warm-ivory-luxury': return 'bg-[#FAF8F5]';
      case 'golden-ambient-lighting': return 'bg-gradient-to-tr from-[#EAD9C0] to-[#FDFBF7]';
      case 'traditional-jharokha-windows': return 'bg-[#F2EFE9]';
      case 'floral-luxury-decor': return 'bg-[#F9F6F0]';
      case 'soft-bokeh-lighting': return 'bg-[#FDFBF7]';
      case 'minimal-editorial-fashion': return 'bg-white';
      default: return 'bg-[#FDFBF7]';
    }
  };

  const isDark = formData.background === 'dark-luxury';
  const textColor = isDark ? 'text-white' : 'text-brand-dark';
  const mutedColor = isDark ? 'text-white/70' : 'text-brand-muted';

  let waveColor = '';
  let archColor = '';
  let archBorder = '';
  let showArch = false;
  
  if (['premium-beige-gradient', 'white-premium', 'golden-ambient-lighting', 'dark-luxury'].includes(formData.background)) {
    showArch = true;
    if (formData.background === 'premium-beige-gradient') {
      waveColor = '#E2DFD8';
      archColor = 'bg-[#E1DFD7]';
      archBorder = 'border-black/10';
    } else if (formData.background === 'white-premium') {
      waveColor = '#F7F7F7';
      archColor = 'bg-[#F9F9F9]';
      archBorder = 'border-black/5';
    } else if (formData.background === 'golden-ambient-lighting') {
      waveColor = '#E3CBA8';
      archColor = 'bg-[#EAD4B3]';
      archBorder = 'border-black/10';
    } else if (formData.background === 'dark-luxury') {
      waveColor = '#242424';
      archColor = 'bg-[#1F1F1F]';
      archBorder = 'border-white/10';
    }
  }

  return (
    <div className={`w-full h-full relative overflow-hidden flex ${containerLayout} p-4 sm:p-6 ${getBgStyle(formData.background)}`}>
      
      {/* Custom Background Image */}
      {formData.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img src={formData.backgroundImage} alt="Background" className="w-full h-full object-cover opacity-30 mix-blend-multiply" />
        </div>
      )}

      {/* Gradient Overlay */}
      {formData.gradientOverlay === 'soft-radial' && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent z-0"></div>
      )}
      {formData.gradientOverlay === 'dark-vignette' && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/20 z-0"></div>
      )}
      {formData.gradientOverlay === 'golden-glow' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/10 via-transparent to-transparent z-0"></div>
      )}
      
      {/* Decorative Theme */}
      {formData.decorativeTheme === 'floral-watermark' && (
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/floral-texture.png')] opacity-[0.03] z-0 mix-blend-multiply pointer-events-none"></div>
      )}

      {/* Background Decor */}
      {showArch && (
        <svg className="absolute top-0 left-0 w-full h-[80%] z-0 pointer-events-none opacity-80" preserveAspectRatio="none" viewBox="0 0 1440 600" fill="none">
          <path d="M0 0H1440V200C1100 450 400 150 0 550V0Z" fill={waveColor} />
        </svg>
      )}
      {(formData.background === 'palace' || formData.background === 'luxury-palace-interior') && (
        <div className="absolute bottom-0 w-[80%] h-[90%] left-1/2 -translate-x-1/2 border border-brand-gold/20 rounded-t-full bg-white/20 pointer-events-none z-0"></div>
      )}

      {/* Image Area */}
      <div className={`relative z-10 flex items-center justify-center ${formData.layout === 'center' ? 'h-[60%] w-full' : 'w-full md:w-1/2 h-[50%] md:h-full'}`}>
        {/* Arch Background Decor */}
        {showArch && (
          <div className={`absolute bottom-0 w-[95%] sm:w-[85%] md:w-[80%] h-[92%] border-[1px] rounded-t-full z-[-1] pointer-events-none ${archColor} ${archBorder}`}></div>
        )}
        {displayImage ? (
          <img src={displayImage} alt="Preview" className={`w-auto h-full object-contain ${formData.layout === 'center' ? 'max-h-full' : 'max-h-[110%]'} drop-shadow-2xl`} />
        ) : (
          <div className="w-full h-full bg-black/5 flex items-center justify-center text-brand-muted italic rounded-lg">No Image</div>
        )}
      </div>

      {/* Text Area */}
      <div className={`relative z-20 flex flex-col justify-center ${textAlignmentClass} ${formData.layout === 'center' ? 'w-full h-[40%]' : 'w-full md:w-1/2 h-[50%] md:h-full'}`}>
        
        {displayBadge && (
          <span className={`text-[8px] font-bold tracking-[0.3em] uppercase ${isDark ? 'text-white/80' : 'text-brand-dark/70'} mb-2 flex items-center`}>
            {alignClass.includes('text-center') || alignClass.includes('text-right') ? <span className="w-4 h-px bg-brand-gold mr-2 hidden md:block"></span> : null}
            {displayBadge}
            {alignClass.includes('text-center') || alignClass.includes('text-left') ? <span className="w-4 h-px bg-brand-gold ml-2 hidden md:block"></span> : null}
          </span>
        )}
        
        <h2 className={`font-display font-medium text-2xl sm:text-3xl lg:text-4xl leading-tight ${textColor} mb-2`}>
          {displayTitle}
        </h2>
        
        <p className={`font-sans text-[10px] sm:text-xs font-light ${mutedColor} mb-3 line-clamp-2`}>
          {displaySubtitle}
        </p>
        
        {displayPrice && (
          <div className={`text-lg sm:text-xl font-display font-medium ${textColor} mb-4`}>
            {displayPrice}
          </div>
        )}
        
        <div className={`flex items-center gap-2 mt-auto md:mt-2 ${alignClass.includes('text-center') ? 'justify-center' : alignClass.includes('text-right') ? 'justify-end' : 'justify-start'}`}>
          <button className={`px-4 py-2 text-[9px] font-bold uppercase tracking-wider rounded-sm ${isDark ? 'bg-white text-brand-dark' : 'bg-brand-dark text-white'}`}>
            {formData.ctaText || 'Shop Now'}
          </button>
          
          {formData.secondaryButtonText && (
            <button className={`px-4 py-2 text-[9px] font-bold uppercase tracking-wider rounded-sm border ${isDark ? 'border-white text-white' : 'border-brand-dark text-brand-dark'}`}>
              {formData.secondaryButtonText}
            </button>
          )}
        </div>
      </div>
      
    </div>
  );
}
