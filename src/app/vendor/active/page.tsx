'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FiMapPin, FiClock, FiArrowRight, FiCheckCircle, FiTruck, FiCamera, FiUser, FiInfo, FiActivity, FiArchive, FiList } from 'react-icons/fi';
import { useState } from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { LiveUpdateToggle } from '@/components/live-update-toggle';
import { RequestDetailsModal } from '@/components/request-details-modal';
import { EvidenceModal } from '@/components/finish-work-modal';

export default function VendorActiveJobsPage() {
  const queryClient = useQueryClient();
  const [isLive, setIsLive] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPreWorkModalOpen, setIsPreWorkModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['active-vendor-jobs'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      const activeStatuses = ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'];
      return data.data.filter((job: any) => activeStatuses.includes(job.status));
    },
    refetchInterval: isLive ? 5000 : false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => requestsAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Synchronization confirmed');
      queryClient.invalidateQueries({ queryKey: ['active-vendor-jobs'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update rejected'),
  });

  const startWorkMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => requestsAPI.uploadBeforeImages(id, formData),
    onSuccess: () => {
      toast.success('Operational evidence localized');
      setIsPreWorkModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['active-vendor-jobs'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Initiation aborted'),
  });

  const completeMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => requestsAPI.complete(id, formData),
    onSuccess: () => {
      toast.success('Operational mission complete');
      setIsFinishModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['active-vendor-jobs'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Finalization aborted'),
  });

  const handleAction = (job: any) => {
    switch (job.status) {
      case 'ACCEPTED':
        setModalConfig({
          isOpen: true,
          title: 'Initiate Travel Phase?',
          message: 'The system will notify the client that you are en route to their designated location.',
          onConfirm: () => updateStatusMutation.mutate({ id: job._id, status: 'ON_THE_WAY' }),
          type: 'info'
        });
        break;
      case 'ON_THE_WAY':
        setModalConfig({
          isOpen: true,
          title: 'Verify Physical Presence?',
          message: 'Confirm you have reached the service location. The user must verify arrival on their panel to unlock the work phase.',
          onConfirm: () => updateStatusMutation.mutate({ id: job._id, status: 'ARRIVED' }),
          type: 'success'
        });
        break;
      case 'ARRIVED':
        toast.error('Waiting for verification signal from the client.');
        break;
      case 'IN_PROGRESS':
        setSelectedRequest(job);
        if (!job.beforeImages || job.beforeImages.length === 0) {
           setIsPreWorkModalOpen(true);
        } else {
           setIsFinishModalOpen(true);
        }
        break;
    }
  };

  const getStatusDisplay = (status: string) => {
     switch(status) {
        case 'ACCEPTED': return { label: 'In Queue', color: 'bg-[var(--primary)]/20 text-[var(--primary)]', icon: <FiCheckCircle /> };
        case 'ON_THE_WAY': return { label: 'Traveling', color: 'bg-[#FF6B9D]/20 text-[var(--secondary)]', icon: <FiTruck /> };
        case 'ARRIVED': return { label: 'At Location', color: 'bg-[#FFB74D]/20 text-[#FFB74D]', icon: <FiMapPin /> };
        case 'IN_PROGRESS': return { label: 'Operational', color: 'bg-[var(--accent)]/20 text-[var(--accent)]', icon: <FiCamera /> };
        default: return { label: status, color: 'bg-soft-dark text-[var(--foreground)]', icon: null };
     }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-3xl text-emphasized text-[var(--foreground)] mb-2 tracking-tight">Deployment Queue</h1>
           <p className="text-[var(--text-muted)] text-sm italic font-medium">Real-time supervision of ongoing field dispatches.</p>
        </div>
        
        <LiveUpdateToggle isLive={isLive} onToggle={setIsLive} />
      </div>

      <div className="grid gap-6">
        {jobs?.map((job: any) => {
          const display = getStatusDisplay(job.status);
          const filteredLogs = job.logs?.filter((l: any, idx: number, arr: any[]) => {
              if (l.toStatus === 'REJECTED' || l.fromStatus === 'REJECTED') return false;
              if (idx > 0) {
                 const prevLogs = arr.slice(0, idx).filter(pl => pl.toStatus !== 'REJECTED');
                 const lastValid = prevLogs[prevLogs.length - 1];
                 if (lastValid && lastValid.toStatus === l.toStatus) return false;
              }
              return true;
          });

          return (
            <div key={job._id} className="card overflow-hidden border-[var(--border)] bg-[var(--surface)] relative group">
               {/* Symmetrical status indicator bar */}
               <div className="absolute top-0 left-0 right-0 h-0.5 bg-soft-dark">
                  <div className={`h-full transition-all duration-700 ${display.color.split(' ')[0]}`} style={{ width: '100%' }} />
               </div>

               <div className="absolute top-8 right-8 z-20">
                  <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] text-emphasized uppercase tracking-tighter ${display.color} shadow-lg`}>
                     {display.icon} {display.label}
                  </span>
               </div>

               <div className="flex flex-col xl:flex-row">
                  <div className="flex-1 p-6 md:p-8 space-y-8">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-soft-dark border border-[var(--border)] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                           {job.serviceId?.icon || '🔧'}
                        </div>
                        <div className="min-w-0 flex-1">
                           <h3 className="text-2xl text-emphasized text-[var(--foreground)] mb-1 uppercase tracking-tight truncate">{job.serviceId?.name}</h3>
                           <div className="flex flex-wrap items-center gap-4 text-[10px] text-[var(--placeholder)] font-bold uppercase tracking-widest mt-1">
                              <span className="flex items-center gap-1.5"><FiUser className="text-[var(--primary)]" /> {job.userId?.fullName || 'Client Signature'}</span>
                              <span className="font-mono text-[var(--accent)]">POS_AUDIT: #{job._id.slice(-8).toUpperCase()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-soft-dark border border-[var(--border)]">
                        <div className="space-y-4">
                           <div>
                              <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-2 flex items-center gap-2"><FiMapPin className="text-[var(--secondary)]" /> Dispatch Zone</p>
                              <p className="text-xs text-[var(--foreground)] leading-relaxed font-bold">{job.address}</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-2 flex items-center gap-2"><FiActivity className="text-[var(--primary)]" /> Narrative Scope</p>
                              <p className="text-xs text-[var(--text-muted)] italic font-medium leading-relaxed">&quot;{job.description}&quot;</p>
                           </div>
                        </div>
                     </div>

                     {/* MISSION LINEAGE - Wrapped Breadcrumb (High-Fidelity) */}
                     <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                        <div className="flex items-center justify-between px-1">
                           <p className="text-[9px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest flex items-center gap-2"><FiActivity /> MISSION LINEAGE</p>
                           <button 
                             onClick={() => {
                                setSelectedRequest(job);
                                setIsDetailsOpen(true);
                             }}
                             className="text-[9px] text-[var(--primary)] text-emphasized uppercase tracking-widest hover:underline flex items-center gap-1.5"
                           >
                              <FiList /> Full Audit
                           </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 p-1">
                           {filteredLogs?.map((log: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-3">
                                 <div className={`px-3 py-1.5 rounded-xl text-[9px] text-emphasized uppercase tracking-tight border ${idx === filteredLogs.length - 1 ? 'bg-[var(--primary)]/20 text-[var(--primary)] border-[#6C63FF]/30 shadow-lg shadow-[var(--primary)]/10' : 'bg-soft-dark text-[var(--text-muted)] border-[var(--border)] opacity-60'}`}>
                                    {log.toStatus}
                                 </div>
                                 {idx < filteredLogs.length - 1 && <div className="w-1.5 h-1.5 rounded-full bg-soft-dark shrink-0" />}
                              </div>
                           ))}
                           {filteredLogs?.length === 0 && <span className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest italic opacity-40">CALIBRATING PULSE...</span>}
                        </div>
                     </div>
                  </div>

                  <div className="xl:w-80 bg-soft-dark p-6 md:p-10 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-[var(--border)] relative group/action">
                     <div className="mb-10 space-y-2 text-center">
                        <p className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest leading-none">Operational Status</p>
                        <p className="text-2xl text-emphasized text-[var(--foreground)] italic tracking-tighter uppercase">
                           {job.status === 'ACCEPTED' ? 'STAGING' :
                            job.status === 'ON_THE_WAY' ? 'EN ROUTE' :
                            job.status === 'ARRIVED' ? 'CHECK-IN' :
                            'EXECUTION'}
                        </p>
                        <div className="w-12 h-0.5 bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] mx-auto mt-4 rounded-full" />
                     </div>

                     <button
                        onClick={() => handleAction(job)}
                        disabled={updateStatusMutation.isPending || startWorkMutation.isPending || completeMutation.isPending || job.status === 'ARRIVED'}
                        className={`w-full py-6 rounded-[2rem] text-emphasized text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl relative z-10 ${
                           job.status === 'ARRIVED' ? 'bg-soft-dark text-[var(--placeholder)] border border-[var(--border)] cursor-wait' :
                           job.status === 'IN_PROGRESS' ? 'bg-[var(--accent)] text-black shadow-[#00D4AA]/20 hover:brightness-110' :
                           'bg-[var(--primary)] !text-white shadow-[var(--primary)]/30 hover:brightness-110 hover:translate-y-[-2px]'
                        }`}
                     >
                        {updateStatusMutation.isPending || startWorkMutation.isPending || completeMutation.isPending ? (
                           <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                           <>
                              {job.status === 'ACCEPTED' && <><FiTruck className="text-lg" /> Initiate</>}
                              {job.status === 'ON_THE_WAY' && <><FiMapPin className="text-lg" /> Reached</>}
                              {job.status === 'ARRIVED' && <FiClock className="text-lg" />}
                              {job.status === 'IN_PROGRESS' && (
                                 !job.beforeImages || job.beforeImages.length === 0 ? 
                                 <><FiCamera className="text-lg" /> Start Mission</> : 
                                 <><FiArchive className="text-lg" /> Finalize</>
                              )}
                           </>
                        )}
                     </button>
                     
                     {job.status === 'ARRIVED' && (
                        <div className="mt-8 p-5 bg-[#FFB74D]/10 border border-[#FFB74D]/20 rounded-3xl animate-pulse text-center space-y-3">
                           <p className="text-[10px] text-[#FFB74D] text-emphasized uppercase tracking-widest leading-relaxed">
                              Locking Arrival Signal.
                           </p>
                           <p className="text-[9px] text-[var(--text-muted)] italic">Awaiting client authorization to initiate operational clock.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          );
        })}

        {jobs?.length === 0 && (
          <div className="card text-center py-24 space-y-6 border-dashed border-[var(--border)] opacity-60">
            <div className="text-7xl text-emphasized text-[var(--foreground)]/5 tracking-tighter">EMPTY QUEUE</div>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto text-xs uppercase tracking-widest font-bold italic">Awaiting central command dispatch signals.</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        role="VENDOR"
      />

      <EvidenceModal 
        isOpen={isPreWorkModalOpen}
        onClose={() => setIsPreWorkModalOpen(false)}
        onComplete={(fd: FormData) => startWorkMutation.mutate({ id: selectedRequest._id, formData: fd })}
        isPending={startWorkMutation.isPending}
        title="Start Mission"
        subtitle="Upload Pre-work operational evidence (Min 1)"
        buttonText="Seal Initiation"
        minImages={1}
      />

      <EvidenceModal 
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onComplete={(fd: FormData) => completeMutation.mutate({ id: selectedRequest._id, formData: fd })}
        isPending={completeMutation.isPending}
        title="Finalize Execution"
        subtitle="Upload Completion operational evidence (Min 2)"
        buttonText="Finalize Pulse"
        minImages={2}
      />
    </div>
  );
}
