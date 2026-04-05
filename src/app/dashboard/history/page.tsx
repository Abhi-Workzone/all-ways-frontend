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
      default: return <span className="badge bg-white/10 text-white">{status}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Deployment Archives</h1>
        <p className="text-[#8888aa] text-sm italic font-medium">Historical audit of all terminal service operations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-24 border-dashed border-white/10 opacity-60">
          <div className="text-7xl mb-6">📚</div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Archive Empty</h3>
          <p className="text-[#8888aa] text-sm italic">Completed missions will be stored here for auditing purposes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {data?.map((req: any) => (
             <div key={req._id} className="card !p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:border-[#6C63FF]/30 transition-all group border-white/5 bg-black/20">
                <div className="flex items-center gap-5 md:w-1/2">
                   <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {req.serviceId?.icon || '⚙️'}
                   </div>
                   <div className="min-w-0">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight truncate">{req.serviceId?.name || 'Protocol'}</h3>
                      <p className="text-[10px] text-[#666680] font-mono tracking-tighter uppercase mt-1">SIGNATURE: {req._id.slice(-12).toUpperCase()}</p>
                   </div>
                </div>

                <div className="flex items-center gap-8 pr-4">
                   <div className="text-right">
                      <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest mb-1">TERMINAL DATE</p>
                      <p className="text-sm text-white font-bold">{formatDate(req.createdAt)}</p>
                   </div>
                   
                   <div className="flex items-center gap-3">
                      {getStatusBadge(req.status)}
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsDetailsOpen(true);
                        }}
                        className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-all"
                      >
                         <FiList size={18} />
                      </button>
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
