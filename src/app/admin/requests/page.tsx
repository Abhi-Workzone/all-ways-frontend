'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI, servicesAPI, usersAPI } from '@/lib/services';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiUserPlus, FiClock, FiMapPin, FiCheckCircle, FiXCircle, FiUser, FiList, FiFileText, FiActivity, FiSearch, FiArchive } from 'react-icons/fi';
import { ConfirmModal } from '@/components/confirm-modal';
import { LiveUpdateToggle } from '@/components/live-update-toggle';
import { RequestDetailsModal } from '@/components/request-details-modal';

export default function AdminRequestsPage() {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; vendorId: string; requestId: string }>({
    isOpen: false,
    vendorId: '',
    requestId: '',
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data;
    },
    refetchInterval: isLive ? 5000 : false,
  });

  const filteredRequests = requests?.filter((req: any) => {
    if (activeTab === 'ACTIVE') {
      return !['COMPLETED', 'CANCELLED'].includes(req.status);
    }
    return ['COMPLETED', 'CANCELLED'].includes(req.status);
  });

  const { data: vendors, isLoading: isVendorsLoading } = useQuery({
    queryKey: ['service-vendors', selectedRequest?.serviceId?._id],
    queryFn: async () => {
      if (!selectedRequest?.serviceId?._id) return [];
      const { data } = await requestsAPI.getVendorsByService(selectedRequest.serviceId._id);
      return data.data;
    },
    enabled: !!selectedRequest && isAssignModalOpen,
  });

  const assignMutation = useMutation({
    mutationFn: ({ requestId, vendorId }: { requestId: string; vendorId: string }) => 
      requestsAPI.assignVendor(requestId, vendorId),
    onSuccess: () => {
      toast.success('Dispatch successful');
      setIsAssignModalOpen(false);
      setSelectedRequest(null);
      queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED': return <span className="badge badge-created !text-[9px]">Pool Entry</span>;
      case 'ASSIGNED': return <span className="badge badge-assigned !text-[9px]">Dispatched</span>;
      case 'ACCEPTED': return <span className="badge !text-[9px] bg-[#6C63FF]/20 text-[#6C63FF]">Committed</span>;
      case 'ON_THE_WAY': return <span className="badge !text-[9px] bg-[#FF6B9D]/20 text-[#FF6B9D]">En Route</span>;
      case 'ARRIVED': return <span className="badge !text-[9px] bg-[#FFB74D]/20 text-[#FFB74D]">On Site</span>;
      case 'IN_PROGRESS': return <span className="badge badge-progress !text-[9px] text-[#00D4AA]">Operational</span>;
      case 'COMPLETED': return <span className="badge badge-completed !text-[9px]">Finalized</span>;
      case 'CANCELLED': return <span className="badge badge-cancelled !text-[9px]">Voided</span>;
      default: return <span className="badge !text-[9px] bg-white/10 text-white">{status}</span>;
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
    <div className="max-w-6xl mx-auto w-full space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">System Pulse Console</h1>
          <p className="text-[#8888aa] text-sm">Orchestrate field operations and verify service audits.</p>
        </div>

        <div className="flex items-center gap-4">
           {/* Live Toggle */}
           <LiveUpdateToggle isLive={isLive} onToggle={setIsLive} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex p-1 bg-black/40 border border-white/5 rounded-2xl w-fit">
         <button 
           onClick={() => setActiveTab('ACTIVE')}
           className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'ACTIVE' ? 'bg-[#6C63FF] text-white' : 'text-[#8888aa] hover:text-white'}`}
         >
            <FiList /> Active Flow
         </button>
         <button 
           onClick={() => setActiveTab('HISTORY')}
           className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-[#6C63FF] text-white' : 'text-[#8888aa] hover:text-white'}`}
         >
            <FiArchive /> Audit History
         </button>
      </div>

      <div className="grid gap-4">
        {filteredRequests?.map((req: any) => (
          <div key={req._id} className="card !p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative group overflow-hidden border-white/5 hover:border-[#6C63FF]/30 transition-all duration-300">
             
             <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center text-3xl border border-white/5 group-hover:scale-105 transition-transform duration-500">
                   {req.serviceId?.icon || '⚙️'}
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                   <div className="flex items-center gap-3">
                      <h3 className="font-black text-white text-lg truncate uppercase tracking-tight">{req.serviceId?.name}</h3>
                      {getStatusBadge(req.status)}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                      <p className="text-[11px] text-[#8888aa] flex items-center gap-2"><FiClock className="text-[#6C63FF]" /> {formatDate(req.preferredTime)}</p>
                      <p className="text-[11px] text-[#8888aa] flex items-center gap-2 truncate"><FiMapPin className="text-[#FF6B9D]" /> {req.address}</p>
                      <p className="text-[11px] text-[#00D4AA] flex items-center gap-2 truncate font-mono uppercase tracking-tighter"><FiUser /> CL: {req.userId?.email}</p>
                      {req.vendorId && (
                         <p className="text-[11px] text-[#FFB74D] flex items-center gap-2 truncate"><FiCheckCircle /> VD: {req.vendorId.businessName || req.vendorId.fullName}</p>
                      )}
                   </div>

                   {/* ISSUE DESCRIPTION */}
                   <div className="pt-2 px-1">
                      <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest mb-1.5 flex items-center gap-2 opacity-80"><FiFileText /> Service Narrative</p>
                      <p className="text-[11px] text-[#8888aa] italic line-clamp-1 group-hover:line-clamp-none transition-all duration-500 bg-white/5 p-3 rounded-xl border border-white/5">&quot;{req.description}&quot;</p>
                   </div>

                   {/* MISSION LINEAGE - Wrapped Breadcrumb */}
                   <div className="space-y-4 pt-4 border-t border-white/5">
                       <p className="text-[9px] uppercase font-black text-[#666680] tracking-widest flex items-center gap-2 px-1"><FiActivity /> MISSION LINEAGE</p>
                       <div className="flex flex-wrap items-center gap-2 p-1">
                          {req.logs?.filter((l: any, idx: number, arr: any[]) => {
                             // Standard Log Filter logic
                             if (l.toStatus === 'REJECTED' || l.fromStatus === 'REJECTED') return false;
                             if (idx > 0) {
                                const prevLogs = arr.slice(0, idx).filter(pl => pl.toStatus !== 'REJECTED');
                                const lastValid = prevLogs[prevLogs.length - 1];
                                if (lastValid && lastValid.toStatus === l.toStatus) return false;
                             }
                             return true;
                          }).map((log: any, idx: number, filteredArr: any[]) => (
                             <div key={idx} className="flex items-center gap-2">
                                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-tight border ${idx === filteredArr.length - 1 ? 'bg-[#6C63FF]/20 text-[#6C63FF] border-[#6C63FF]/30 shadow-lg shadow-[#6C63FF]/10' : 'bg-black/40 text-[#8888aa] border-white/5 opacity-60'}`}>
                                   {log.toStatus}
                                </div>
                                {idx < filteredArr.length - 1 && <div className="w-1 h-1 rounded-full bg-white/10 shrink-0" />}
                             </div>
                          ))}
                          {(!req.logs || req.logs.length === 0) && <span className="text-[9px] text-[#666680] font-black uppercase tracking-widest italic opacity-40">INITIALIZING PULSE SECTOR...</span>}
                       </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-3 xl:border-l border-white/5 xl:pl-6 bg-black/20 p-4 xl:p-0 xl:bg-transparent rounded-2xl xl:rounded-none">
                {(req.status === 'REQUESTED' || req.status === 'ASSIGNED') && activeTab === 'ACTIVE' && (
                  <button 
                    onClick={() => {
                        setSelectedRequest(req);
                        setIsAssignModalOpen(true);
                    }}
                    className="px-6 py-2.5 bg-[#6C63FF] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-[#6C63FF]/10 flex items-center gap-2"
                  >
                    <FiUserPlus /> {req.vendorId ? 'Re-Dispatch' : 'Dispatch'}
                  </button>
                )}
                
                <button 
                  onClick={() => {
                     setSelectedRequest(req);
                     setIsDetailsOpen(true);
                  }}
                  className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[#8888aa] hover:bg-white/10 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                   <FiActivity /> Audit Info
                </button>
             </div>
             
             {/* Progress subtext */}
             <div className="absolute bottom-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <span className="text-[10px] font-mono tracking-tighter uppercase">{req._id.slice(-12).toUpperCase()}</span>
             </div>
          </div>
        ))}

        {filteredRequests?.length === 0 && (
           <div className="card text-center py-24 border-dashed border-white/10">
              <div className="text-7xl grayscale opacity-10 mb-6">{activeTab === 'ACTIVE' ? '📡' : '📁'}</div>
              <p className="text-[#8888aa] font-black uppercase tracking-widest text-[10px]">No active signals identified in this sector.</p>
           </div>
        )}
      </div>



      {/* Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
           <div className="bg-[#12121a] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
                 <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Select Delivery Partner</h2>
                    <p className="text-[10px] text-[#666680] font-bold uppercase tracking-widest mt-1">Operational Filter: {selectedRequest?.serviceId?.name}</p>
                 </div>
                 <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-[#8888aa]">
                    <FiXCircle size={24} />
                 </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                 {isVendorsLoading ? (
                    <div className="flex justify-center p-12">
                       <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                    </div>
                 ) : vendors?.length === 0 ? (
                    <div className="text-center py-12 text-[#8888aa] font-bold uppercase tracking-widest text-[10px]">No certified partners registered for this sector.</div>
                 ) : (
                    vendors?.map((vendor: any) => {
                       const hasRejected = selectedRequest?.rejectedVendors?.includes(vendor._id);
                       const isCurrent = selectedRequest?.vendorId?._id === vendor._id;
                       
                       return (
                          <div 
                            key={vendor._id} 
                            className={`p-5 rounded-3xl border transition-all flex items-center justify-between group/row ${
                              hasRejected ? 'bg-red-500/5 border-red-500/10 opacity-60' :
                              isCurrent ? 'bg-[#6C63FF]/5 border-[#6C63FF]/30' :
                              'bg-black/40 border-white/5 hover:border-[#6C63FF]/20'
                            }`}
                          >
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center text-[#6C63FF] font-black border border-white/5 group-hover/row:scale-110 transition-transform">
                                   {vendor.businessName?.charAt(0) || vendor.fullName?.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                   <p className="font-black text-white text-sm uppercase tracking-tight">{vendor.businessName || vendor.fullName}</p>
                                   <div className="flex gap-4 mt-0.5 items-center">
                                      <span className="text-[10px] text-[#666680] font-mono tracking-tighter">{vendor.email}</span>
                                      {hasRejected && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-tighter rounded">Rejected Signal</span>}
                                   </div>
                                </div>
                             </div>
                             
                             <button
                               onClick={() => setConfirmModal({ isOpen: true, vendorId: vendor._id, requestId: selectedRequest._id })}
                               disabled={assignMutation.isPending || isCurrent}
                               className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                  isCurrent ? 'bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20' :
                                  'bg-[#6C63FF] text-white hover:brightness-110 active:scale-95'
                               }`}
                             >
                               {isCurrent ? 'Active' : 'Dispatch'}
                             </button>
                          </div>
                       );
                    })
                 )}
              </div>
              
              <div className="p-4 bg-black/60 text-center border-t border-white/5">
                 <p className="text-[10px] text-[#666680] uppercase tracking-widest font-black font-mono">End of available partner registry</p>
              </div>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => assignMutation.mutate({ requestId: confirmModal.requestId, vendorId: confirmModal.vendorId })}
        title="Confirm Operational Dispatch?"
        message="This will notify the selected partner and grant them access to the service details. This action is permanently audited."
        confirmText="Execute Dispatch"
      />

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        role="ADMIN"
      />
    </div>
  );
}
