
import React, { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, email }) => {
  const [formData, setFormData] = useState({ name: '', userEmail: '', message: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Message from QuantScan User: ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.userEmail}\n\nMessage:\n${formData.message}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Leave a Message</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Have questions about the reports or want to collaborate? Drop me a line.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Your Name</label>
            <input 
              required
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Your Email</label>
            <input 
              required
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Message</label>
            <textarea 
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all dark:text-white resize-none"
              placeholder="Tell me what's on your mind..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] mt-2"
          >
            Send Message
          </button>
        </form>

        <p className="mt-6 text-center text-[10px] text-slate-400 uppercase tracking-widest">
          Direct Email: {email}
        </p>
      </div>
    </div>
  );
};

export default ContactModal;
