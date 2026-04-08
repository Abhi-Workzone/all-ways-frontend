'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FiMapPin, FiClock, FiCalendar, FiArrowRight, FiInfo } from 'react-icons/fi';
import { useState } from 'react';
import { ConfirmModal } from '@/components/confirm-modal';

export default function VendorJobsPage() {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'ACCEPT' | 'REJECT';
    requestId: string;
  }>({
    isOpen: false,
    type: 'ACCEPT',
    requestId: '',
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['available-jobs'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data.filter((job: any) => job.status === 'ASSIGNED');
    },
    refetchInterval: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => requestsAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Inventory updated');
      queryClient.invalidateQueries({ queryKey: ['available-jobs'] });
    },
    onError: () => toast.error('Transition failed'),
  });

  const handleConfirm = () => {
    if (modalConfig.type === 'ACCEPT') {
      updateStatusMutation.mutate({ id: modalConfig.requestId, status: 'ACCEPTED' });
    } else {
      updateStatusMutation.mutate({ id: modalConfig.requestId, status: 'REJECTED' });
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Operational Pipeline</h1>
        <p className="text-[var(--text-muted)]">Review and claim service dispatches allocated to your organization.</p>
      </div>

      <div className="grid gap-6">
        {jobs?.map((job: any) => (
          <div key={job._id} className="card relative group overflow-hidden border-[var(--border)] hover:border-[#6C63FF]/20 transition-all duration-300">
             <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 space-y-6">
                   <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center text-3xl border border-[#6C63FF]/20 shadow-lg shadow-[var(--primary)]/5 group-hover:scale-105 transition-transform">
                        {job.serviceId?.icon || '🔧'}
                      </div>
                      <div className="min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="badge badge-created !py-0.5 !px-2 !text-[9px] uppercase tracking-widest text-emphasized">Incoming</span>
                            <span className="text-[10px] text-[var(--placeholder)] font-mono">#{job._id.slice(-6).toUpperCase()}</span>
                         </div>
                         <h3 className="text-2xl text-emphasized text-[var(--foreground)] truncate">{job.serviceId?.name}</h3>
                         <div className="flex items-center gap-4 text-[10px] text-[var(--placeholder)] mt-1 font-bold">
                            <span className="flex items-center gap-1 uppercase tracking-tighter"><FiCalendar className="text-[var(--accent)]" /> Dispatched {new Date(job.createdAt).toLocaleDateString()}</span>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-soft-dark p-5 rounded-2xl border border-[var(--border)]">
                      <div className="space-y-4">
                         <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)]">
                               <FiClock size={16} />
                            </div>
                            <div>
                               <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-0.5">Time Commitment</p>
                               <p className="text-sm text-[var(--foreground)] font-bold">{formatDate(job.preferredTime)}</p>
                            </div>
                         </div>
                         <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[#FF6B9D]/10 text-[var(--secondary)]">
                               <FiMapPin size={16} />
                            </div>
                            <div>
                               <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-0.5">Operation Area</p>
                               <p className="text-sm text-[var(--foreground)] leading-relaxed font-medium">{job.address}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col justify-between">
                         <div>
                            <p className="text-[10px] uppercase text-emphasized text-[var(--placeholder)] tracking-widest mb-2 flex items-center gap-1.5"><FiInfo className="text-[var(--accent)]" /> Dispatch Memo</p>
                            <p className="text-xs text-[var(--text-muted)] leading-relaxed line-clamp-3 italic font-medium">&quot;{job.description}&quot;</p>
                         </div>
                         
                         {job.latitude && job.longitude && (
                           <a 
                             href={`https://www.google.com/maps?q=${job.latitude},${job.longitude}`}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="text-[10px] text-[var(--primary)] text-emphasized mt-4 hover:underline flex items-center gap-1 uppercase"
                           >
                              Scan Topography <FiArrowRight />
                           </a>
                        )}
                      </div>
                   </div>
                </div>

                <div className="xl:w-64 flex flex-col justify-center space-y-4 pt-6 xl:pt-0 border-t xl:border-t-0 xl:border-l border-[var(--border)] xl:pl-8">
                   <div className="text-center space-y-1">
                      <p className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest">Revenue Class</p>
                      <p className="text-3xl text-emphasized text-[var(--foreground)] italic">Premium</p>
                   </div>
                   
                   <button
                     onClick={() => setModalConfig({ isOpen: true, type: 'ACCEPT', requestId: job._id })}
                     disabled={updateStatusMutation.isPending}
                     className="btn-primary w-full h-12 flex items-center justify-center gap-2 group text-emphasized uppercase tracking-widest text-[10px]"
                   >
                     {updateStatusMutation.isPending ? 'Syncing...' : <>Claim Engagement <FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
                   </button>

                   <button
                     onClick={() => setModalConfig({ isOpen: true, type: 'REJECT', requestId: job._id })}
                     disabled={updateStatusMutation.isPending}
                     className="w-full h-11 flex items-center justify-center gap-2 text-[var(--foreground)]/40 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all text-emphasized text-[10px] uppercase tracking-widest"
                   >
                     Decline Dispatch
                   </button>
                </div>
             </div>
          </div>
        ))}

        {jobs?.length === 0 && (
          <div className="card text-center py-24 border-dashed">
            <div className="text-6xl grayscale opacity-30 mb-4">📡</div>
            <h3 className="text-xl font-bold text-[var(--foreground)]">No Assigned Signals</h3>
            <p className="text-[var(--text-muted)] max-w-sm mx-auto text-sm">Your operational queue is clear correctly. New dispatches will appear here immediately upon allocation by command center.</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={handleConfirm}
        title={modalConfig.type === 'ACCEPT' ? 'Claim this Operation?' : 'Decline Dispatch?'}
        message={modalConfig.type === 'ACCEPT' 
          ? 'Confirm you are ready to commit to this service engagement. This will move the request to your active operations dashboard.' 
          : 'Declining will return this request to the central pool. This action is logged for dispatch optimization.'}
        type={modalConfig.type === 'ACCEPT' ? 'success' : 'danger'}
        confirmText={modalConfig.type === 'ACCEPT' ? 'Claim Request' : 'Decline Job'}
      />
    </div>
  );
}
