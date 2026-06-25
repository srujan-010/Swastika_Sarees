import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, MessageCircle, X, Send, ArrowRight, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Namaste! 🙏 I am Swastika's AI Style Assistant. Tell me what event you are dressing up for, or let me know what sarees, kurtis, or styles you'd like to check out today!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/style-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, userMsg]
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.message,
          recommendations: data.recommendations || []
        }]);
      } else {
        throw new Error(data.error || 'Style assistant encountered an issue.');
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having minor technical difficulties connecting to my stylist catalog right now. Try saying 'saree' or 'kurti' to get recommendations from my database!"
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-crimson text-brand-cream p-4 rounded-full shadow-2xl hover:bg-brand-muted hover:scale-105 transition-all duration-300 flex items-center justify-center border border-brand-gold/30 ring-4 ring-brand-gold/15"
          aria-label="Open AI Assistant"
        >
          <Sparkles className="animate-pulse mr-1" size={20} />
          <span className="text-xs font-semibold pr-1 font-sans hidden sm:inline">Style Assistant</span>
        </button>
      )}

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[500px] bg-brand-white border border-brand-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-shimmer-once">
          
          {/* Header */}
          <div className="bg-brand-crimson text-brand-cream p-4 flex items-center justify-between border-b border-brand-gold/20">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-brand-gold/25 rounded-lg border border-brand-gold/45">
                <Sparkles className="text-brand-gold-light" size={18} />
              </div>
              <div>
                <h4 className="font-display font-bold leading-tight">Style Assistant</h4>
                <p className="text-[10px] text-brand-cream/70 font-sans tracking-wide">Personalized Recommendations</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-brand-cream/80 hover:text-brand-cream hover:bg-brand-muted/20 p-1 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 overflow-y-auto p-4 bg-brand-cream/35 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                
                {/* Chat bubble content */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-brand-crimson text-brand-cream rounded-tr-none'
                      : 'bg-brand-white text-brand-dark border border-brand-border/60 rounded-tl-none font-sans'
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {msg.content}
                </div>

                {/* Recommendations carousel inside the bot bubble */}
                {msg.role === 'assistant' && msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-3 w-full grid grid-cols-1 gap-2 pt-2 border-t border-brand-border/40">
                    <span className="text-[10px] font-semibold text-brand-gold uppercase tracking-wider">Recommended Outfits:</span>
                    {msg.recommendations.map((prod) => (
                      <div
                        key={prod._id}
                        className="flex items-center justify-between p-2 bg-brand-white border border-brand-border rounded-xl shadow-xs hover:border-brand-gold transition-colors duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <img
                            src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=200'}
                            alt={prod.name}
                            className="w-10 h-10 object-cover rounded-md border border-brand-border/60"
                          />
                          <div className="text-left">
                            <h5 className="font-display text-xs font-semibold text-brand-dark line-clamp-1">{prod.name}</h5>
                            <span className="text-[10px] text-brand-crimson font-bold">₹{(prod.price / 100).toFixed(0)}</span>
                          </div>
                        </div>
                        <Link
                          to={`/product/${prod.slug}`}
                          onClick={() => setIsOpen(false)}
                          className="p-1.5 hover:bg-brand-cream text-brand-crimson hover:text-brand-gold rounded-full transition-colors"
                          aria-label={`View ${prod.name}`}
                        >
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start">
                <div className="bg-brand-white border border-brand-border rounded-2xl rounded-tl-none px-4 py-3 flex space-x-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-brand-crimson rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-brand-crimson rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>

          {/* WhatsApp Direct Handoff Option */}
          <div className="px-4 py-1.5 bg-brand-cream border-t border-brand-border/60 text-2xs flex justify-between items-center text-brand-muted select-none">
            <span>Want customized styling on WhatsApp?</span>
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-green-700 font-bold hover:underline"
            >
              <MessageSquare size={10} className="mr-0.5 mt-0.5" /> Start Chat
            </a>
          </div>

          {/* Form Input */}
          <form onSubmit={handleSend} className="p-3 bg-brand-white border-t border-brand-border flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about wedding collection, budget, sizes..."
              className="flex-1 bg-brand-cream border border-brand-border rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm font-sans"
              disabled={loading}
            />
            <button
              type="submit"
              className="p-2 bg-brand-crimson text-brand-cream hover:bg-brand-muted rounded-full transition-colors shrink-0 disabled:opacity-50"
              disabled={loading || !input.trim()}
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
