'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FiClock, FiCheckCircle, FiSkipBack, FiPlayCircle, FiMessageSquare, FiList, FiTrendingUp } from 'react-icons/fi';
import { useState } from 'react';
import { RequestDetailsModal } from '@/components/request-details-modal';

export default function VendorHistoryPage() {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ['vendor-history'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      // Show only terminal statuses
      const terminalStatuses = ['COMPLETED', 'CANCELLED'];
      return data.data.filter((job: any) => terminalStatuses.includes(job.status));
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="px-3 py-1 bg-[#00D4AA]/10 border border-[#00D4AA]/20 text-[#00D4AA] rounded-full text-[9px] font-black uppercase tracking-widest">Completed</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest">Cancelled</span>;
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleString('en-GB', {
       day: 'numeric',
       month: 'short',
       year: 'numeric',
       hour: 'numeric',
       minute: '2-digit',
       hour12: true
     });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Mission Archives</h1>
           <p className="text-[#8888aa] text-sm italic font-medium">Verifiable ledger of all terminal operational engagements.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-[#6C63FF]/5 border border-[#6C63FF]/10 rounded-2xl">
           <FiTrendingUp className="text-[#6C63FF]" />
           <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Total Resolved: <span className="text-white">{history?.length || 0}</span></p>
        </div>
      </div>

      <div className="grid gap-6">
        {history?.map((job: any) => (
          <div key={job._id} className="card !p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 overflow-hidden relative group hover:border-[#6C63FF]/20 transition-all">
            
            <div className="flex items-start gap-6 flex-1">
               <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center text-4xl border border-white/5 group-hover:scale-110 transition-transform duration-500">
                 {job.serviceId?.icon || '🔧'}
               </div>
               <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                     <h3 className="font-black text-white text-2xl uppercase tracking-tight truncate max-w-[300px]">{job.serviceId?.name}</h3>
                     {getStatusBadge(job.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-5 text-[10px] text-[#666680] font-bold uppercase tracking-widest">
                     <p className="flex items-center gap-1.5"><FiClock className="text-[#6C63FF]" /> {formatDate(job.preferredTime)}</p>
                     <p className="italic opacity-60">Record ID: #{job._id.slice(-8).toUpperCase()}</p>
                  </div>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
               <span className="text-[9px] text-[#00D4AA] font-mono tracking-widest bg-[#00D4AA]/5 px-4 py-2 rounded-xl border border-[#00D4AA]/10 uppercase font-black">Dispatch Finalized ✅</span>
               <button 
                  onClick={() => {
                     setSelectedRequest(job);
                     setIsDetailsOpen(true);
                  }}
                  className="px-8 py-3 bg-[#12121a] border border-[#6C63FF]/20 text-[#6C63FF] text-[10px] font-black tracking-[0.2em] uppercase rounded-2xl hover:bg-[#6C63FF]/10 hover:translate-y-[-2px] transition-all flex items-center gap-2.5 active:scale-95 whitespace-nowrap"
               >
                  <FiList /> View Dispatch Protocol
               </button>
            </div>
          </div>
        ))}

        {history?.length === 0 && (
          <div className="card text-center py-24 space-y-6 border-dashed border-white/10 opacity-60">
            <div className="text-7xl font-black text-white/5 tracking-tighter">EMPTY LEDGER</div>
            <p className="text-[#8888aa] max-w-sm mx-auto text-xs uppercase tracking-widest font-black italic">No archived mission records detected in the primary matrix.</p>
          </div>
        )}
      </div>

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        role="VENDOR"
      />
    </div>
  );
}
