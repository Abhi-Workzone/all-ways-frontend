'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '@/lib/services';
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiInfo, FiActivity, FiList, FiArchive } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { RequestDetailsModal } from '@/components/request-details-modal';

export default function HistoryPage() {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const { data, isLoading } = useQuery({
    queryKey: ['user-requests-history'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data.filter((r: any) => r.status === 'COMPLETED' || r.status === 'CANCELLED');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="badge badge-completed">Finalized</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled">Voided</span>;
      default: return <span className="badge bg-soft-dark text-[var(--foreground)]">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-10">
        <h1 className="text-3xl text-emphasized text-[var(--foreground)] mb-2 uppercase tracking-tight">Deployment Archives</h1>
        <p className="text-[var(--text-muted)] text-sm italic font-medium">Historical audit of all terminal service operations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-24 border-dashed border-[var(--border)] opacity-60">
          <div className="text-7xl mb-6">📚</div>
          <h3 className="text-xl text-emphasized text-[var(--foreground)] mb-2 uppercase tracking-widest">Archive Empty</h3>
          <p className="text-[var(--text-muted)] text-sm italic">Completed missions will be stored here for auditing purposes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.map((req: any) => (
             <div key={req._id} className="card !p-4 md:!p-5 hover:border-[#6C63FF]/30 transition-all group border-[var(--border)] bg-soft-dark">
                {/* Mobile Layout: Stacked with logical grouping | Desktop Layout: Single Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6">
                   
                   {/* Left Section: Identity & Service */}
                   <div className="flex items-center gap-4 sm:gap-5 flex-1">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-soft-dark border border-[var(--border)] flex items-center justify-center text-2xl sm:text-3xl shrink-0 group-hover:scale-110 transition-transform">
                         {req.serviceId?.icon || '⚙️'}
                      </div>
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center justify-between sm:block">
                            <h3 className="text-base sm:text-lg text-emphasized text-[var(--foreground)] uppercase tracking-tight truncate">
                               {req.serviceId?.name || 'Protocol'}
                            </h3>
                            {/* Mobile-only status badge next to name */}
                            <div className="sm:hidden">
                               {getStatusBadge(req.status)}
                            </div>
                         </div>
                         <p className="text-[10px] text-[var(--placeholder)] font-mono tracking-tighter uppercase mt-0.5 sm:mt-1">
                            SIGNATURE: {req._id.slice(-12).toUpperCase()}
                         </p>
                      </div>
                   </div>

                   {/* Right Section: Metadata & Actions */}
                   <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 border-t border-[var(--border)] pt-4 sm:pt-0 sm:border-t-0">
                      <div className="text-left sm:text-right">
                         <p className="text-[9px] sm:text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest mb-0.5 sm:mb-1">TERMINAL DATE</p>
                         <p className="text-xs sm:text-sm text-[var(--foreground)] font-bold">{formatDate(req.createdAt)}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         {/* Desktop-only status badge */}
                         <div className="hidden sm:block">
                            {getStatusBadge(req.status)}
                         </div>
                         <button 
                           onClick={() => {
                             setSelectedRequest(req);
                             setIsDetailsOpen(true);
                           }}
                           className="p-2.5 sm:p-3 bg-soft-dark hover:bg-[var(--primary)]/10 text-[var(--foreground)] hover:text-[var(--primary)] rounded-xl border border-[var(--border)] transition-all"
                           title="Examine Protocol"
                         >
                            <FiList size={18} />
                         </button>
                      </div>
                   </div>

                </div>
             </div>
          ))}
        </div>
      )}

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        role="USER"
      />
    </div>
  );
}
