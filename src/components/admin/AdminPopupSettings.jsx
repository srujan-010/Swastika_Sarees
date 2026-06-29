import React, { useState, useEffect } from 'react';
import { 
  Save, X, RefreshCw, Upload, Image as ImageIcon, Edit2, 
  Eye, MonitorSmartphone, GripVertical, CheckCircle2,
  Trash2, Plus, Zap, Heart, Package, Gift, Shield, 
  Smartphone, Monitor, ChevronDown, ChevronUp
} from 'lucide-react';
import { uploadFileWithProgress } from '../../utils/uploadHelpers';
import { useModalStore } from '../../store/modalStore';

// Default layout used for resets
const DEFAULT_SETTINGS = {
  images: { desktopUrl: '', mobileUrl: '' },
  promotional: { badgeText: '✨ NEW ARRIVALS', heading: 'Premium Sarees & Kurtis', description: 'Get up to 10% OFF on your first order when you join the Swastika family.' },
  overlay: { type: 'gradient', opacity: 80 },
  benefits: [
    { icon: 'Heart', title: 'Save Wishlist', isEnabled: true },
    { icon: 'Package', title: 'Track Orders', isEnabled: true },
    { icon: 'Zap', title: 'Fast Checkout', isEnabled: true },
    { icon: 'Gift', title: 'Exclusive Offers', isEnabled: true }
  ],
  header: { title: 'Welcome to Swastika Sarees ✨', subtitle: 'Sign in to continue shopping, save your wishlist, track orders, and get exclusive offers.' },
  buttons: { signIn: 'Sign In', signUp: 'Create Account', guest: 'Continue as Guest', google: 'Continue with Google', apple: 'Continue with Apple' },
  display: { delayMs: 3000, showOncePerSession: true, showOnlyForGuest: true, hideAfterLogin: true, isEnabled: true },
  firstOrderOffer: { isEnabled: false, title: '10% OFF First Order', description: 'Use code WELCOME10 at checkout', couponCode: 'WELCOME10', expiryDays: 7, minCartValue: 0, signupOnly: true }
};

const AVAILABLE_ICONS = ['Heart', 'Package', 'Zap', 'Gift', 'Shield', 'Star', 'Truck', 'CheckCircle2'];
const IconComponent = ({ name, size = 16, className = '' }) => {
  const icons = { Heart, Package, Zap, Gift, Shield, Star: CheckCircle2, Truck: Zap, CheckCircle2 };
  const Icon = icons[name] || Heart;
  return <Icon size={size} className={className} />;
};

