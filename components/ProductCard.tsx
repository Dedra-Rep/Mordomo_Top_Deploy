
import React from 'react';
import { Recommendation } from '../types';

interface ProductCardProps {
  recommendation: Recommendation;
}

const ProductCard: React.FC<ProductCardProps> = ({ recommendation }) => {
  const getBadgeStyles = () => {
    const label = (recommendation.label || '').toLowerCase();
    if (label.includes('value') || label.includes('preço')) return 'bg-blue-600/20 text-blue-400 border border-blue-500/30';
    if (label.includes('seller') || label.includes('venda') || label.includes('vendido')) return 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30';
    if (label.includes('premium') || label.includes('escolha') || label.includes('choice')) return 'bg-amber-500/20 text-amber-500 border border-amber-500/30';
    return 'bg-white/10 text-gray-300 border border-white/10';
  };

  return (
    <div className="flex-1 w-full group relative bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-3xl border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-2 hover:border-amber-500/30 hover:shadow-amber-500/10">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full group-hover:bg-amber-500/10 transition-colors"></div>
      
      <div className="p-8 flex flex-col h-full relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm ${getBadgeStyles()}`}>
            {recommendation.label}
          </div>
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl border border-white/5">
            {recommendation.platform === 'ebay' ? (
              <i className="fab fa-ebay text-blue-400 text-xl"></i>
            ) : (
              <i className="fab fa-amazon text-amber-500 text-xl"></i>
            )}
          </div>
        </div>
        
        <h3 className="text-xl md:text-2xl font-black text-white mb-3 leading-[1.1] tracking-tight group-hover:text-amber-400 transition-colors">
          {recommendation.title}
        </h3>
        
        {recommendation.price_estimate && (
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-amber-500 font-black text-2xl tracking-tighter">
              {recommendation.price_estimate}
            </span>
            <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Est. Market Price</span>
          </div>
        )}
        
        <div className="flex-1 space-y-4 mb-10">
          {recommendation.why && recommendation.why.map((point, i) => (
            <div key={i} className="flex gap-4 text-sm text-gray-400 leading-relaxed items-start">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1.5 shrink-0"></div>
              <span>{point}</span>
            </div>
          ))}
        </div>

        <a 
          href={recommendation.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full relative overflow-hidden bg-white text-slate-950 font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all uppercase text-xs tracking-widest shadow-[0_10px_20px_rgba(255,255,255,0.1)] hover:bg-amber-500 active:scale-95"
        >
          <span className="relative z-10">{recommendation.cta_text || 'View Selection'}</span>
          <i className="fas fa-chevron-right text-[10px] relative z-10"></i>
        </a>
      </div>
    </div>
  );
};

export default ProductCard;
