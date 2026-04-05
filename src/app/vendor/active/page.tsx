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
        case 'ACCEPTED': return { label: 'In Queue', color: 'bg-[#6C63FF]/20 text-[#6C63FF]', icon: <FiCheckCircle /> };
        case 'ON_THE_WAY': return { label: 'Traveling', color: 'bg-[#FF6B9D]/20 text-[#FF6B9D]', icon: <FiTruck /> };
        case 'ARRIVED': return { label: 'At Location', color: 'bg-[#FFB74D]/20 text-[#FFB74D]', icon: <FiMapPin /> };
        case 'IN_PROGRESS': return { label: 'Operational', color: 'bg-[#00D4AA]/20 text-[#00D4AA]', icon: <FiCamera /> };
        default: return { label: status, color: 'bg-white/10 text-white', icon: null };
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
           <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Deployment Queue</h1>
           <p className="text-[#8888aa] text-sm italic font-medium">Real-time supervision of ongoing field dispatches.</p>
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
            <div key={job._id} className="card overflow-hidden border-white/10 bg-[#12121a] relative group">
               {/* Symmetrical status indicator bar */}
               <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/5">
                  <div className={`h-full transition-all duration-700 ${display.color.split(' ')[0]}`} style={{ width: '100%' }} />
               </div>

               <div className="absolute top-8 right-8 z-20">
                  <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter ${display.color} shadow-lg`}>
                     {display.icon} {display.label}
                  </span>
               </div>

               <div className="flex flex-col xl:flex-row">
                  <div className="flex-1 p-6 md:p-8 space-y-8">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                           {job.serviceId?.icon || '🔧'}
                        </div>
                        <div className="min-w-0 flex-1">
                           <h3 className="text-2xl font-black text-white mb-1 uppercase tracking-tight truncate">{job.serviceId?.name}</h3>
                           <div className="flex flex-wrap items-center gap-4 text-[10px] text-[#666680] font-bold uppercase tracking-widest mt-1">
                              <span className="flex items-center gap-1.5"><FiUser className="text-[#6C63FF]" /> {job.userId?.fullName || 'Client Signature'}</span>
                              <span className="font-mono text-[#00D4AA]">POS_AUDIT: #{job._id.slice(-8).toUpperCase()}</span>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-3xl bg-black/40 border border-white/5">
                        <div className="space-y-4">
                           <div>
                              <p className="text-[10px] uppercase font-black text-[#666680] tracking-widest mb-2 flex items-center gap-2"><FiMapPin className="text-[#FF6B9D]" /> Dispatch Zone</p>
                              <p className="text-xs text-white leading-relaxed font-bold">{job.address}</p>
                           </div>
                        </div>
                        <div className="space-y-4">
                           <div>
                              <p className="text-[10px] uppercase font-black text-[#666680] tracking-widest mb-2 flex items-center gap-2"><FiActivity className="text-[#6C63FF]" /> Narrative Scope</p>
                              <p className="text-xs text-[#8888aa] italic font-medium leading-relaxed">&quot;{job.description}&quot;</p>
                           </div>
                        </div>
                     </div>

                     {/* MISSION LINEAGE - Wrapped Breadcrumb (High-Fidelity) */}
                     <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between px-1">
                           <p className="text-[9px] uppercase font-black text-[#666680] tracking-widest flex items-center gap-2"><FiActivity /> MISSION LINEAGE</p>
                           <button 
                             onClick={() => {
                                setSelectedRequest(job);
                                setIsDetailsOpen(true);
                             }}
                             className="text-[9px] text-[#6C63FF] font-black uppercase tracking-widest hover:underline flex items-center gap-1.5"
                           >
                              <FiList /> Full Audit
                           </button>
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
                           {filteredLogs?.length === 0 && <span className="text-[10px] text-[#666680] font-black uppercase tracking-widest italic opacity-40">CALIBRATING PULSE...</span>}
                        </div>
                     </div>
                  </div>

                  <div className="xl:w-80 bg-black/60 p-6 md:p-10 flex flex-col justify-center border-t xl:border-t-0 xl:border-l border-white/5 relative group/action">
                     <div className="mb-10 space-y-2 text-center">
                        <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest leading-none">Operational Status</p>
                        <p className="text-2xl font-black text-white italic tracking-tighter uppercase">
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
                        className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl relative z-10 ${
                           job.status === 'ARRIVED' ? 'bg-black/60 text-[#666680] border border-white/5 cursor-wait' :
                           job.status === 'IN_PROGRESS' ? 'bg-[#00D4AA] text-black shadow-[#00D4AA]/20 hover:brightness-110' :
                           'bg-[#6C63FF] text-white shadow-[#6C63FF]/30 hover:brightness-110 hover:translate-y-[-2px]'
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
                           <p className="text-[10px] text-[#FFB74D] font-black uppercase tracking-widest leading-relaxed">
                              Locking Arrival Signal.
                           </p>
                           <p className="text-[9px] text-[#8888aa] italic">Awaiting client authorization to initiate operational clock.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          );
        })}

        {jobs?.length === 0 && (
          <div className="card text-center py-24 space-y-6 border-dashed border-white/10 opacity-60">
            <div className="text-7xl font-black text-white/5 tracking-tighter">EMPTY QUEUE</div>
            <p className="text-[#8888aa] max-w-sm mx-auto text-xs uppercase tracking-widest font-bold italic">Awaiting central command dispatch signals.</p>
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
