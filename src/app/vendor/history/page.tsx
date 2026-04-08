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
      case 'COMPLETED': return <span className="px-3 py-1 bg-[var(--accent)]/10 border border-[#00D4AA]/20 text-[var(--accent)] rounded-full text-[9px] text-emphasized uppercase tracking-widest">Completed</span>;
      case 'CANCELLED': return <span className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full text-[9px] text-emphasized uppercase tracking-widest">Cancelled</span>;
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
           <h1 className="text-4xl text-emphasized text-[var(--foreground)] mb-2 tracking-tight">Mission Archives</h1>
           <p className="text-[var(--text-muted)] text-sm italic font-medium">Verifiable ledger of all terminal operational engagements.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-[var(--primary)]/5 border border-[#6C63FF]/10 rounded-2xl">
           <FiTrendingUp className="text-[var(--primary)]" />
           <p className="text-[10px] text-[var(--foreground)]/50 text-emphasized uppercase tracking-widest">Total Resolved: <span className="text-[var(--foreground)]">{history?.length || 0}</span></p>
        </div>
      </div>

      <div className="grid gap-6">
        {history?.map((job: any) => (
          <div key={job._id} className="card !p-4 md:!p-8 hover:border-[#6C63FF]/20 transition-all group overflow-hidden relative border-[var(--border)] bg-soft-dark">
            
            {/* Layout Container */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
               
               {/* Left Section: Service Identity */}
               <div className="flex items-center gap-4 sm:gap-6 flex-1">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-soft-dark flex items-center justify-center text-3xl sm:text-4xl border border-[var(--border)] shrink-0 group-hover:scale-105 transition-transform duration-500">
                    {job.serviceId?.icon || '🔧'}
                  </div>
                  <div className="min-w-0 flex-1">
                     <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                        <h3 className="text-xl sm:text-2xl text-emphasized text-[var(--foreground)] uppercase tracking-tight truncate max-w-[200px] sm:max-w-[300px]">
                          {job.serviceId?.name}
                        </h3>
                        {getStatusBadge(job.status)}
                     </div>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-1 text-[9px] sm:text-[10px] text-[var(--placeholder)] font-bold uppercase tracking-widest">
                        <p className="flex items-center gap-1.5 whitespace-nowrap"><FiClock className="text-[var(--primary)]" /> {formatDate(job.preferredTime)}</p>
                        <p className="italic opacity-60 truncate">Record ID: #{job._id.slice(-8).toUpperCase()}</p>
                     </div>
                  </div>
               </div>

               {/* Right Section: Status & Actions */}
               <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-0 border-t border-[var(--border)] sm:border-0 relative z-10">
                  <span className="w-full sm:w-auto text-center text-[9px] text-[var(--accent)] font-mono tracking-widest bg-[var(--accent)]/5 px-4 py-3 sm:py-2 rounded-xl border border-[#00D4AA]/10 uppercase text-emphasized whitespace-nowrap">
                    Dispatch Finalized ✅
                  </span>
                  <button 
                     onClick={() => {
                        setSelectedRequest(job);
                        setIsDetailsOpen(true);
                     }}
                     className="w-full sm:w-auto px-6 sm:px-8 py-4 sm:py-3 bg-[var(--surface)] border border-[#6C63FF]/20 text-[var(--primary)] text-[10px] text-emphasized tracking-[0.2em] uppercase rounded-2xl hover:bg-[var(--primary)]/10 hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2.5 active:scale-95 whitespace-nowrap"
                  >
                     <FiList /> <span className="sm:hidden">Protocol</span><span className="hidden sm:inline">View Dispatch Protocol</span>
                  </button>
               </div>

            </div>
          </div>
        ))}

        {history?.length === 0 && (
          <div className="card text-center py-24 space-y-6 border-dashed border-[var(--border)] opacity-60">
            <div className="text-7xl text-emphasized text-[var(--foreground)]/5 tracking-tighter">EMPTY LEDGER</div>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto text-xs uppercase tracking-widest text-emphasized italic">No archived mission records detected in the primary matrix.</p>
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
