
import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  name: string;
  text: string;
  date: string;
  likes: number;
}

export const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newName, setNewName] = useState('');
  const [newText, setNewText] = useState('');

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('quantscan_messages');
    if (saved) {
      try {
          setMessages(JSON.parse(saved));
      } catch (e) {
          console.error("Failed to parse messages", e);
      }
    } else {
        // Seed some initial data if empty
        const initialMessages = [
            { 
              id: '1', 
              name: 'Dr. Alpha', 
              text: 'The momentum factor seems to be decaying in recent crypto markets. Has anyone seen good papers on this?', 
              date: new Date(Date.now() - 86400000 * 2).toLocaleDateString(), 
              likes: 12 
            },
            { 
              id: '2', 
              name: 'QuantDev', 
              text: 'Found a great paper on Transformer models for limit order books on arXiv today!', 
              date: new Date(Date.now() - 86400000).toLocaleDateString(), 
              likes: 5 
            }
        ];
        setMessages(initialMessages);
        localStorage.setItem('quantscan_messages', JSON.stringify(initialMessages));
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newText.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      name: newName,
      text: newText,
      date: new Date().toLocaleDateString(),
      likes: 0
    };

    const updated = [msg, ...messages];
    setMessages(updated);
    localStorage.setItem('quantscan_messages', JSON.stringify(updated));
    setNewName('');
    setNewText('');
  };

  const handleLike = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, likes: m.likes + 1 } : m);
    setMessages(updated);
    localStorage.setItem('quantscan_messages', JSON.stringify(updated));
  };

  return (
    <section className="mt-20 border-t border-slate-200 dark:border-slate-800 pt-12">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Input Column */}
        <div className="md:w-1/3 space-y-6">
          <div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <i className="fas fa-comments text-blue-600"></i>
                Community Board
             </h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Share your thoughts, ask for papers, or discuss strategies. 
                <span className="opacity-60 block mt-1 text-xs">(Stored locally in your browser)</span>
             </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Name / Handle</label>
                 <input 
                   required
                   maxLength={20}
                   type="text"
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
                   placeholder="QuantAnalyst"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Message</label>
                 <textarea 
                   required
                   maxLength={280}
                   rows={3}
                   value={newText}
                   onChange={(e) => setNewText(e.target.value)}
                   className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
                   placeholder="Any good papers on..."
                 />
               </div>
               <button 
                type="submit"
                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity text-sm"
               >
                 Post Message
               </button>
             </div>
          </form>
        </div>

        {/* List Column */}
        <div className="md:w-2/3">
          <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    No messages yet. Be the first to post!
                </div>
            ) : (
                messages.map(msg => (
                <div key={msg.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                                {msg.name.slice(0, 2)}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{msg.name}</h4>
                                <span className="text-[10px] text-slate-400">{msg.date}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleLike(msg.id)}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-pink-500 transition-colors group"
                        >
                            <i className={`fas fa-heart ${msg.likes > 0 ? 'text-pink-500' : 'group-hover:text-pink-500'}`}></i>
                            {msg.likes > 0 && <span>{msg.likes}</span>}
                        </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed pl-10">
                        {msg.text}
                    </p>
                </div>
                ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
