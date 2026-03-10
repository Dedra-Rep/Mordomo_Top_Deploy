
import React, { useState, useRef, useEffect } from 'react';
import { ButlerMascot } from './components/ButlerMascot';
import ProductCard from './components/ProductCard';
import { MascotState, ChatMessage, UserRole, InputContext, Locale } from './types';
import { geminiService } from './services/geminiService';
import { REGION_CONFIGS } from './constants';

const DEFAULT_LOCALE: Locale = 'pt-BR';

const UI_TEXTS = {
  'en-US': {
    title: 'Elite Personal',
    titleAccent: 'eBay US Butler.',
    subtitle: 'Curated American Market Analysis & Verified Affiliate Recommendations.',
    placeholder: 'How may I assist your US acquisitions today?',
    consultBtn: 'CONSULT',
    greeting: "Welcome back, sir. I have synchronized with the latest eBay US market trends. I am prepared to curate the finest selections for your consideration. What shall we acquire today?",
    selectionTitle: "Mordomo's Curated Selections:",
    sourcesTitle: "Verified Market Intelligence Sources:",
    error: "My apologies, sir. I encountered a minor disturbance in the data stream. Shall we try again?",
    status: "Real-Time eBay Index",
    switchRegion: "Switch to Brazil"
  },
  'pt-BR': {
    title: 'Personal Shopper',
    titleAccent: 'Elite Amazon Brasil.',
    subtitle: 'Análise Curada do Mercado Brasileiro e Recomendações Exclusivas via Amazon.',
    placeholder: 'Como posso ajudar com suas compras no Brasil hoje?',
    consultBtn: 'CONSULTAR',
    greeting: "Seja bem-vindo, senhor. Sincronizei os dados mais recentes do mercado Amazon Brasil. Estou pronto para curar as melhores seleções para sua consideração. O que vamos adquirir hoje?",
    selectionTitle: "Seleções Curadas do Mordomo:",
    sourcesTitle: "Fontes de Inteligência de Mercado:",
    error: "Peço desculpas, senhor. Encontrei uma pequena instabilidade no fluxo de dados. Vamos tentar novamente?",
    status: "Amazon Brasil Live",
    switchRegion: "Mudar para Estados Unidos"
  }
};

