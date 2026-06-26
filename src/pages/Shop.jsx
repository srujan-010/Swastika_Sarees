import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid, List, RotateCcw, X, Star, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';

const FABRICS = ['Silk', 'Cotton', 'Chiffon', 'Georgette', 'Net', 'Linen', 'Organza', 'Crepe'];
const SIZES = ['Free Size', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
const COLORS = [
  { name: 'Red', hex: '#E53E3E' },
  { name: 'Gold', hex: '#D69E2E' },
  { name: 'Blue', hex: '#3182CE' },
  { name: 'Green', hex: '#38A169' },
  { name: 'Pink', hex: '#ED64A6' },
  { name: 'Purple', hex: '#805AD5' },
  { name: 'Cream', hex: '#FFF8F0' },
  { name: 'Yellow', hex: '#ECC94B' },
  { name: 'Orange', hex: '#DD6B20' },
  { name: 'Black', hex: '#1A202C' }
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Data State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Display State
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Derive filter values directly from searchParams on every render
  const selectedCats = searchParams.get('category') ? searchParams.get('category').split(',') : [];
  const selectedFabrics = searchParams.get('fabric') ? searchParams.get('fabric').split(',') : [];
  const selectedSizes = searchParams.get('size') ? searchParams.get('size').split(',') : [];
  const selectedColors = searchParams.get('color') ? searchParams.get('color').split(',') : [];
  const minRating = searchParams.get('rating') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minDiscount = searchParams.get('discount') || '';
  const sortOrder = searchParams.get('sort') || 'newest';

  // We keep local state for price inputs so typing is smooth, but we sync them when URL changes
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Load initial settings & categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Failed to load categories', err));
  }, []);

  // Sync price inputs and reset page when URL searchParams change
  useEffect(() => {
    setPriceRange({
      min: searchParams.get('minPrice') || '',
      max: searchParams.get('maxPrice') || ''
    });
    setPage(1); // Reset page to 1 whenever filters change
  }, [searchParams]);

  // Fetch products from API based on current filters and page
  const fetchProducts = async (currentPage = 1, append = false) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      const cats = searchParams.get('category');
      const subcat = searchParams.get('subcategory');
      const fabrics = searchParams.get('fabric');
      const sizes = searchParams.get('size');
      const colors = searchParams.get('color');
      const minPrice = searchParams.get('minPrice');
      const maxPrice = searchParams.get('maxPrice');
      const rating = searchParams.get('rating');
      const inStock = searchParams.get('inStock');
      const discount = searchParams.get('discount');
      const sort = searchParams.get('sort') || 'newest';
      
      if (cats) queryParams.set('category', cats);
      if (subcat) queryParams.set('subcategory', subcat);
      if (fabrics) queryParams.set('fabric', fabrics);
      if (sizes) queryParams.set('size', sizes);
      if (colors) queryParams.set('color', colors);
      if (minPrice) queryParams.set('minPrice', minPrice);
      if (maxPrice) queryParams.set('maxPrice', maxPrice);
      if (rating) queryParams.set('rating', rating);
      if (inStock) queryParams.set('inStock', inStock);
      if (discount) queryParams.set('discount', discount);
      
      const search = searchParams.get('search');
      if (search) queryParams.set('search', search);

      const isNewParam = searchParams.get('new');
      if (isNewParam) queryParams.set('newArrival', 'true');

      const isSaleParam = searchParams.get('sale');
      if (isSaleParam) queryParams.set('discount', '10'); // minimum 10% off for sale

      queryParams.set('sort', sort);
      queryParams.set('page', currentPage.toString());
      queryParams.set('limit', '12');

      const response = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        if (append) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setTotalProducts(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load products catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(page, page > 1);
  }, [searchParams, page]);

  // Update URL search parameters when filters are toggled
  const applyFiltersToUrl = (newFilters) => {
    const updatedParams = new URLSearchParams(searchParams);
    
    // Reset page index
    updatedParams.delete('page');

    Object.entries(newFilters).forEach(([key, val]) => {
      if (Array.isArray(val) && val.length > 0) {
        updatedParams.set(key, val.join(','));
      } else if (!Array.isArray(val) && val) {
        updatedParams.set(key, val);
      } else {
        updatedParams.delete(key);
      }
    });

    setSearchParams(updatedParams);
  };

  const handleCatChange = (slug) => {
    const newCats = selectedCats.includes(slug)
      ? selectedCats.filter(c => c !== slug)
      : [...selectedCats, slug];
    applyFiltersToUrl({ category: newCats });
  };

  const handleFabricChange = (name) => {
    const newFabs = selectedFabrics.includes(name)
      ? selectedFabrics.filter(f => f !== name)
      : [...selectedFabrics, name];
    applyFiltersToUrl({ fabric: newFabs });
  };

  const handleSizeChange = (size) => {
    const newSizes = selectedSizes.includes(size)
      ? selectedSizes.filter(s => s !== size)
      : [...selectedSizes, size];
    applyFiltersToUrl({ size: newSizes });
  };

  const handleColorChange = (colorName) => {
    const newCols = selectedColors.includes(colorName)
      ? selectedColors.filter(c => c !== colorName)
      : [...selectedColors, colorName];
    applyFiltersToUrl({ color: newCols });
  };

  const handlePriceChange = (e, field) => {
    const val = e.target.value;
    const newRange = { ...priceRange, [field]: val };
    setPriceRange(newRange);
    
    // Apply changes with debounce or on submit, but for simplicity, update query on blur
  };

  const submitPriceRange = () => {
    applyFiltersToUrl({
      minPrice: priceRange.min,
      maxPrice: priceRange.max
    });
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setPriceRange({ min: '', max: '' });
  };

  const loadMore = () => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Search Query Alert Badge */}
      {searchParams.get('search') && (
        <div className="bg-brand-cream border border-brand-border p-4 rounded-xl flex items-center justify-between mb-8 select-none">
          <span className="text-sm font-sans text-brand-dark">
            Showing search results for: <strong>"{searchParams.get('search')}"</strong>
          </span>
          <button
            onClick={() => {
              const updated = new URLSearchParams(searchParams);
              updated.delete('search');
              setSearchParams(updated);
            }}
            className="text-brand-crimson font-bold text-xs flex items-center"
          >
            <X size={14} className="mr-0.5" /> Clear Search
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-brand-border/60 pb-6 mb-8 select-none">
        
        {/* Count Description */}
        <div className="text-left mb-4 sm:mb-0">
          <h1 className="font-display font-bold text-brand-dark text-2xl tracking-wide">
            {searchParams.get('subcategory')
              ? `${searchParams.get('category')?.replace(/-/g, ' ').toUpperCase()} > ${searchParams.get('subcategory')?.replace(/-/g, ' ').toUpperCase()}`
              : searchParams.get('category') 
                ? searchParams.get('category')?.replace(/-/g, ' ').toUpperCase()
                : 'Our Collections'}
          </h1>
          <span className="text-xs text-brand-muted font-sans leading-none">
            Showing {products.length} of {totalProducts} premium products
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
          
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex lg:hidden items-center space-x-1.5 border border-brand-border px-4 py-2 rounded-md text-xs font-semibold text-brand-dark bg-brand-white"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-4 font-sans text-xs">
            
            {/* Sorting Dropdown */}
            <div className="flex items-center space-x-1.5">
              <span className="text-brand-muted hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    const updated = new URLSearchParams(searchParams);
                    updated.set('sort', e.target.value);
                    setSearchParams(updated);
                  }}
                  className="bg-brand-white text-brand-dark border border-brand-border px-3 py-2 rounded-md font-medium focus:outline-none focus:ring-1 focus:ring-brand-gold cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Grid/List views toggles */}
            <div className="hidden sm:flex items-center border border-brand-border rounded-md overflow-hidden bg-brand-white">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-brand-cream text-brand-crimson' : 'text-brand-muted hover:text-brand-dark bg-brand-white'}`}
                aria-label="Grid View"
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors border-l border-brand-border ${viewMode === 'list' ? 'bg-brand-cream text-brand-crimson' : 'text-brand-muted hover:text-brand-dark bg-brand-white'}`}
                aria-label="List View"
              >
                <List size={16} />
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Grid: Sidebar + Gallery */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters - Desktop (Sticky) */}
        <aside className="hidden lg:block w-64 shrink-0 text-left self-start sticky top-28 bg-brand-white p-5 rounded-2xl border border-brand-border/40 select-none max-h-[80vh] overflow-y-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 mb-4">
            <span className="font-semibold text-brand-dark">Filters</span>
            {(selectedCats.length > 0 || selectedFabrics.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange.min || priceRange.max || minRating || inStockOnly || minDiscount) && (
              <button
                onClick={clearAllFilters}
                className="text-2xs font-bold text-brand-crimson flex items-center hover:underline"
              >
                <RotateCcw size={10} className="mr-0.5" /> Clear All
              </button>
            )}
          </div>

          <div className="space-y-6">
            
            {/* 1. Category */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Category</span>
              <div className="space-y-1.5 font-sans text-xs text-brand-muted">
                {categories.map(cat => (
                  <label key={cat._id} className="flex items-center space-x-2.5 cursor-pointer hover:text-brand-crimson">
                    <input
                      type="checkbox"
                      checked={selectedCats.includes(cat.slug)}
                      onChange={() => handleCatChange(cat.slug)}
                      className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Fabric */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Fabric</span>
              <div className="space-y-1.5 font-sans text-xs text-brand-muted">
                {FABRICS.map(fab => (
                  <label key={fab} className="flex items-center space-x-2.5 cursor-pointer hover:text-brand-crimson">
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fab)}
                      onChange={() => handleFabricChange(fab)}
                      className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                    />
                    <span>{fab}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Price Range inputs */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Price (₹)</span>
              <div className="flex space-x-2 items-center font-sans">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                  onBlur={submitPriceRange}
                  className="w-full bg-brand-cream border border-brand-border text-brand-dark rounded-md px-2 py-1.5 text-xs text-center"
                />
                <span className="text-brand-muted text-xs">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  onBlur={submitPriceRange}
                  className="w-full bg-brand-cream border border-brand-border text-brand-dark rounded-md px-2 py-1.5 text-xs text-center"
                />
              </div>
            </div>

            {/* 4. Color Swatches pickers */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Color</span>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => handleColorChange(col.name)}
                    className={`w-6 h-6 rounded-full border shadow-2xs hover:scale-105 transition-all flex items-center justify-center ${
                      selectedColors.includes(col.name) ? 'ring-2 ring-brand-crimson border-brand-white scale-105' : 'border-brand-border'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {selectedColors.includes(col.name) && (
                      <span className="w-1 h-1 bg-brand-white rounded-full mix-blend-difference" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Size Buttons */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Size</span>
              <div className="flex flex-wrap gap-1.5 font-sans">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => handleSizeChange(sz)}
                    className={`px-2 py-1 text-2xs font-semibold rounded border transition-all ${
                      selectedSizes.includes(sz)
                        ? 'bg-brand-crimson text-brand-cream border-brand-crimson shadow-2xs'
                        : 'bg-brand-white border-brand-border text-brand-dark hover:border-brand-crimson'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Rating */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Rating</span>
              <div className="space-y-1.5 font-sans text-xs text-brand-muted">
                {[4, 3].map((star) => (
                  <label key={star} className="flex items-center space-x-2 cursor-pointer hover:text-brand-crimson">
                    <input
                      type="radio"
                      name="rating"
                      checked={minRating === star.toString()}
                      onChange={() => applyFiltersToUrl({ rating: star.toString() })}
                      className="text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                    />
                    <span className="flex items-center">
                      {star}★ & above
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 7. Availability */}
            <div className="border-t border-brand-border/60 pt-4">
              <label className="flex items-center space-x-2.5 cursor-pointer font-sans text-xs text-brand-dark font-medium">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => applyFiltersToUrl({ inStock: e.target.checked ? 'true' : '' })}
                  className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            {/* 8. Discounts */}
            <div>
              <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2.5">Discounts</span>
              <div className="space-y-1.5 font-sans text-xs text-brand-muted">
                {['10', '25', '50'].map((disc) => (
                  <label key={disc} className="flex items-center space-x-2.5 cursor-pointer hover:text-brand-crimson">
                    <input
                      type="radio"
                      name="discount"
                      checked={minDiscount === disc}
                      onChange={() => applyFiltersToUrl({ discount: disc })}
                      className="text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                    />
                    <span>{disc}% & above</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Gallery View */}
        <main className="flex-1">
          {products.length === 0 && !loading ? (
            <div className="bg-brand-white border border-brand-border p-12 rounded-2xl shadow-xs text-center select-none flex flex-col items-center">
              <span className="font-display text-4xl mb-4 text-brand-gold">⚜️</span>
              <h3 className="font-display font-semibold text-brand-dark text-lg sm:text-xl mb-2">No Matching Products Found</h3>
              <p className="text-brand-muted text-xs max-w-sm mb-6">
                Try widening your price range, choosing different fabric styles, or clearing search keywords.
              </p>
              <button
                onClick={clearAllFilters}
                className="bg-brand-crimson hover:bg-brand-muted text-brand-cream font-medium text-xs px-5 py-2.5 rounded-lg border border-brand-gold/30 shadow-md transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map(prod => (
                <ProductCard
                  key={prod._id}
                  product={prod}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
              {loading && [1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[3/4] skeleton-shimmer rounded-xl" />
              ))}
            </div>
          ) : (
            // List View Layout
            <div className="space-y-4">
              {products.map(prod => {
                const currentPrice = prod.price / 100;
                const originalPrice = prod.originalPrice ? prod.originalPrice / 100 : null;
                const primaryImage = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=400';
                return (
                  <div key={prod._id} className="flex bg-brand-white border border-brand-border/40 p-4 rounded-xl hover:shadow-md transition-shadow gap-4 text-left">
                    <img src={primaryImage} alt={prod.name} className="w-24 h-32 object-cover object-top rounded-md border" />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-brand-gold font-sans font-bold uppercase tracking-wider">{prod.category?.name}</span>
                        <h4 className="font-display font-semibold text-brand-dark text-base mt-0.5 line-clamp-1">{prod.name}</h4>
                        <p className="text-xs text-brand-muted mt-1 leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: prod.description }}></p>
                      </div>
                      <div className="flex items-end justify-between mt-2 select-none">
                        <div className="flex items-center space-x-2">
                          <span className="font-sans font-bold text-brand-crimson">₹{currentPrice}</span>
                          {originalPrice && <span className="text-2xs text-brand-muted line-through">₹{originalPrice}</span>}
                        </div>
                        <button
                          onClick={() => setQuickViewProduct(prod)}
                          className="bg-brand-crimson hover:bg-brand-muted text-brand-cream px-4 py-1.5 rounded text-xs font-semibold border border-brand-gold/35 shadow-sm transition-colors"
                        >
                          Select Options
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {loading && [1, 2].map(n => <div key={n} className="h-40 skeleton-shimmer rounded-xl" />)}
            </div>
          )}

          {/* Load More Trigger */}
          {page < totalPages && !loading && (
            <div className="mt-12 text-center select-none">
              <button
                onClick={loadMore}
                className="bg-brand-white hover:bg-brand-cream text-brand-dark border border-brand-border font-semibold text-xs px-8 py-3 rounded-lg shadow-sm hover:shadow transition-all"
              >
                Load More Products
              </button>
            </div>
          )}

        </main>

      </div>

      {/* Mobile Sidebar Modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-brand-dark/50 backdrop-blur-xs" onClick={() => setFiltersOpen(false)}></div>
          <div className="relative flex flex-col w-full max-w-xs bg-brand-white h-full shadow-2xl p-6 border-r border-brand-border overflow-y-auto text-left select-none animate-shimmer-once">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3 mb-5">
              <span className="font-semibold text-brand-dark">Filters</span>
              <div className="flex items-center space-x-3">
                {(selectedCats.length > 0 || selectedFabrics.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange.min || priceRange.max || minRating || inStockOnly || minDiscount) && (
                  <button
                    onClick={clearAllFilters}
                    className="text-2xs font-bold text-brand-crimson flex items-center hover:underline mr-1"
                  >
                    <RotateCcw size={10} className="mr-0.5" /> Clear All
                  </button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="text-brand-dark hover:text-brand-crimson">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Same Sidebar Content */}
            <div className="space-y-6">
              
              {/* Category */}
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Category</span>
                <div className="space-y-1 font-sans text-xs text-brand-muted">
                  {categories.map(cat => (
                    <label key={cat._id} className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat.slug)}
                        onChange={() => handleCatChange(cat.slug)}
                        className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Fabric */}
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Fabric</span>
                <div className="space-y-1 font-sans text-xs text-brand-muted">
                  {FABRICS.map(fab => (
                    <label key={fab} className="flex items-center space-x-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFabrics.includes(fab)}
                        onChange={() => handleFabricChange(fab)}
                        className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                      />
                      <span>{fab}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Price (₹)</span>
                <div className="flex space-x-2 items-center font-sans">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => handlePriceChange(e, 'min')}
                    onBlur={submitPriceRange}
                    className="w-full bg-brand-cream border border-brand-border text-brand-dark rounded-md px-2 py-1 text-xs text-center"
                  />
                  <span className="text-brand-muted text-xs">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => handlePriceChange(e, 'max')}
                    onBlur={submitPriceRange}
                    className="w-full bg-brand-cream border border-brand-border text-brand-dark rounded-md px-2 py-1 text-xs text-center"
                  />
                </div>
              </div>

              {/* Color */}
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Color</span>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((col) => (
                    <button
                      key={col.name}
                      onClick={() => handleColorChange(col.name)}
                      className={`w-6 h-6 rounded-full border shadow-2xs ${selectedColors.includes(col.name) ? 'ring-2 ring-brand-crimson border-brand-white scale-105' : 'border-brand-border'}`}
                      style={{ backgroundColor: col.hex }}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <span className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-2">Size</span>
                <div className="flex flex-wrap gap-1 font-sans">
                  {SIZES.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => handleSizeChange(sz)}
                      className={`px-2 py-1 text-2xs font-semibold rounded border ${selectedSizes.includes(sz) ? 'bg-brand-crimson text-brand-cream border-brand-crimson' : 'bg-brand-white border-brand-border text-brand-dark'}`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-brand-border/60 pt-4">
                <label className="flex items-center space-x-2.5 cursor-pointer font-sans text-xs text-brand-dark font-medium">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => applyFiltersToUrl({ inStock: e.target.checked ? 'true' : '' })}
                    className="rounded text-brand-crimson focus:ring-brand-crimson h-3.5 w-3.5 border-brand-border"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

            </div>

            <button
              onClick={() => setFiltersOpen(false)}
              className="mt-6 w-full bg-brand-crimson hover:bg-brand-muted text-brand-cream py-2.5 rounded-lg text-xs font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Quick View Popup Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

    </div>
  );
}
