'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '@/lib/services';
import { FiCalendar, FiMapPin, FiClock, FiCheckCircle, FiInfo, FiActivity, FiList, FiPhone } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { LiveUpdateToggle } from '@/components/live-update-toggle';
import { RequestDetailsModal } from '@/components/request-details-modal';

export default function ActiveMissionsPage() {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false); // Default to ON for active missions
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    requestId: string;
  }>({
    isOpen: false,
    requestId: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['user-requests-active'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data.filter((r: any) => r.status !== 'COMPLETED' && r.status !== 'CANCELLED');
    },
    refetchInterval: isLive ? 5000 : false,
  });

  const confirmArrivalMutation = useMutation({
    mutationFn: (id: string) => requestsAPI.confirmArrival(id),
    onSuccess: () => {
      toast.success('Professional Arrival Confirmed');
      queryClient.invalidateQueries({ queryKey: ['user-requests-active'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED': return <span className="badge badge-created">Sent to Pool</span>;
      case 'ASSIGNED': return <span className="badge badge-assigned">Partner Alerted</span>;
      case 'ACCEPTED': return <span className="badge badge-progress bg-[#6C63FF]/20 text-[#6C63FF]">Partner Ready</span>;
      case 'ON_THE_WAY': return <span className="badge badge-progress bg-[#FF6B9D]/20 text-[#FF6B9D]">In Transit</span>;
      case 'ARRIVED': return <span className="badge badge-progress bg-[#FFB74D]/20 text-[#FFB74D] animate-pulse uppercase tracking-widest">At Location</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress text-[#00D4AA]">Operational</span>;
      default: return <span className="badge bg-white/10 text-white lowercase tracking-widest">{status}</span>;
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

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Active Operations</h1>
          <p className="text-[#8888aa] text-sm italic font-medium">Monitoring your current service dispatches in real-time.</p>
        </div>

        <LiveUpdateToggle isLive={isLive} onToggle={setIsLive} />
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.length === 0 ? (
        <div className="card text-center py-24 border-dashed border-white/10">
          <div className="text-7xl opacity-10 mb-6">🛸</div>
          <h3 className="text-xl font-black text-white mb-2 uppercase tracking-widest">No Active Signals</h3>
          <p className="text-[#8888aa] text-sm italic">All current missions have been resolved or voided.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {data?.map((req: any) => {
            const filteredLogs = req.logs?.filter((l: any, idx: number, arr: any[]) => {
               // Logic to hide rejections and duplicate entries
               if (l.toStatus === 'REJECTED' || l.fromStatus === 'REJECTED') return false;
               if (idx > 0) {
                  const prevLogs = arr.slice(0, idx).filter(pl => pl.toStatus !== 'REJECTED');
                  const lastValid = prevLogs[prevLogs.length - 1];
                  if (lastValid && lastValid.toStatus === l.toStatus) return false;
               }
               return true;
            });

            return (
              <div key={req._id} className="card relative transition-all duration-500 hover:border-[#6C63FF]/30 overflow-hidden group">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-black/40">
                  <div className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] animate-pulse" style={{ width: '100%' }} />
                </div>

                <div className="absolute top-8 right-8">
                  {getStatusBadge(req.status)}
                </div>

                <div className="flex flex-col md:flex-row gap-8 p-4">
                  <div className="flex flex-col items-start gap-4 md:w-1/3">
                    <div className="flex items-start gap-4">
                       <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center text-3xl border border-white/5 transition-transform group-hover:scale-110">
                         {req.serviceId?.icon || '⚙️'}
                       </div>
                       <div className="min-w-0">
                         <h3 className="text-xl font-black text-white mb-1 uppercase tracking-tight truncate">
                           {req.serviceId?.name || 'Protocol'}
                         </h3>
                         <p className="text-[10px] text-[#666680] font-mono tracking-widest uppercase">PULSE: {req._id.slice(-8).toUpperCase()}</p>
                       </div>
                    </div>
                    {req.description && (
                       <div className="p-3 rounded-2xl bg-black/40 border border-white/5 mt-2 w-full">
                          <p className="text-[9px] text-[#666680] font-black uppercase tracking-widest mb-1">Sector Narrative</p>
                          <p className="text-xs text-[#8888aa] leading-relaxed italic line-clamp-2">&quot;{req.description}&quot;</p>
                       </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-8 pt-4 md:pt-0 md:border-l border-white/5 md:pl-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-[10px] font-black text-[#666680] uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FiCalendar className="text-[#6C63FF]" /> Schedule</p>
                        <p className="text-sm text-white font-bold">{formatDate(req.preferredTime)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-[#666680] uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><FiMapPin className="text-[#FF6B9D]" /> Drop Site</p>
                        <p className="text-sm text-[#8888aa] font-medium truncate">{req.address}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-black/40 border border-white/5">
                         <div className="flex items-center gap-4">
                           {req.vendorId ? (
                             <>
                               <div className="w-10 h-10 rounded-full bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] text-[10px] font-black border border-[#6C63FF]/20 uppercase">
                                 {req.vendorId.businessName?.charAt(0) || 'P'}
                               </div>
                               <div className="min-w-0">
                                 <p className="text-[8px] text-[#666680] font-black tracking-widest">Operator Signature</p>
                                 <p className="text-white text-xs font-black truncate">{req.vendorId.businessName || 'AllWays Pro'}</p>
                                 {req.vendorId.phoneNumber && (
                                    <a href={`tel:${req.vendorId.phoneNumber}`} className="text-[10px] text-[#00D4AA] font-bold flex items-center gap-1.5 hover:underline mt-0.5">
                                       <FiPhone size={10} /> {req.vendorId.phoneNumber}
                                    </a>
                                 )}
                               </div>
                             </>
                           ) : (
                             <div className="flex items-center gap-3">
                               <div className="w-2 h-2 rounded-full bg-[#FFB74D] animate-ping" />
                               <span className="text-[10px] text-[#FFB74D] font-black uppercase tracking-widest">Scanning professional network...</span>
                             </div>
                           )}
                         </div>

                         <div className="flex items-center gap-2">
                           {req.status === 'ARRIVED' && (
                             <button
                               onClick={() => setModalConfig({ isOpen: true, requestId: req._id })}
                               disabled={confirmArrivalMutation.isPending}
                               className="px-6 py-2.5 bg-[#00D4AA] text-black font-black text-[10px] rounded-xl shadow-lg shadow-[#00D4AA]/20 hover:scale-105 transition-all uppercase tracking-widest"
                             >
                               ARRIVED
                             </button>
                           )}

                           <button
                             onClick={() => {
                               setSelectedRequest(req);
                               setIsDetailsOpen(true);
                             }}
                             className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white font-black text-[10px] rounded-xl border border-white/5 transition-all uppercase tracking-widest flex items-center gap-2"
                           >
                             <FiList /> AUDIT
                           </button>
                         </div>
                       </div>

                       {/* MISSION LOGS - Wrapped Lineage */}
                       <div className="space-y-4 pt-4 border-t border-white/5">
                          <div className="flex items-center justify-between px-1">
                             <p className="text-[9px] uppercase font-black text-[#666680] tracking-widest flex items-center gap-2"><FiActivity /> MISSION LINEAGE</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 p-1">
                             {filteredLogs?.map((log: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3">
                                   <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight border ${idx === filteredLogs.length - 1 ? 'bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30 shadow-lg shadow-[#6C63FF]/10' : 'bg-black/40 text-[#8888aa] border-white/5 opacity-60'}`}>
                                      {log.toStatus}
                                   </div>
                                   {idx < filteredLogs.length - 1 && <div className="w-1.5 h-1.5 rounded-full bg-white/10 shrink-0" />}
                                </div>
                             ))}
                             {filteredLogs?.length === 0 && <span className="text-[10px] text-[#666680] font-black uppercase tracking-widest italic opacity-40">INITIALIZING PULSE SECTOR...</span>}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={() => confirmArrivalMutation.mutate(modalConfig.requestId)}
        title="Verify Field Professional?"
        message="Confirms you've physically verified the help provider on site. This locks the dispatch and enters deployment phase."
        confirmText="Confirm Presence"
        type="success"
      />

      <RequestDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        role="USER"
      />
    </div>
  );
}
