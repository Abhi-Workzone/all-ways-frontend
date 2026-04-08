'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, requestsAPI, servicesAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FiTrash2, FiShield, FiPlusCircle, FiList, FiX, FiClock, FiCalendar, FiMapPin, FiActivity, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { ConfirmModal } from '@/components/confirm-modal';
import { RequestDetailsModal } from '@/components/request-details-modal';
import LocationPicker from '@/components/location-picker';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await usersAPI.getUsers('USER');
      return data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ role: string; isVerified: boolean }> }) => usersAPI.updateUser(id, data),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAPI.deleteUser(id),
    onSuccess: () => {
      toast.success('User record purged');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-2xl text-emphasized text-[var(--foreground)] mb-2 tracking-tight">Client Registry</h1>
        <p className="text-[var(--text-muted)] text-sm font-medium italic">Manage customer entities and orchestrate proxy operations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users?.map((user: any) => (
            <div key={user._id} className="card !p-4 md:!p-5 hover:border-[#6C63FF]/30 transition-all group overflow-hidden relative border-[var(--border)] bg-soft-dark">
              {/* Layout Container */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
                
                {/* Identity Section */}
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center text-[var(--foreground)] text-xl sm:text-2xl text-emphasized shadow-lg shadow-[var(--primary)]/10 group-hover:scale-105 transition-transform duration-500 shrink-0">
                    {user.fullName?.charAt(0) || user.email.charAt(0)}
                  </div>
                  <div className="min-w-0">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <h3 className="text-[var(--foreground)] text-emphasized tracking-tight uppercase text-base sm:text-lg truncate">
                          {user.fullName || user.email.split('@')[0]}
                        </h3>
                        {user.role === 'ADMIN' && <FiShield size={18} className="text-[var(--accent)] shrink-0" title="Admin User" />}
                     </div>
                     <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-0.5 mt-0.5 sm:mt-1">
                        <span className="text-[10px] sm:text-xs text-[var(--text-muted)] font-medium tracking-tight uppercase font-mono truncate">{user.email}</span>
                        <span className="text-[9px] sm:text-[10px] text-[var(--accent)] text-emphasized uppercase tracking-widest">
                          Joined {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                     </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-4 sm:pt-0 border-t border-[var(--border)] sm:border-0 relative z-10">
                   {/* Main Actions Group */}
                   <div className="flex items-center gap-2 flex-1 sm:flex-none">
                      <button 
                        onClick={() => {
                           setSelectedUser(user);
                           setIsProxyModalOpen(true);
                        }}
                        className="flex-1 sm:flex-none p-3 bg-soft-dark hover:bg-[var(--primary)] hover:!text-white text-[var(--primary)] rounded-xl transition-all border border-[var(--border)] flex items-center justify-center gap-2 group/btn"
                        title="New Proxy Request"
                      >
                         <FiPlusCircle size={18} />
                         <span className="text-[10px] uppercase text-emphasized tracking-widest sm:hidden group-hover/btn:inline">Request</span>
                      </button>

                      <button 
                        onClick={() => {
                           setSelectedUser(user);
                           setIsHistoryModalOpen(true);
                        }}
                        className="p-3 bg-soft-dark hover:bg-[var(--accent)] hover:text-black text-[var(--accent)] rounded-xl transition-all border border-[var(--border)]"
                        title="Pulse History"
                      >
                         <FiList size={18} />
                      </button>
                   </div>

                   <div className="hidden sm:block w-[1px] h-6 bg-[var(--border)] mx-1" />

                   {/* Management Actions */}
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => confirm('Promote this entity to Professional Partner?') && updateMutation.mutate({ id: user._id, data: { role: 'VENDOR' } })}
                        className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-[9px] sm:text-[10px] text-emphasized uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)] border border-[#6C63FF]/20 hover:bg-[var(--primary)] hover:!text-white rounded-xl transition-all whitespace-nowrap"
                      >
                        Elevate to Vendor
                      </button>
                      <button
                        onClick={() => confirm('Permanently purge this user from registry?') && deleteMutation.mutate(user._id)}
                        className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:!text-white rounded-xl transition-all border border-red-500/20"
                        title="Purge Identity"
                      >
                        <FiTrash2 size={18} />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Standalone Modals */}
      {isProxyModalOpen && (
        <ProxyBookingModal user={selectedUser} onClose={() => setIsProxyModalOpen(false)} />
      )}
      
      {isHistoryModalOpen && (
        <UserHistoryModal user={selectedUser} onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
}

// Sub-component: Proxy Booking for specific user
function ProxyBookingModal({ user, onClose }: { user: any, onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    serviceId: '',
    address: '',
    mapAddress: '',
    manualAddress: '',
    latitude: 28.6139,
    longitude: 77.2090,
    description: '',
    preferredTime: '',
  });

  const { data: services } = useQuery({ queryKey: ['services'], queryFn: async () => (await servicesAPI.getActive()).data });

  const createMutation = useMutation({
    mutationFn: (data: any) => requestsAPI.adminCreate({ ...data, userEmail: user.email }),
    onSuccess: () => {
       toast.success(`Proxy booking created for ${user.email}`);
       queryClient.invalidateQueries({ queryKey: ['admin-requests'] });
       onClose();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Creation rejected'),
  });

  const handleLocationSelect = (loc: { address: string; lat: number; lng: number }) => {
    setFormData(prev => {
        const manual = prev.manualAddress || '';
        return {
            ...prev,
            mapAddress: loc.address,
            latitude: loc.lat,
            longitude: loc.lng,
            address: manual ? `${manual}, ${loc.address}` : loc.address
        };
    });
  };

  const handleManualAddressChange = (val: string) => {
    setFormData(prev => ({
        ...prev,
        manualAddress: val,
        address: prev.mapAddress ? `${val}, ${prev.mapAddress}` : val
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soft-dark backdrop-blur-xl animate-in fade-in duration-300 lg:pl-64 overflow-y-auto">
       <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-soft-dark">
             <div>
                <h2 className="text-xl text-emphasized text-[var(--foreground)] tracking-tight">Proxy Operation Terminal</h2>
                <p className="text-[10px] text-[var(--accent)] text-emphasized tracking-widest mt-1">Executing for: {user.email}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-soft-dark rounded-xl text-[var(--text-muted)]"><FiX size={24} /></button>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
             {/* VISUAL SERVICE VECTOR SELECTION */}
             <div className="space-y-4">
                <label className="text-[10px] text-emphasized text-[var(--placeholder)] uppercase tracking-widest block flex items-center gap-2">
                   <FiActivity className="text-[var(--primary)]" /> Activate Operational Sector
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {services?.data?.map((s: any) => (
                      <div 
                        key={s._id}
                        onClick={() => setFormData({...formData, serviceId: s._id})}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all relative group flex flex-col items-center text-center gap-2 ${
                           formData.serviceId === s._id 
                           ? 'bg-[var(--primary)]/10 border-[#6C63FF] shadow-[0_0_15px_rgba(108,99,255,0.2)]' 
                           : 'bg-soft-dark border-[var(--border)] hover:border-[var(--border)]'
                        }`}
                      >
                         {formData.serviceId === s._id && (
                            <div className="absolute top-2 right-2 text-[var(--primary)]">
                               <FiCheckCircle size={14} />
                            </div>
                         )}
                         <div className="text-3xl group-hover:scale-110 transition-transform duration-500">
                            {s.icon || '⚙️'}
                         </div>
                         <p className="text-[10px] text-emphasized text-[var(--foreground)] uppercase tracking-tight leading-tight">{s.name}</p>
                      </div>
                   ))}
                </div>
                {services?.data?.length === 0 && (
                   <p className="text-[10px] text-[var(--placeholder)] italic uppercase tracking-widest opacity-40">No sectors available for engagement.</p>
                )}
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] text-emphasized text-[var(--placeholder)] uppercase tracking-widest mb-2 block flex items-center gap-2">
                     <FiClock className="text-[var(--primary)]" /> Mission Clock (Scheduled Time)
                  </label>
                  <input 
                    type="datetime-local" 
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-soft-dark border border-[var(--border)] p-4 rounded-2xl text-[var(--foreground)] text-sm focus:border-[#6C63FF] outline-none [color-scheme:dark]"
                    value={formData.preferredTime}
                    onChange={e => setFormData({...formData, preferredTime: e.target.value})}
                  />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] text-emphasized text-[var(--placeholder)] uppercase tracking-widest mb-2 block flex items-center gap-2">
                   <FiMapPin className="text-[var(--primary)]" /> Engagement Coordinate (Location)
                </label>
                
                <div className="border border-[var(--border)] rounded-3xl overflow-hidden">
                   <LocationPicker 
                     onLocationSelect={handleLocationSelect} 
                     defaultLat={formData.latitude}
                     defaultLng={formData.longitude}
                   />
                </div>

                <div className="space-y-4 pt-2">
                   <div className="p-4 bg-soft-dark border border-[var(--border)] rounded-2xl">
                      <p className="text-[9px] uppercase text-[var(--placeholder)] text-emphasized tracking-widest mb-1.5 opacity-80">Detected Area Signature</p>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed italic">{formData.mapAddress || 'Waiting for coordinate lock...'}</p>
                   </div>

                   <div>
                      <label className="text-[10px] uppercase text-[var(--placeholder)] text-emphasized tracking-widest mb-2 block">Building / Flat / Sub-Zone Details</label>
                      <textarea 
                        rows={2} 
                        placeholder="e.g. Unit 4B, MG Road Plaza..."
                        className="w-full bg-soft-dark border border-[var(--border)] p-4 rounded-2xl text-[var(--foreground)] text-sm focus:border-[#6C63FF] outline-none resize-none transition-all"
                        value={formData.manualAddress}
                        onChange={(e) => handleManualAddressChange(e.target.value)}
                      />
                   </div>
                </div>
             </div>

             <div>
                <label className="text-[10px] text-emphasized text-[var(--placeholder)] uppercase tracking-widest mb-2 block">Sector Narrative (Description)</label>
                <textarea 
                  className="w-full bg-soft-dark border border-[var(--border)] p-4 rounded-2xl text-[var(--foreground)] text-sm focus:border-[#6C63FF] outline-none h-24 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Define the scope of engagement..."
                />
             </div>
          </div>

          <div className="p-6 bg-soft-dark flex gap-4 border-t border-[var(--border)]">
             <button onClick={onClose} className="flex-1 py-4 text-[10px] text-emphasized uppercase tracking-widest text-[var(--text-muted)] hover:bg-soft-dark rounded-2xl transition-all">Abort Signal</button>
             <button 
               onClick={() => createMutation.mutate(formData)}
               disabled={createMutation.isPending || !formData.serviceId || !formData.address}
               className="flex-1 py-4 bg-[var(--primary)] !text-white text-emphasized text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-[var(--primary)]/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
             >
                {createMutation.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FiCheckCircle /> Initiate Pulse</>}
             </button>
          </div>
       </div>
    </div>
  );
}

// Sub-component: User History Modal
function UserHistoryModal({ user, onClose }: { user: any, onClose: () => void }) {
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['user-history-admin', user._id],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data.filter((r: any) => r.userId?._id === user._id || r.userId === user._id);
    }
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'COMPLETED': return 'text-[var(--accent)]';
      case 'CANCELLED': return 'text-red-500';
      case 'IN_PROGRESS': return 'text-[var(--primary)]';
      default: return 'text-[#FFB74D]';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-soft-dark backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 lg:pl-64">
         <div className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-[var(--border)] flex items-center justify-between bg-soft-dark">
               <div>
                  <h2 className="text-xl text-emphasized text-[var(--foreground)] uppercase tracking-tight">Deployment Archives</h2>
                  <p className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest mt-1">Inspecting: {user.email}</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-soft-dark rounded-xl text-[var(--text-muted)]"><FiX size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
               {isLoading ? (
                  <div className="flex justify-center p-12">
                     <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                  </div>
               ) : requests?.length === 0 ? (
                  <div className="text-center py-20 text-[var(--placeholder)] uppercase text-emphasized text-[10px] tracking-widest opacity-40 italic">No operational pulses recorded for this signature.</div>
               ) : (
                  requests?.map((req: any) => (
                    <div key={req._id} className="p-5 bg-soft-dark rounded-3xl border border-[var(--border)] hover:border-[#6C63FF]/20 transition-all flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-soft-dark flex items-center justify-center text-xl shrink-0">
                             {req.serviceId?.icon || '⚙️'}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm text-emphasized text-[var(--foreground)] uppercase tracking-tight truncate">{req.serviceId?.name || 'Protocol Unknown'}</p>
                             <p className="text-[10px] text-[var(--placeholder)] font-mono tracking-tighter">REF: {req._id.slice(-12).toUpperCase()}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className={`text-[10px] text-emphasized uppercase tracking-widest mb-1 ${getStatusColor(req.status)}`}>{req.status}</p>
                            <p className="text-[9px] text-[var(--text-muted)] font-medium italic">{new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <button 
                            onClick={() => {
                               setSelectedRequest(req);
                               setIsDetailsOpen(true);
                            }}
                            className="p-2.5 bg-soft-dark border border-[var(--border)] rounded-xl text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-all"
                            title="Protocol Details"
                          >
                             <FiInfo size={16} />
                          </button>
                       </div>
                    </div>
                  ))
               )}
            </div>
            
            <div className="p-4 bg-soft-dark text-center border-t border-[var(--border)]">
               <p className="text-[10px] text-[var(--placeholder)] uppercase tracking-widest text-emphasized font-mono">End of historical sector archive</p>
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
