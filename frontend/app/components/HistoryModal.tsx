import { useEffect, useState } from 'react';

type HistoryItem = {
  id: string;
  wallet_address: string;
  prompt: string;
  media_url: string;
  created_at: string;
};

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress?: string;
}

export default function HistoryModal({ isOpen, onClose, walletAddress }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && walletAddress) {
      fetchHistory();
    }
  }, [isOpen, walletAddress]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/history?walletAddress=${walletAddress}`);
      const data = await response.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      {/* Mobile-first card: Bottom sheet on mobile, centered narrow card on desktop */}
      <div 
        className="
          bg-[#111] 
          border-t sm:border border-white/10 
          rounded-t-[32px] sm:rounded-[32px] 
          w-full sm:max-w-[400px] 
          h-[85vh] sm:h-[800px] sm:max-h-[90vh] 
          flex flex-col 
          shadow-2xl 
          animate-in slide-in-from-bottom duration-300
        "
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#111] rounded-t-[32px] relative">
          {/* Draggable handle indicator for mobile feel */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-800 rounded-full sm:hidden"></div>
          
          <h2 className="text-xl font-bold text-white flex items-center gap-2 pt-2 sm:pt-0">
            History
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full hover:bg-white/10 pt-2 sm:pt-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50%] text-center text-gray-500">
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
               </div>
              <p className="text-lg font-medium text-white/80">No history yet</p>
              <p className="text-sm mt-1 max-w-[200px]">Create your first hook to see it here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-2xl p-4 flex gap-4 hover:bg-white/10 transition-colors border border-white/5 group items-start">
                  
                  {/* Conditional Media Rendering */}
                  {item.media_url ? (
                    <div className="w-24 h-24 bg-gray-800 rounded-xl overflow-hidden shrink-0 relative border border-white/10 shadow-lg">
                       {/* Generated Badge */}
                       <div className="absolute top-1 left-1 z-10 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] text-white font-bold border border-white/10">
                          Generated
                       </div>
                       
                       {item.media_url.endsWith('.mp4') || item.media_url.endsWith('.webm') ? (
                          <video 
                            src={item.media_url} 
                            className="w-full h-full object-cover"
                            poster={item.media_url + '#t=0.1'} // Try to grab first frame
                            muted 
                            loop 
                            onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                            onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                          />
                       ) : (
                          <img 
                            src={item.media_url} 
                            alt="Generated" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image
                            }}
                          />
                       )}
                       
                       {/* Checkmark overlay (Visual flair from user request) */}
                       <div className="absolute bottom-1 right-1">
                          <svg className="w-4 h-4 text-green-500 drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                    </div>
                  ) : null}

                  {/* Content Container - Expands if no image */}
                  <div className="flex-1 min-w-0 flex flex-col h-full justify-between gap-3">
                    <div className="relative">
                       {/* Badge if no image, just to show it's a hook */}
                       {!item.media_url && (
                          <span className="inline-block text-[10px] text-blue-400 font-bold mb-1 mr-2 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                             Hook
                          </span>
                       )}
                       <p className="text-white text-sm line-clamp-3 leading-relaxed font-light text-white/90">
                         {item.prompt}
                       </p>
                    </div>

                    <div className="flex items-end justify-between mt-1">
                        <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-md">
                           {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        
                        <a 
                            href={`https://warpcast.com/~/compose?text=${encodeURIComponent(item.prompt + '\n\n#HookLab #Farcaster')}${item.media_url ? `&embeds[]=${encodeURIComponent(item.media_url)}` : ''}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg transition-all group/btn"
                            title="Post on Base"
                        >
                            <img src="https://warpcast.com/favicon.ico" alt="Base" className="w-3.5 h-3.5 rounded-full opacity-70 group-hover/btn:opacity-100 transition-opacity" />
                            <span className="text-xs font-medium text-white/70 group-hover/btn:text-white transition-colors">Post</span>
                        </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
