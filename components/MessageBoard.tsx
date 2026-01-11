
import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  name: string;
  text: string;
  date: string;
}

const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('quantscan_messages');
    if (stored) {
      setMessages(JSON.parse(stored));
    } else {
      // Default mock messages for first-time users
      setMessages([
        {
          id: '1',
          name: 'ResearchBot',
          text: 'Welcome to the community board! Feel free to leave feedback or discuss the latest alpha.',
          date: new Date().toLocaleDateString()
        }
      ]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      name: name.trim(),
      text: text.trim(),
      date: new Date().toLocaleDateString()
    };

    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    localStorage.setItem('quantscan_messages', JSON.stringify(updatedMessages));
    
    setText('');
    // Keep name populated for convenience
  };

  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Header / Toggle */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-6 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
               <i className="fas fa-comments"></i>
             </div>
             <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Community Discussion</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {messages.length} comments • Leave a message
                </p>
             </div>
          </div>
          <i className={`fas fa-chevron-down text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}></i>
        </div>

        {/* Content Area */}
        {isExpanded && (
          <div className="p-6 animate-fade-in">
            {/* Input Form */}
            <form onSubmit={handleSubmit} className="mb-8 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex flex-col gap-3">
                    <input 
                        type="text"
                        placeholder="Your Name / Alias"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={30}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                    <textarea 
                        placeholder="Share your thoughts..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={2}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                    <div className="flex justify-end">
                        <button 
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                        >
                            Post Message
                        </button>
                    </div>
                </div>
            </form>

            {/* Message List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className="group">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{msg.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{msg.date}</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl">
                            {msg.text}
                        </p>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBoard;
