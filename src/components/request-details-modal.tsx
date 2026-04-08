'use client';

import { FiX, FiCheckCircle, FiInfo, FiCamera, FiUser, FiMapPin, FiClock, FiActivity } from 'react-icons/fi';
import { BASE_URL } from '@/lib/api';

interface RequestDetailsModalProps {
   isOpen: boolean;
   onClose: () => void;
   request: any;
   role: 'ADMIN' | 'VENDOR' | 'USER';
}

export function RequestDetailsModal({ isOpen, onClose, request, role }: RequestDetailsModalProps) {
   if (!isOpen || !request) return null;

   const getImageUrl = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http') || path.startsWith('data:')) return path;
      return `${BASE_URL}${path}`;
   };

   // Masking logs for USER/VENDOR
   const filteredLogs = request.logs?.filter((log: any, idx: number, arr: any[]) => {
      if (role === 'ADMIN') return true;

      // Hide REJECTED logs entirely
      if (log.toStatus === 'REJECTED' || log.fromStatus === 'REJECTED') return false;

      // Hide RE-ENTRY logs (e.g. if we went back to REQUESTED after a rejection)
      // We only want to show progress.
      if (idx > 0) {
         const prevLogs = arr.slice(0, idx).filter(l => l.toStatus !== 'REJECTED');
         const lastValid = prevLogs[prevLogs.length - 1];
         if (lastValid && lastValid.toStatus === log.toStatus) return false;
      }

      return true;
   });

   const getStatusLabel = (status: string) => {
      switch (status) {
         case 'REQUESTED': return 'Pool Entry';
         case 'ASSIGNED': return 'Dispatched';
         case 'ACCEPTED': return 'Accepted';
         case 'ON_THE_WAY': return 'En Route';
         case 'ARRIVED': return 'On Site';
         case 'IN_PROGRESS': return 'Operational';
         case 'COMPLETED': return 'Completed';
         case 'CANCELLED': return 'Voided';
         default: return status;
      }
   };

   return (
      <div className="fixed inset-0 lg:left-64 z-50 flex items-center justify-center p-4">
         <div
            className="absolute inset-0 bg-soft-dark backdrop-blur-md lg:rounded-l-[40px]"
            onClick={onClose}
         />

         <div className="relative bg-[var(--surface)] border border-[var(--border)] w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_50px_-12px_rgba(108,99,255,0.3)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-soft-dark">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-3xl border border-[#6C63FF]/20">
                     {request.serviceId?.icon || '🔧'}
                  </div>
                  <div>
                     <h2 className="text-xl text-emphasized text-[var(--foreground)] tracking-tight uppercase">{request.serviceId?.name || 'Detailed Report'}</h2>
                     <p className="text-[10px] text-[var(--placeholder)] font-mono tracking-widest uppercase mt-0.5">#{request._id.slice(-12).toUpperCase()}</p>
                  </div>
               </div>

               <button onClick={onClose} className="p-2 hover:bg-soft-dark rounded-xl text-[var(--text-muted)] transition-colors">
                  <FiX size={24} />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">

               {/* Summary Section */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="card space-y-4 !p-5">
                     <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-4 flex items-center gap-2"><FiInfo /> Request Overview</p>
                     <div className="space-y-3">
                        <div className="flex items-start gap-3">
                           <FiClock className="text-[var(--primary)] mt-1" />
                           <div>
                              <p className="text-[9px] text-[var(--text-muted)]">PREFERRED TIME</p>
                              <p className="text-xs text-[var(--foreground)] font-bold">{new Date(request.preferredTime).toLocaleString()}</p>
                           </div>
                        </div>
                        <div className="flex items-start gap-3">
                           <FiMapPin className="text-[var(--secondary)] mt-1" />
                           <div>
                              <p className="text-[9px] text-[var(--text-muted)]">SERVICE LOCATION</p>
                              <p className="text-xs text-[var(--foreground)] font-bold leading-relaxed">{request.address}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="card space-y-4 !p-5">
                     <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-4 flex items-center gap-2"><FiUser /> Primary Contacts</p>
                     <div className="space-y-3">
                        <div>
                           <p className="text-[9px] text-[var(--text-muted)]">CLIENT</p>
                           <p className="text-xs text-[var(--foreground)] text-emphasized">{request.userId?.fullName || request.userId?.email || 'Anonymous'}</p>
                           {request.userId?.phoneNumber && (
                              <p className="text-[10px] text-[var(--primary)] text-emphasized mt-1">{request.userId.phoneNumber}</p>
                           )}
                        </div>
                        {request.vendorId && (
                           <div>
                              <p className="text-[9px] text-[var(--text-muted)]">ASSIGNED PARTNER</p>
                              <p className="text-xs text-[var(--accent)] text-emphasized">{request.vendorId.businessName || 'Designated Expert'}</p>
                              {request.vendorId.phoneNumber && (
                                 <p className="text-[10px] text-[var(--accent)] text-emphasized mt-1 italic tracking-widest">{request.vendorId.phoneNumber}</p>
                              )}
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="card !p-5 bg-gradient-to-br from-[#6C63FF]/5 to-transparent border-[#6C63FF]/20 flex flex-col justify-center items-center gap-2">
                     <p className="text-[10px] uppercase text-emphasized text-[var(--primary)] tracking-widest mb-2 font-mono">Current Status</p>
                     <span className="px-6 py-2 bg-[var(--primary)] !text-white text-xs text-emphasized rounded-full shadow-lg shadow-[var(--primary)]/20 uppercase tracking-widest">
                        {request.status}
                     </span>
                  </div>
               </div>

               {/* Full Description Area */}
               <div className="space-y-4">
                  <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest px-2 flex items-center gap-2"><FiActivity /> Dispatch Scope Narrative</p>
                  <div className="bg-soft-dark p-6 rounded-3xl border border-[var(--border)] italic text-sm text-[var(--text-muted)] leading-relaxed shadow-inner">
                     &quot;{request.description}&quot;
                  </div>
               </div>
               {/* Tier 2: Audit Timeline */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                     <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest flex items-center gap-2"><FiActivity /> Dispatch Lineage (Audit Logs)</p>
                     <span className="text-[9px] font-mono text-[var(--placeholder)] uppercase tracking-tighter opacity-50">SEQUENTIAL_TRACE_ACTIVERECORD</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {filteredLogs?.map((log: any, idx: number) => (
                        <div key={idx} className="group/log p-5 rounded-2xl bg-soft-dark border border-[var(--border)] hover:border-[#6C63FF]/30 transition-all hover:translate-y-[-2px] relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover/log:opacity-100 transition-opacity">
                              <FiCheckCircle size={12} className="text-[var(--accent)]" />
                           </div>
                           <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                 <span className={`text-[8px] text-emphasized px-2 py-0.5 rounded uppercase tracking-widest ${log.role === 'ADMIN' ? 'bg-red-500/10 text-red-400' :
                                       log.role === 'VENDOR' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' :
                                          'bg-[var(--primary)]/10 text-[var(--primary)]'
                                    }`}>
                                    {log.role}
                                 </span>
                                 <span className="text-[9px] text-[var(--placeholder)] font-mono">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--foreground)] uppercase tracking-tight">
                                 <span className="opacity-40">{getStatusLabel(log.fromStatus)}</span>
                                 <span className="text-[var(--primary)]">→</span>
                                 <span className="text-[var(--foreground)]">{getStatusLabel(log.toStatus)}</span>
                              </div>
                           </div>
                        </div>
                     ))}
                     {filteredLogs?.length === 0 && (
                        <div className="col-span-full py-8 text-center text-[var(--placeholder)] italic text-xs text-emphasized uppercase tracking-widest opacity-30 border-2 border-dashed border-[var(--border)] rounded-3xl">
                           Initializing signal processing...
                        </div>
                     )}
                  </div>
               </div>

               {/* Media Proof Section */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest px-2 flex items-center gap-2"><FiCamera /> Pre-Service Evidence</p>
                     <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                        {request.beforeImages?.length > 0 ? (
                           request.beforeImages.map((img: string, idx: number) => (
                              <div key={idx} className="w-24 h-24 shrink-0 rounded-2xl border border-[var(--border)] bg-soft-dark overflow-hidden relative group snap-start">
                                 <img src={getImageUrl(img)} alt="Before" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer" />
                              </div>
                           ))
                        ) : (
                           <div className="w-full py-10 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-[var(--placeholder)]">
                              <FiCamera size={24} className="mb-2 opacity-30" />
                              <p className="text-[10px] text-emphasized uppercase tracking-tighter text-center">No pre-work logic recorded</p>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="space-y-4 pb-10">
                     <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest px-2 flex items-center gap-2 focus:"><FiCheckCircle /> Final Execution Output</p>
                     <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                        {request.afterImages?.length > 0 ? (
                           request.afterImages.map((img: string, idx: number) => (
                              <div key={idx} className="w-24 h-24 shrink-0 rounded-2xl border border-[var(--border)] bg-soft-dark overflow-hidden relative group snap-start">
                                 <img src={getImageUrl(img)} alt="After" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer" />
                              </div>
                           ))
                        ) : (
                           <div className="w-full py-10 border-2 border-dashed border-[var(--border)] rounded-2xl flex flex-col items-center justify-center text-[var(--placeholder)]">
                              <FiCheckCircle size={24} className="mb-2 opacity-30" />
                              <p className="text-[10px] text-emphasized uppercase tracking-tighter text-center">Pending Completion Signal</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
