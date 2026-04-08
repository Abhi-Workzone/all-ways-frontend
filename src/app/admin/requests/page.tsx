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
         case 'ACCEPTED': return <span className="badge !text-[9px] bg-[var(--primary)]/20 text-[var(--primary)]">Committed</span>;
         case 'ON_THE_WAY': return <span className="badge !text-[9px] bg-[#FF6B9D]/20 text-[var(--secondary)]">En Route</span>;
         case 'ARRIVED': return <span className="badge !text-[9px] bg-[#FFB74D]/20 text-[var(--warning)]">On Site</span>;
         case 'IN_PROGRESS': return <span className="badge badge-progress !text-[9px] text-[var(--accent)]">Operational</span>;
         case 'COMPLETED': return <span className="badge badge-completed !text-[9px]">Finalized</span>;
         case 'CANCELLED': return <span className="badge badge-cancelled !text-[9px]">Voided</span>;
         default: return <span className="badge !text-[9px] bg-soft-dark text-[var(--foreground)]">{status}</span>;
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
               <h1 className="text-2xl text-emphasized text-[var(--foreground)] mb-2 tracking-tight">System Pulse Console</h1>
               <p className="text-[var(--text-muted)] text-sm">Orchestrate field operations and verify service audits.</p>
            </div>

            <div className="flex items-center gap-4">
               {/* Live Toggle */}
               <LiveUpdateToggle isLive={isLive} onToggle={setIsLive} />
            </div>
         </div>

         {/* Navigation Tabs */}
         <div className="flex p-1 bg-soft-dark border border-[var(--border)] rounded-2xl w-fit">
            <button
               onClick={() => setActiveTab('ACTIVE')}
               className={`px-8 py-2.5 rounded-xl text-[10px] text-emphasized uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'ACTIVE' ? 'bg-[var(--primary)] !text-white' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
               <FiList /> Active Flow
            </button>
            <button
               onClick={() => setActiveTab('HISTORY')}
               className={`px-8 py-2.5 rounded-xl text-[10px] text-emphasized uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'HISTORY' ? 'bg-[var(--primary)] !text-white' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
               <FiArchive /> Audit History
            </button>
         </div>

         <div className="grid gap-4">
            {filteredRequests?.map((req: any) => (
               <div key={req._id} className="card !p-5 xl:!p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative group overflow-hidden border-[var(--border)] hover:border-[#6C63FF]/30 transition-all duration-300 bg-soft-dark">

                  {/* Information Sector */}
                  <div className="flex flex-col sm:flex-row xl:flex-row items-start gap-5 flex-1 min-w-0">
                     {/* Left: Icon & Core ID */}
                     <div className="flex flex-row sm:flex-col items-center gap-4 shrink-0 px-1">
                        <div className="w-14 h-14 rounded-2xl bg-soft-dark flex items-center justify-center text-3xl border border-[var(--border)] group-hover:scale-105 transition-transform duration-500 shadow-inner">
                           {req.serviceId?.icon || '⚙️'}
                        </div>
                        <span className="text-[9px] font-mono tracking-tighter uppercase opacity-20 group-hover:opacity-60 transition-opacity hidden sm:block">
                           {req._id.slice(-8).toUpperCase()}
                        </span>
                     </div>

                     {/* Center: Identity & Metadata */}
                     <div className="space-y-4 min-w-0 flex-1">
                        <div>
                           <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h3 className="text-emphasized text-[var(--foreground)] text-lg truncate uppercase tracking-tight">{req.serviceId?.name}</h3>
                              {getStatusBadge(req.status)}
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 py-1">
                              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2"><FiClock className="text-[var(--primary)] shrink-0" /> {formatDate(req.preferredTime)}</p>
                              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 truncate"><FiMapPin className="text-[var(--secondary)] shrink-0" /> {req.address}</p>
                              <p className="text-[11px] text-[var(--accent)] flex items-center gap-2 truncate font-mono uppercase tracking-tighter"><FiUser className="shrink-0" /> CL: {req.userId?.email}</p>
                              {req.vendorId && (
                                 <p className="text-[11px] text-[var(--warning)] flex items-center gap-2 truncate"><FiCheckCircle className="shrink-0" /> VD: {req.vendorId.businessName || req.vendorId.fullName}</p>
                              )}
                           </div>
                        </div>

                        {/* Lineage & Narrative */}
                        <div className="space-y-4 pt-3 border-t border-[var(--border)]">
                           {/* Narrative */}
                           <div className="px-1">
                              <p className="text-[11px] text-[var(--text-muted)] italic line-clamp-1 group-hover:line-clamp-none transition-all duration-500 bg-[var(--background)]/40 p-3 rounded-xl border border-[var(--border)] shadow-inner">&quot;{req.description}&quot;</p>
                           </div>

                           {/* Mission Lineage */}
                           <div className="px-1">
                              <p className="text-[9px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest flex items-center gap-2 mb-2"><FiActivity /> MISSION LINEAGE</p>
                              <div className="flex flex-wrap items-center gap-2 p-1">
                                 {req.logs?.filter((l: any, idx: number, arr: any[]) => {
                                    if (l.toStatus === 'REJECTED' || l.fromStatus === 'REJECTED') return false;
                                    if (idx > 0) {
                                       const prevLogs = arr.slice(0, idx).filter(pl => pl.toStatus !== 'REJECTED');
                                       const lastValid = prevLogs[prevLogs.length - 1];
                                       if (lastValid && lastValid.toStatus === l.toStatus) return false;
                                    }
                                    return true;
                                 }).map((log: any, idx: number, filteredArr: any[]) => (
                                    <div key={idx} className="flex items-center gap-2">
                                       <div className={`px-2 py-0.5 rounded-lg text-[8px] text-emphasized uppercase tracking-tight border ${idx === filteredArr.length - 1 ? 'bg-[var(--primary)]/20 text-[var(--primary)] border-[#6C63FF]/30' : 'bg-soft-dark text-[var(--text-muted)] border-[var(--border)] opacity-60'}`}>
                                          {log.toStatus}
                                       </div>
                                       {idx < filteredArr.length - 1 && <div className="w-1 h-1 rounded-full bg-soft-dark shrink-0" />}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Actions Sector */}
                  <div className="flex flex-row xl:flex-col items-center gap-3 xl:border-l border-[var(--border)] xl:pl-6 pt-4 xl:pt-0 border-t xl:border-t-0 bg-transparent">
                     {(req.status === 'REQUESTED' || req.status === 'ASSIGNED') && activeTab === 'ACTIVE' && (
                        <button
                           onClick={() => {
                              setSelectedRequest(req);
                              setIsAssignModalOpen(true);
                           }}
                           className="flex-1 xl:flex-none px-6 py-3 bg-[var(--primary)] !text-white text-[10px] text-emphasized uppercase tracking-widest rounded-xl hover:brightness-110 shadow-lg shadow-[var(--primary)]/10 flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                           <FiUserPlus /> {req.vendorId ? 'Re-Dispatch' : 'Dispatch'}
                        </button>
                     )}

                     <button
                        onClick={() => {
                           setSelectedRequest(req);
                           setIsDetailsOpen(true);
                        }}
                        className="flex-1 xl:flex-none px-6 py-3 bg-soft-dark border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface-light)] hover:text-[var(--foreground)] transition-all text-[10px] text-emphasized uppercase tracking-widest flex items-center justify-center gap-2 whitespace-nowrap"
                     >
                        <FiActivity /> Audit Info
                     </button>
                  </div>
               </div>
            ))}

            {filteredRequests?.length === 0 && (
               <div className="card text-center py-24 border-dashed border-[var(--border)]">
                  <div className="text-7xl grayscale opacity-10 mb-6">{activeTab === 'ACTIVE' ? '📡' : '📁'}</div>
                  <p className="text-[var(--text-muted)] text-emphasized uppercase tracking-widest text-[10px]">No active signals identified in this sector.</p>
               </div>
            )}
         </div>



         {/* Assignment Modal */}
         {isAssignModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soft-dark backdrop-blur-md">
               <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-soft-dark">
                     <div>
                        <h2 className="text-xl text-emphasized text-[var(--foreground)] uppercase tracking-tight">Select Delivery Partner</h2>
                        <p className="text-[10px] text-[var(--placeholder)] font-bold uppercase tracking-widest mt-1">Operational Filter: {selectedRequest?.serviceId?.name}</p>
                     </div>
                     <button onClick={() => setIsAssignModalOpen(false)} className="p-2 hover:bg-soft-dark rounded-xl text-[var(--text-muted)]">
                        <FiXCircle size={24} />
                     </button>
                  </div>

                  <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                     {isVendorsLoading ? (
                        <div className="flex justify-center p-12">
                           <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                        </div>
                     ) : vendors?.length === 0 ? (
                        <div className="text-center py-12 text-[var(--text-muted)] font-bold uppercase tracking-widest text-[10px]">No certified partners registered for this sector.</div>
                     ) : (
                        vendors?.map((vendor: any) => {
                           const hasRejected = selectedRequest?.rejectedVendors?.includes(vendor._id);
                           const isCurrent = selectedRequest?.vendorId?._id === vendor._id;

                           return (
                              <div
                                 key={vendor._id}
                                 className={`p-5 rounded-3xl border transition-all flex items-center justify-between group/row ${hasRejected ? 'bg-red-500/5 border-red-500/10 opacity-60' :
                                    isCurrent ? 'bg-[var(--primary)]/5 border-[#6C63FF]/30' :
                                       'bg-soft-dark border-[var(--border)] hover:border-[#6C63FF]/20'
                                    }`}
                              >
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-full bg-soft-dark flex items-center justify-center text-[var(--primary)] text-emphasized border border-[var(--border)] group-hover/row:scale-110 transition-transform">
                                       {vendor.businessName?.charAt(0) || vendor.fullName?.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                       <p className="text-emphasized text-[var(--foreground)] text-sm uppercase tracking-tight">{vendor.businessName || vendor.fullName}</p>
                                       <div className="flex gap-4 mt-0.5 items-center">
                                          <span className="text-[10px] text-[var(--placeholder)] font-mono tracking-tighter">{vendor.email}</span>
                                          {hasRejected && <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[8px] text-emphasized uppercase tracking-tighter rounded">Rejected Signal</span>}
                                       </div>
                                    </div>
                                 </div>

                                 <button
                                    onClick={() => setConfirmModal({ isOpen: true, vendorId: vendor._id, requestId: selectedRequest._id })}
                                    disabled={assignMutation.isPending || isCurrent}
                                    className={`px-6 py-2 rounded-xl text-[10px] text-emphasized uppercase tracking-widest transition-all ${isCurrent ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[#6C63FF]/20' :
                                       'bg-[var(--primary)] !text-white hover:brightness-110 active:scale-95'
                                       }`}
                                 >
                                    {isCurrent ? 'Active' : 'Dispatch'}
                                 </button>
                              </div>
                           );
                        })
                     )}
                  </div>

                  <div className="p-4 bg-soft-dark text-center border-t border-[var(--border)]">
                     <p className="text-[10px] text-[var(--placeholder)] uppercase tracking-widest text-emphasized font-mono">End of available partner registry</p>
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
