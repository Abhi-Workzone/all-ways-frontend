'use client';

import { useState, useEffect } from 'react';
import { FiX, FiCamera, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface EvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (formData: FormData) => void;
  isPending: boolean;
  title: string;
  subtitle: string;
  buttonText: string;
  minImages?: number;
}

export function EvidenceModal({ 
  isOpen, 
  onClose, 
  onComplete, 
  isPending,
  title,
  subtitle,
  buttonText,
  minImages = 2,
  maxImages = 3
}: EvidenceModalProps & { maxImages?: number }) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      previews.forEach(p => URL.revokeObjectURL(p));
      setFiles([]);
      setPreviews([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const currentCount = files.length;
    const remaining = maxImages - currentCount;

    if (remaining <= 0) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    let newFiles = Array.from(selectedFiles);
    if (newFiles.length > remaining) {
      toast.error(`Only ${remaining} more images can be added. Excess files ignored.`);
      newFiles = newFiles.slice(0, remaining);
    }

    setFiles(prev => [...prev, ...newFiles]);
    
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeFile = (idx: number) => {
    URL.revokeObjectURL(previews[idx]);
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    if (files.length < minImages) {
      toast.error(`Minimum ${minImages} evidence images required`);
      return;
    }
    
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });
    
    onComplete(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-[#12121a] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>
              <p className="text-[10px] text-[#666680] font-bold uppercase tracking-widest mt-1">{subtitle}</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-[#8888aa]">
              <FiX size={24} />
           </button>
        </div>

        <div className="p-8 space-y-6">
           <div className="grid grid-cols-2 gap-4">
              {previews.map((img, idx) => (
                 <div key={idx} className="aspect-video rounded-xl border border-white/5 bg-black/40 relative group overflow-hidden">
                    <img src={img} className="w-full h-full object-cover" alt="Proof" />
                    <button 
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       <FiX size={14} />
                    </button>
                 </div>
              ))}
              
              {files.length < maxImages && (
                <label className="aspect-video rounded-xl border-2 border-dashed border-white/10 hover:border-[#6C63FF]/50 transition-colors flex flex-col items-center justify-center cursor-pointer bg-black/20 group">
                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                   <FiUploadCloud className="text-[#666680] group-hover:text-[#6C63FF] mb-2" size={24} />
                   <span className="text-[10px] text-[#666680] font-black uppercase tracking-widest group-hover:text-white transition-colors">Select Files</span>
                </label>
              )}
           </div>

           <div className="bg-[#6C63FF]/5 p-4 rounded-2xl border border-[#6C63FF]/10 flex gap-3">
              <FiCamera className="text-[#6C63FF] mt-0.5" />
              <p className="text-[10px] text-[#8888aa] leading-relaxed">
                 Per operational protocol, you must upload at least <b>{minImages} clear images</b> of the work from your device gallery or camera.
              </p>
           </div>
        </div>

        <div className="p-4 bg-black/40 flex gap-3">
           <button onClick={onClose} className="flex-1 py-3 text-xs font-bold text-[#8888aa] hover:bg-white/5 rounded-2xl transition-colors uppercase tracking-widest">Cancel</button>
           <button 
             onClick={handleSubmit}
             disabled={isPending || files.length < minImages}
             className="flex-1 py-3 bg-[#00D4AA] disabled:bg-white/5 disabled:text-[#666680] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-[#00D4AA]/10 transition-all flex items-center justify-center gap-2"
           >
              {isPending ? 'Processing...' : <><FiCheckCircle /> {buttonText}</>}
           </button>
        </div>
      </div>
    </div>
  );
}