const App: React.FC = () => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mascotState, setMascotState] = useState<MascotState>(MascotState.IDLE);
  const [isTyping, setIsTyping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMascotVisible, setIsMascotVisible] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSource = useRef<AudioBufferSourceNode | null>(null);

  const region = REGION_CONFIGS[currentLocale];
  const ui = UI_TEXTS[currentLocale];

  useEffect(() => {
    const triggerGreeting = async () => {
      stopAudio();
      setMessages([{ role: 'model', text: ui.greeting }]);
      setMascotState(MascotState.SPEAKING);
      
      if (!isMuted) {
        const audioBuffer = await geminiService.speak(ui.greeting, currentLocale);
        if (audioBuffer) playAudio(audioBuffer);
      } else {
        setTimeout(() => setMascotState(MascotState.IDLE), 3000);
      }
    };
    triggerGreeting();
  }, [currentLocale]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const stopAudio = () => {
    if (currentAudioSource.current) {
      currentAudioSource.current.stop();
      currentAudioSource.current = null;
    }
    setMascotState(MascotState.IDLE);
  };

  const playAudio = (buffer: AudioBuffer) => {
    stopAudio();
    if (!audioContextRef.current) audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => { setMascotState(MascotState.IDLE); currentAudioSource.current = null; };
    currentAudioSource.current = source;
    source.start(0);
    setMascotState(MascotState.SPEAKING);
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const query = input;
    const userMsg: ChatMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setMascotState(MascotState.THINKING);

    try {
      const ctx: InputContext = {
        query,
        tenant: "mordomo",
        user_id: "anon",
        source: "site",
        locale: currentLocale,
        market: region.market,
        currency: region.currency
      };

      const result = await geminiService.getRecommendations(ctx);
      const modelMsg: ChatMessage = { 
        role: 'model', 
        text: result.text, 
        recommendations: result.OUTPUT?.recommendations,
        sources: result.sources
      };
      
      setMessages(prev => [...prev, modelMsg]);
      
      if (!isMuted && modelMsg.text) {
        const audioBuffer = await geminiService.speak(modelMsg.text, currentLocale);
        if (audioBuffer) playAudio(audioBuffer);
      } else {
        setMascotState(MascotState.IDLE);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: ui.error }]);
      setMascotState(MascotState.IDLE);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleRegion = () => {
    setCurrentLocale(prev => prev === 'en-US' ? 'pt-BR' : 'en-US');
    setMessages([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0210] text-gray-100 selection:bg-amber-500/30 overflow-x-hidden selection:text-white">
      {/* Premium Header */}
      <header className="fixed top-0 w-full z-[100] bg-[#0b0210]/80 backdrop-blur-3xl border-b border-white/[0.05] px-6 py-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 text-slate-950 rounded-2xl flex items-center justify-center font-black text-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-110">M</div>
          <div className="flex flex-col -gap-1">
            <span className="text-xl font-black tracking-tighter uppercase italic leading-none">Mordomo<span className="text-amber-500">.{currentLocale === 'en-US' ? 'TOP' : 'AI'}</span></span>
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.3em] uppercase">{currentLocale === 'en-US' ? 'US Premium Butler' : 'Mordomo Elite Brasil'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Status Indicator - Changed to Emerald Green */}
          <div className="hidden sm:flex items-center gap-3 bg-emerald-500/10 text-emerald-400 px-5 py-2 rounded-full border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {ui.status}
          </div>

          {/* Region Switcher with High-Quality Flag Image */}
          <button 
            onClick={toggleRegion}
            className="flex items-center gap-4 bg-white/5 px-6 py-2.5 rounded-full border border-white/5 hover:bg-white/10 transition-all shadow-lg active:scale-95 group"
            title={ui.switchRegion}
          >
            <div className="w-9 h-6 overflow-hidden rounded-[2px] shadow-sm border border-white/10 transition-transform group-hover:scale-110">
              <img 
                src={region.flagUrl} 
                alt={region.countryName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-200">{region.countryName}</span>
              <span className="text-[7px] font-bold uppercase text-amber-500/60 tracking-widest mt-0.5">{ui.switchRegion}</span>
            </div>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pt-44 pb-64 overflow-y-auto" ref={scrollRef}>
        <ButlerMascot 
          state={mascotState}
          role={currentLocale === 'en-US' ? UserRole.TOP : UserRole.CUSTOMER}
          isMuted={isMuted}
          isVisible={isMascotVisible}
          onStop={stopAudio}
          onMuteToggle={() => setIsMuted(!isMuted)}
          onDismiss={() => setIsMascotVisible(false)}
          onOpen={() => setIsMascotVisible(true)}
        />

        <div className="space-y-20 max-w-6xl mx-auto">
          {messages.length <= 1 && (
            <div className="text-center py-20 md:py-32 animate-in fade-in zoom-in duration-1000">
              <div className="inline-block px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8">
                Official {region.countryName} Edition
              </div>
              <h1 className="text-6xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9]">
                {ui.title}<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-500 to-amber-900 drop-shadow-sm">
                  {ui.titleAccent}
                </span>
              </h1>
              <p className="text-gray-500 text-lg md:text-2xl max-w-2xl mx-auto font-medium leading-relaxed italic">
                {ui.subtitle}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`group relative p-8 rounded-[3rem] max-w-[90%] md:max-w-3xl shadow-2xl transition-all ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold rounded-tr-none' 
                  : 'bg-white/[0.03] border border-white/10 text-gray-200 backdrop-blur-3xl rounded-tl-none ring-1 ring-white/5'
              }`}>
                <p className="text-lg md:text-xl leading-relaxed">{msg.text}</p>
              </div>
              
              {msg.recommendations && msg.recommendations.length > 0 && (
                <div className="w-full mt-6 space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                    <h4 className="text-amber-500/40 font-black uppercase tracking-[0.4em] text-[11px] whitespace-nowrap">
                      {ui.selectionTitle}
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {msg.recommendations.map((rec, idx) => (
                      <ProductCard key={idx} recommendation={rec} />
                    ))}
                  </div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="p-10 bg-white/[0.01] border border-white/[0.05] rounded-[4rem] backdrop-blur-3xl animate-in fade-in duration-1000 mt-20">
                       <h5 className="text-gray-500 font-black uppercase tracking-[0.3em] text-[10px] mb-8 flex items-center gap-4">
                         <i className="fas fa-shield-halved text-amber-500/30"></i>
                         {ui.sourcesTitle}
                       </h5>
                       <div className="flex flex-wrap gap-4">
                          {msg.sources.map((source, sIdx) => (
                            <a 
                              key={sIdx} 
                              href={source.uri} 
                              target="_blank" 
                              className="text-[10px] bg-white/5 hover:bg-white text-gray-400 hover:text-slate-950 px-6 py-3 rounded-2xl border border-white/5 transition-all font-black uppercase tracking-widest flex items-center gap-2"
                            >
                              <i className="fas fa-link text-[8px] opacity-50"></i>
                              {source.title.length > 40 ? source.title.substring(0, 40) + '...' : source.title}
                            </a>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-6 p-6 bg-white/[0.03] w-fit rounded-full px-10 border border-white/10 animate-pulse shadow-2xl">
              <div className="flex gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-500/90">
                {currentLocale === 'en-US' ? 'Analyzing US Market Liquidity' : 'Analisando Mercado Brasileiro'}
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Futuristic Fixed Input Bar */}
      <div className="fixed bottom-0 left-0 w-full p-8 md:p-12 pointer-events-none z-[150] bg-gradient-to-t from-[#0b0210] via-[#0b0210]/90 to-transparent">
        <div className="max-w-4xl mx-auto relative pointer-events-auto group">
          <div className="absolute -top-14 left-8 text-[10px] font-black text-amber-500/40 uppercase tracking-[0.4em] opacity-0 group-focus-within:opacity-100 transition-all transform translate-y-2 group-focus-within:translate-y-0">
            {currentLocale === 'en-US' ? 'Secure Commercial Access Point' : 'Ponto de Acesso Comercial Seguro'}
          </div>
          <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-3 flex items-center gap-3 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-3xl focus-within:border-amber-500/50 transition-all focus-within:ring-4 ring-amber-500/5">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={ui.placeholder}
              className="flex-1 bg-transparent border-none outline-none px-8 py-5 text-white font-medium placeholder:text-gray-600 text-xl"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-white hover:bg-amber-500 disabled:bg-gray-800 disabled:text-gray-600 text-slate-950 font-black px-12 py-5 rounded-[2.2rem] transition-all active:scale-95 uppercase text-xs tracking-[0.2em] flex items-center gap-4 shadow-2xl hover:shadow-amber-500/20"
            >
              {ui.consultBtn}
              <i className="fas fa-paper-plane text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
