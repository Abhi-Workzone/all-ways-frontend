'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, requestsAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FiBriefcase, FiTrash2, FiCheck, FiX, FiPhone, FiMapPin, FiInfo, FiActivity, FiCheckCircle, FiXCircle, FiTruck, FiList } from 'react-icons/fi';
import { useState } from 'react';
import { RequestDetailsModal } from '@/components/request-details-modal';

export default function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'REGISTRY' | 'PERFORMANCE'>('REGISTRY');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const { data: vendors, isLoading: isVendorsLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const { data } = await usersAPI.getUsers('VENDOR');
      return data.data;
    },
  });

  const { data: requests, isLoading: isRequestsLoading } = useQuery({
    queryKey: ['admin-requests-all'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data;
    },
  });

  const handleStatusUpdate = (id: string, status: string) => {
    const comments = prompt('Any comments for the vendor?');
    updateMutation.mutate({ id, data: { businessStatus: status, adminComments: comments || '' } });
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ role: string; isVerified: boolean; businessStatus: string; adminComments: string }> }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      toast.success('Vendor synchronization confirmed');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Update aborted'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: () => {
      toast.success('Vendor record purged');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });

  const getVendorStats = (vendorId: string) => {
    if (!requests) return { completed: 0, rejected: 0, active: 0 };
    const completed = requests.filter((r: any) => r.vendorId?._id === vendorId && r.status === 'COMPLETED').length;
    const active = requests.filter((r: any) => r.vendorId?._id === vendorId && ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(r.status)).length;
    const rejected = requests.filter((r: any) => r.rejectedVendors?.includes(vendorId)).length;
    return { completed, active, rejected };
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl text-emphasized text-[var(--foreground)] mb-2 tracking-tight">Partner Ecosystem</h1>
          <p className="text-[var(--text-muted)] text-sm font-medium italic">Oversee service provider verification and performance audits.</p>
        </div>

        <div className="flex p-1 bg-soft-dark border border-[var(--border)] rounded-2xl">
           <button 
             onClick={() => setActiveTab('REGISTRY')}
             className={`px-6 py-2.5 rounded-xl text-[10px] text-emphasized uppercase tracking-widest transition-all gap-2 flex items-center ${activeTab === 'REGISTRY' ? 'bg-[var(--primary)] !text-white shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
           >
              Vendor Registry
           </button>
           <button 
             onClick={() => setActiveTab('PERFORMANCE')}
             className={`px-6 py-2.5 rounded-xl text-[10px] text-emphasized uppercase tracking-widest transition-all gap-2 flex items-center ${activeTab === 'PERFORMANCE' ? 'bg-[var(--primary)] !text-white shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
           >
              Marketplace Audit
           </button>
        </div>
      </div>

      {isVendorsLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {vendors?.map((vendor: any) => {
            const stats = getVendorStats(vendor._id);
            return (
              <div key={vendor._id} className="card !p-4 md:!p-5 md:!p-8 relative group overflow-hidden border-[var(--border)] hover:border-[var(--primary)]/30 transition-all duration-300">
                {/* Performance progress line */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-soft-dark">
                   <div className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]" style={{ width: `${Math.min((stats.completed / (stats.completed + stats.rejected || 1)) * 100, 100)}%` }} />
                </div>

                <div className="flex flex-col xl:flex-row gap-8">
                   <div className="flex-1 space-y-8">
                      {/* Identity Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-soft-dark border border-[var(--border)] flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                             {vendor.businessStatus === 'APPROVED' ? '💎' : '🛠️'}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-2xl text-emphasized text-[var(--foreground)] mb-1 uppercase tracking-tight truncate">
                              {vendor.businessName || vendor.fullName || 'Unidentified Partner'}
                            </h3>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 uppercase font-bold tracking-widest"><FiBriefcase className="text-[var(--primary)]" /> {vendor.email}</span>
                              <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-2 uppercase font-bold tracking-widest"><FiPhone className="text-[var(--accent)]" /> {vendor.phoneNumber || 'NO CONNECT'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] text-emphasized uppercase tracking-widest px-4 py-1.5 rounded-full border ${
                            vendor.businessStatus === 'APPROVED' ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20' :
                            vendor.businessStatus === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20 animate-pulse'
                          }`}>
                            {vendor.businessStatus || 'PENDING'}
                          </span>
                          
                          <div className="h-4 w-[1px] bg-[var(--border)] mx-2" />

                          <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                             <button onClick={() => handleStatusUpdate(vendor._id, 'APPROVED')} className="p-2.5 bg-soft-dark hover:bg-[var(--accent)] hover:!text-white rounded-xl border border-[var(--border)] transition-all outline-none focus:ring-2 ring-[var(--accent)]/20">
                               <FiCheck size={18} />
                             </button>
                             <button onClick={() => handleStatusUpdate(vendor._id, 'REJECTED')} className="p-2.5 bg-soft-dark hover:bg-red-500 hover:!text-white rounded-xl border border-[var(--border)] transition-all outline-none focus:ring-2 ring-red-500/20">
                               <FiX size={18} />
                             </button>
                             <button 
                               onClick={() => {
                                 setSelectedVendor(vendor);
                                 setIsHistoryModalOpen(true);
                               }}
                               className="p-2.5 bg-soft-dark hover:bg-[var(--primary)] hover:!text-white rounded-xl border border-[var(--border)] transition-all outline-none focus:ring-2 ring-[var(--primary)]/20"
                               title="Review Service History"
                             >
                               <FiList size={18} />
                             </button>
                             <button
                               onClick={() => confirm('Permanently purge this partner entity?') && deleteMutation.mutate(vendor._id)}
                               className="p-2.5 bg-soft-dark hover:bg-[var(--surface-light)] text-[var(--text-muted)] hover:text-[var(--foreground)] rounded-xl border border-[var(--border)] transition-all outline-none"
                             >
                               <FiTrash2 size={18} />
                             </button>
                          </div>
                        </div>
                      </div>

                      {/* Info & Stats Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         <div className="space-y-4 md:col-span-2">
                            <div>
                               <span className="text-[10px] uppercase text-[var(--placeholder)] tracking-widest text-emphasized block mb-2">Base of Operations</span>
                               <p className="text-xs text-[var(--foreground)] flex items-start gap-2 leading-relaxed font-medium bg-soft-dark p-3 rounded-2xl border border-[var(--border)] italic">
                                 <FiMapPin className="mt-0.5 shrink-0 text-[var(--secondary)]" />
                                 {vendor.businessAddress || vendor.address || 'Deployment coordinates not verified'}
                               </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 pt-2">
                               {vendor.providedServices?.map((s: any) => (
                                 <span key={s._id} className="text-[10px] text-emphasized uppercase tracking-tighter bg-[var(--primary)]/5 text-[var(--primary)] px-3 py-1.5 rounded-xl border border-[var(--primary)]/20 flex items-center gap-2">
                                   {s.icon} {s.name}
                                 </span>
                               ))}
                            </div>
                         </div>

                         {/* Performance Audit Card */}
                         <div className="bg-soft-dark rounded-3xl p-6 border border-[var(--border)] space-y-4 shadow-inner relative overflow-hidden">
                            <p className="text-[10px] uppercase text-[var(--placeholder)] tracking-widest text-emphasized flex items-center gap-2"><FiActivity /> Operational Audit</p>
                            <div className="space-y-3">
                               <div className="flex justify-between items-center group/stat">
                                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest flex items-center gap-2"><FiCheckCircle className="text-[var(--accent)]" /> Fulfilled</span>
                                  <span className="text-sm text-[var(--foreground)] text-emphasized group-hover/stat:scale-110 transition-transform">{stats.completed}</span>
                               </div>
                               <div className="flex justify-between items-center group/stat">
                                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest flex items-center gap-2"><FiTruck className="text-[var(--primary)]" /> In Flight</span>
                                  <span className="text-sm text-[var(--foreground)] text-emphasized group-hover/stat:scale-110 transition-transform">{stats.active}</span>
                               </div>
                               <div className="flex justify-between items-center group/stat">
                                  <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-widest flex items-center gap-2"><FiXCircle className="text-red-500" /> Aborted</span>
                                  <span className="text-sm text-[var(--foreground)] text-emphasized group-hover/stat:scale-110 transition-transform">{stats.rejected}</span>
                               </div>
                            </div>
                            {/* Glass decoration */}
                            <div className="absolute bottom-[-20px] right-[-20px] w-20 h-20 bg-[var(--primary)]/5 blur-2xl rounded-full" />
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            );
          })}
          
          {vendors?.length === 0 && (
            <div className="card text-center py-24 border-dashed border-[var(--border)] opacity-60">
               <div className="text-7xl mb-6">🏜️</div>
               <p className="text-[var(--text-muted)] text-emphasized uppercase tracking-widest text-[10px]">Registry is currently offline or empty.</p>
            </div>
          )}
        </div>
      )}
      {isHistoryModalOpen && (
        <VendorHistoryModal vendor={selectedVendor} onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
}

// Sub-component: Vendor History Modal
function VendorHistoryModal({ vendor, onClose }: { vendor: any, onClose: () => void }) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['vendor-history-admin', vendor._id],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      // Filter: Assigned to this vendor OR they rejected it
      return data.data.filter((r: any) => 
        r.vendorId?._id === vendor._id || 
        r.vendorId === vendor._id ||
        r.rejectedVendors?.includes(vendor._id)
      );
    }
  });

  const getStatusDisplay = (req: any) => {
    if (req.rejectedVendors?.includes(vendor._id) && req.vendorId?._id !== vendor._id && req.vendorId !== vendor._id) {
      return { status: 'DECLINED', color: 'text-red-500' };
    }
    
    switch(req.status) {
      case 'COMPLETED': return { status: 'COMPLETED', color: 'text-[var(--accent)]' };
      case 'CANCELLED': return { status: 'CANCELLED', color: 'text-red-500' };
      case 'ACCEPTED':
      case 'ON_THE_WAY':
      case 'ARRIVED':
      case 'IN_PROGRESS':
        return { status: req.status, color: 'text-[var(--primary)]' };
      default: return { status: req.status, color: 'text-[#FFB74D]' };
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--background)]/80 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 lg:pl-64">
         <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-soft-dark">
               <div>
                  <h2 className="text-xl text-emphasized text-[var(--foreground)] uppercase tracking-tight">Service Pulse History</h2>
                  <p className="text-[10px] text-[var(--accent)] text-emphasized uppercase tracking-widest mt-1">Vendor: {vendor.businessName || vendor.fullName}</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-soft-dark rounded-xl text-[var(--text-muted)]"><FiX size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
               {isLoading ? (
                  <div className="flex justify-center p-12">
                     <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
               ) : requests?.length === 0 ? (
                  <div className="text-center py-20 text-[var(--placeholder)] uppercase text-emphasized text-[10px] tracking-widest opacity-40 italic">No operational records found for this partner.</div>
               ) : (
                  requests?.map((req: any) => (
                    <div key={req._id} className="p-5 bg-soft-dark rounded-3xl border border-[var(--border)] hover:border-[var(--primary)]/20 transition-all flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-soft-dark flex items-center justify-center text-xl shrink-0">
                             {req.serviceId?.icon || '⚙️'}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm text-emphasized text-[var(--foreground)] uppercase tracking-tight truncate">{req.serviceId?.name || 'Service Protocol'}</p>
                             <p className="text-[10px] text-[var(--placeholder)] font-mono tracking-tighter uppercase font-medium">REF: {req._id.slice(-12)}</p>
                          </div>
                       </div>

                        <div className="flex items-center gap-4 shrink-0">
                           <div className="text-right">
                             <p className={`text-[10px] text-emphasized uppercase tracking-widest mb-1 ${getStatusDisplay(req).color}`}>{getStatusDisplay(req).status}</p>
                             <p className="text-[9px] text-[var(--text-muted)] font-medium italic">{new Date(req.createdAt).toLocaleDateString()}</p>
                           </div>
                          
                          <button 
                            onClick={() => {
                               setSelectedRequest(req);
                               setIsDetailsOpen(true);
                            }}
                            className="p-2.5 bg-soft-dark border border-[var(--border)] rounded-xl text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all focus:ring-2 ring-[var(--primary)]/20 outline-none"
                            title="Examine Protocol Details"
                          >
                             <FiInfo size={16} />
                          </button>
                       </div>
                    </div>
                  ))
               )}
            </div>
            
            <div className="p-4 bg-soft-dark text-center border-t border-[var(--border)]">
               <p className="text-[10px] text-[var(--placeholder)] uppercase tracking-widest text-emphasized font-mono">End of historical protocol log</p>
            </div>
         </div>
      </div>

      <RequestDetailsModal 
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        request={selectedRequest}
        role="ADMIN"
      />
    </>
  );
}
