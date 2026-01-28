import React, { useState, useEffect, useRef } from "react";

export default function WhatsAppChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'ai' | 'user' }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const WHATSAPP_NUMBER = "+919392959397"; // Placeholder

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      simulateGrit();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const simulateGrit = async () => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1000));
    setMessages([{ text: "Protocol Initialized. Welcome to SB Tech Solution Support Core.", sender: 'ai' }]);
    
    await new Promise(r => setTimeout(r, 800));
    setMessages(prev => [...prev, { text: "How can we assist your digital deployment today?", sender: 'ai' }]);
    setIsTyping(false);
  };

  const handleAction = (type: string) => {
    const text = `Hi SB Tech Solution, I'm interested in ${type}. Can you help me?`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed bottom-8 right-8 z-[500] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-6 w-[320px] md:w-[380px] bg-brand-card/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-brand-primary/20 to-brand-secondary/20 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white shadow-glow">
                  <span className="material-symbols-outlined text-xl">smart_toy</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-brand-card rounded-full animate-pulse"></div>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-tight">Support Core</h4>
                <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">Active System</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Chat Body */}
          <div className="flex-1 h-[350px] overflow-y-auto no-scrollbar p-6 space-y-4 bg-black/20">
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.sender === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in duration-300`}
              >
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                  msg.sender === 'ai' 
                  ? 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none' 
                  : 'bg-brand-primary text-white rounded-tr-none shadow-glow'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:200ms]"></div>
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:400ms]"></div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-white/5 bg-black/40">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-4">Quick Protocols</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {['Rental Extension', 'B2B Pricing', 'Tech Issues'].map((action) => (
                <button 
                  key={action}
                  onClick={() => handleAction(action)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[9px] font-bold py-2 px-4 rounded-full transition-all uppercase tracking-widest"
                >
                  {action}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => handleAction('General Inquiry')}
              className="w-full bg-[#25D366] hover:brightness-110 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Establish Uplink
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow-[0_10px_40px_rgba(37,211,102,0.3)] hover:scale-110 active:scale-95 transition-all duration-300 relative group"
      >
        <div className="absolute inset-0 rounded-full animate-ping bg-[#25D366] opacity-20 pointer-events-none group-hover:hidden"></div>
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </button>
    </div>
  );
}