export default function AdminPopupSettings({ token }) {
  const { success, error, confirm } = useModalStore();
  const [settings, setSettings] = useState(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // UI States
  const [activeSection, setActiveSection] = useState('promotional');
  const [previewMode, setPreviewMode] = useState('desktop');

  useEffect(() => {
    fetchSettings();
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/popup/admin', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      error('Failed to load popup settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/popup', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        success('Popup settings saved successfully!');
      } else {
        error('Failed to save settings');
      }
    } catch (err) {
      error('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    confirm('Reset to Default', 'Are you sure you want to reset all settings to their defaults? This cannot be undone unless you discard changes.', () => {
      setSettings(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)));
    });
  };

  const handleDiscard = () => {
    confirm('Discard Changes', 'Are you sure you want to revert to the last saved settings?', () => {
      setLoading(true);
      fetchSettings();
    });
  };

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await uploadFileWithProgress(file, token, () => {}, 'popup');
      if (res && res.url) {
        updateSetting('images', type, res.url);
      }
    } catch (err) {
      error('Upload Failed', err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateSetting = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const SectionHeader = ({ id, title, icon: Icon }) => (
    <button 
      onClick={() => setActiveSection(activeSection === id ? null : id)}
      className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${activeSection === id ? 'border-brand-dark bg-white shadow-sm' : 'border-transparent bg-gray-50 hover:bg-gray-100 text-gray-600'}`}
    >
      <div className="flex items-center gap-3">
        <Icon size={18} className={activeSection === id ? 'text-brand-dark' : 'text-gray-400'} />
        <span className={`font-black text-sm uppercase tracking-wider ${activeSection === id ? 'text-brand-dark' : 'text-gray-600'}`}>{title}</span>
      </div>
      {activeSection === id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
  );

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Settings...</div>;

  return (
    <div className="h-full flex flex-col md:flex-row bg-gray-50/50 relative overflow-hidden">
      
      {/* LEFT SCROLLABLE PANEL (Editor) */}
      <div className="w-full md:w-1/2 lg:w-5/12 h-full overflow-y-auto border-r border-gray-200 bg-white">
        
        {/* Editor Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-6">
          <h2 className="text-xl font-display font-black text-brand-dark mb-1">Popup Settings</h2>
          <p className="text-xs font-semibold text-gray-500">Manage the customer authentication & newsletter popup.</p>
        </div>

        <div className="p-6 space-y-4">
          
          {/* SECTION: Display Settings */}
          <div className="space-y-3">
            <SectionHeader id="display" title="1. Display Settings" icon={Eye} />
            {activeSection === 'display' && (
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-5 animate-in slide-in-from-top-2">
                
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div>
                    <div className="text-xs font-bold text-gray-900">Enable Popup Globally</div>
                    <div className="text-[10px] font-semibold text-gray-500">Turn the popup on or off completely.</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.display?.isEnabled} onChange={e => updateSetting('display', 'isEnabled', e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Popup Delay</label>
                  <select 
                    value={settings.display?.delayMs} 
                    onChange={e => updateSetting('display', 'delayMs', parseInt(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-dark"
                  >
                    <option value={0}>Immediately (0s)</option>
                    <option value={3000}>3 seconds</option>
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>10 seconds</option>
                    <option value={15000}>15 seconds</option>
                    <option value={30000}>30 seconds</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-100">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.display?.showOncePerSession} onChange={e => updateSetting('display', 'showOncePerSession', e.target.checked)} className="rounded text-brand-dark focus:ring-brand-dark w-4 h-4 border-gray-300" />
                    <span className="text-sm font-semibold text-gray-700">Show Once Per Session</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.display?.showOnlyForGuest} onChange={e => updateSetting('display', 'showOnlyForGuest', e.target.checked)} className="rounded text-brand-dark focus:ring-brand-dark w-4 h-4 border-gray-300" />
                    <span className="text-sm font-semibold text-gray-700">Show Only For Guest Users</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={settings.display?.hideAfterLogin} onChange={e => updateSetting('display', 'hideAfterLogin', e.target.checked)} className="rounded text-brand-dark focus:ring-brand-dark w-4 h-4 border-gray-300" />
                    <span className="text-sm font-semibold text-gray-700">Auto-hide after Login/Signup</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: Promotional Panel */}
          <div className="space-y-3">
            <SectionHeader id="promotional" title="2. Promotional Panel (Left)" icon={ImageIcon} />
            {activeSection === 'promotional' && (
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-5 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-2 block">Desktop Image</label>
                  <div className="flex gap-4 items-center">
                    {settings.images?.desktopUrl ? (
                      <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={settings.images.desktopUrl} alt="Desktop" className="w-full h-full object-cover" />
                        <button onClick={() => updateSetting('images', 'desktopUrl', '')} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full"><X size={12}/></button>
                      </div>
                    ) : (
                      <div className="w-24 h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center relative">
                        <input type="file" accept="image/*" onChange={e => { handleImageUpload(e.target.files[0], 'desktopUrl'); e.target.value = null; }} className="absolute inset-0 opacity-0 cursor-pointer" disabled={isUploading} />
                        {isUploading ? <RefreshCw size={18} className="text-gray-400 animate-spin" /> : <Upload size={18} className="text-gray-400" />}
                      </div>
                    )}
                    <div className="flex-1">
                      <input type="text" value={settings.images?.desktopUrl || ''} onChange={e => updateSetting('images', 'desktopUrl', e.target.value)} placeholder="Or paste image URL" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold focus:outline-none focus:border-brand-dark" />
                      <p className="text-[9px] text-gray-400 mt-1 uppercase font-bold">Recommended: 800x1200px</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Badge Text</label>
                    <input type="text" value={settings.promotional?.badgeText} onChange={e => updateSetting('promotional', 'badgeText', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-dark" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Main Heading</label>
                    <input type="text" value={settings.promotional?.heading} onChange={e => updateSetting('promotional', 'heading', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-dark" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Description</label>
                    <textarea value={settings.promotional?.description} onChange={e => updateSetting('promotional', 'description', e.target.value)} rows={2} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-brand-dark resize-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Overlay Type</label>
                    <select value={settings.overlay?.type} onChange={e => updateSetting('overlay', 'type', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-dark">
                      <option value="gradient">Gradient (Bottom-Up)</option>
                      <option value="dark">Solid Dark</option>
                      <option value="light">Solid Light</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Opacity ({settings.overlay?.opacity}%)</label>
                    <input type="range" min="0" max="100" value={settings.overlay?.opacity} onChange={e => updateSetting('overlay', 'opacity', parseInt(e.target.value))} className="w-full mt-2" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION: Benefits */}
          <div className="space-y-3">
            <SectionHeader id="benefits" title="3. Benefits List" icon={Zap} />
            {activeSection === 'benefits' && (
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-3 animate-in slide-in-from-top-2">
                <p className="text-xs text-gray-500 font-semibold mb-2">Configure the bullet points shown on the promotional image.</p>
                {settings.benefits?.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200 group">
                    <GripVertical size={14} className="text-gray-300 cursor-grab" />
                    <select 
                      value={benefit.icon}
                      onChange={e => {
                        const newB = [...settings.benefits];
                        newB[idx].icon = e.target.value;
                        setSettings({...settings, benefits: newB});
                      }}
                      className="p-1.5 bg-white border border-gray-200 rounded-md text-xs font-bold focus:outline-none"
                    >
                      {AVAILABLE_ICONS.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                    <input 
                      type="text" 
                      value={benefit.title}
                      onChange={e => {
                        const newB = [...settings.benefits];
                        newB[idx].title = e.target.value;
                        setSettings({...settings, benefits: newB});
                      }}
                      className="flex-1 p-1.5 bg-transparent border-none text-sm font-bold focus:outline-none focus:ring-1 focus:ring-brand-dark rounded"
                    />
                    <label className="relative inline-flex items-center cursor-pointer ml-auto mr-2">
                      <input type="checkbox" className="sr-only peer" checked={benefit.isEnabled} onChange={e => {
                        const newB = [...settings.benefits];
                        newB[idx].isEnabled = e.target.checked;
                        setSettings({...settings, benefits: newB});
                      }} />
                      <div className="w-7 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                ))}
                {settings.benefits?.length < 8 && (
                  <button 
                    onClick={() => setSettings({...settings, benefits: [...(settings.benefits||[]), { icon: 'Star', title: 'New Benefit', isEnabled: true }]})}
                    className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:text-brand-dark hover:border-brand-dark transition-colors flex items-center justify-center gap-1 mt-2"
                  >
                    <Plus size={14} /> Add Benefit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SECTION: Header & Texts */}
          <div className="space-y-3">
            <SectionHeader id="header" title="4. Form Headers" icon={Edit2} />
            {activeSection === 'header' && (
              <div className="p-4 bg-white border border-gray-100 rounded-xl space-y-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Popup Title</label>
                  <input type="text" value={settings.header?.title} onChange={e => updateSetting('header', 'title', e.target.value)} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:outline-none focus:border-brand-dark" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Subtitle</label>
                  <textarea value={settings.header?.subtitle} onChange={e => updateSetting('header', 'subtitle', e.target.value)} rows={2} className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold focus:outline-none focus:border-brand-dark resize-none" />
                </div>
              </div>
            )}
          </div>

          {/* SECTION: Buttons */}
          <div className="space-y-3">
            <SectionHeader id="buttons" title="5. Buttons & CTAs" icon={MonitorSmartphone} />
            {activeSection === 'buttons' && (
              <div className="p-4 bg-white border border-gray-100 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Sign In Text</label>
                  <input type="text" value={settings.buttons?.signIn} onChange={e => updateSetting('buttons', 'signIn', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Sign Up Text</label>
                  <input type="text" value={settings.buttons?.signUp} onChange={e => updateSetting('buttons', 'signUp', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Guest Text</label>
                  <input type="text" value={settings.buttons?.guest} onChange={e => updateSetting('buttons', 'guest', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500 mb-1 block">Google Btn Text</label>
                  <input type="text" value={settings.buttons?.google} onChange={e => updateSetting('buttons', 'google', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom padding for scrolling */}
          <div className="h-20"></div>

        </div>
      </div>

      {/* RIGHT PANEL (Live Preview) */}
      <div className="w-full md:w-1/2 lg:w-7/12 h-full bg-gray-100 flex flex-col">
        {/* Toolbar */}
        <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setPreviewMode('desktop')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${previewMode === 'desktop' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500'}`}><Monitor size={14}/> Desktop</button>
            <button onClick={() => setPreviewMode('mobile')} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${previewMode === 'mobile' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500'}`}><Smartphone size={14}/> Mobile</button>
          </div>
          
          <div className="flex items-center gap-2">
            <button onClick={handleDiscard} className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Discard</button>
            <button onClick={handleReset} className="px-4 py-2 text-xs font-bold text-brand-crimson hover:bg-red-50 rounded-lg transition-colors hidden xl:block">Reset Default</button>
            <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold hover:bg-black transition-colors flex items-center gap-2">
              <Save size={14}/> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Preview Canvas */}
        <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center justify-center relative">
          <div className={`relative transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 'w-full max-w-4xl h-[500px]'}`}>
            
            {/* The Mini AuthPopup Preview */}
            <div className="w-full h-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-200 pointer-events-none scale-[0.9] origin-center">
              
              {/* Left Promo */}
              <div className={`w-full ${previewMode === 'mobile' ? 'h-[250px]' : 'md:w-5/12 h-full'} relative bg-brand-dark overflow-hidden`}>
                <div className={`absolute inset-0 z-10 ${
                  settings.overlay?.type === 'gradient' ? 'bg-gradient-to-t from-black via-black/20 to-transparent' :
                  settings.overlay?.type === 'dark' ? 'bg-black' :
                  settings.overlay?.type === 'light' ? 'bg-white' : ''
                }`} style={{ opacity: (settings.overlay?.opacity || 80) / 100 }} />
                
                <img src={settings.images?.desktopUrl || 'https://images.unsplash.com/photo-1610030469983-98e550d6153c?w=800&q=80'} className="absolute inset-0 w-full h-full object-cover" alt="Promo"/>
                
                <div className={`absolute inset-0 z-20 flex flex-col justify-end p-6 ${settings.overlay?.type === 'light' ? 'text-black' : 'text-white'}`}>
                  {settings.promotional?.badgeText && (
                    <span className="inline-block px-2.5 py-1 bg-brand-gold text-brand-dark text-[9px] font-black uppercase tracking-widest rounded-full w-max mb-3">{settings.promotional.badgeText}</span>
                  )}
                  <h2 className="text-2xl font-display font-bold mb-2">{settings.promotional?.heading}</h2>
                  <p className="text-sm opacity-90 mb-5 max-w-[250px]">{settings.promotional?.description}</p>
                  
                  {previewMode === 'desktop' && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {settings.benefits?.filter(b => b.isEnabled).map((b, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold">
                          <IconComponent name={b.icon} size={12} className={settings.overlay?.type === 'light' ? 'text-brand-dark' : 'text-brand-gold'} />
                          <span>{b.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Form */}
              <div className={`w-full ${previewMode === 'mobile' ? 'flex-1' : 'md:w-7/12'} p-6 sm:p-8 bg-brand-cream/10`}>
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-display font-bold text-brand-dark mb-2">{settings.header?.title}</h2>
                    <p className="text-xs text-brand-muted">{settings.header?.subtitle}</p>
                  </div>
                  
                  {/* Fake Tab */}
                  <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                    <div className="flex-1 py-1.5 text-xs font-bold text-brand-dark bg-white rounded shadow-sm text-center border border-gray-200/50">{settings.buttons?.signIn}</div>
                    <div className="flex-1 py-1.5 text-xs font-bold text-gray-500 text-center">{settings.buttons?.signUp}</div>
                  </div>

                  {/* Fake Inputs */}
                  <div className="space-y-3 opacity-60">
                    <div className="w-full bg-white border border-gray-200 h-10 rounded-lg flex items-center px-3"><div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div><div className="h-2 w-32 bg-gray-100 rounded"></div></div>
                    <div className="w-full bg-white border border-gray-200 h-10 rounded-lg flex items-center px-3"><div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div><div className="h-2 w-24 bg-gray-100 rounded"></div></div>
                  </div>

                  <button className="w-full bg-brand-dark text-white font-bold text-xs py-3 rounded-lg shadow-md mt-6">{settings.buttons?.signIn}</button>
                  
                  <div className="flex items-center gap-4 my-5 opacity-50">
                    <div className="h-px bg-gray-300 flex-1"></div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Or continue with</span>
                    <div className="h-px bg-gray-300 flex-1"></div>
                  </div>
                  
                  <button className="w-full border border-gray-200 bg-white text-gray-700 font-bold text-xs py-2.5 rounded-lg">{settings.buttons?.google}</button>
                  <div className="mt-4 text-center">
                    <span className="text-[10px] font-bold text-gray-500 underline">{settings.buttons?.guest}</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
