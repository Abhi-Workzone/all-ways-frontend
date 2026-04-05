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
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Client Registry</h1>
        <p className="text-[#8888aa] text-sm font-medium italic">Manage customer entities and orchestrate proxy operations.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {users?.map((user: any) => (
            <div key={user._id} className="card !p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-white/5 hover:border-[#6C63FF]/30 transition-all group overflow-hidden relative">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-[#6C63FF]/10 group-hover:scale-105 transition-transform duration-500">
                  {user.fullName?.charAt(0) || user.email.charAt(0)}
                </div>
                <div>
                   <div className="flex items-center gap-3">
                      <h3 className="text-white font-black tracking-tight uppercase text-lg">
                        {user.fullName || user.email.split('@')[0]}
                      </h3>
                      {user.role === 'ADMIN' && <FiShield size={20} className="text-[#00D4AA]" title="Admin User" />}
                   </div>
                   <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 mt-1">
                      <span className="text-xs text-[#8888aa] font-medium tracking-tight uppercase font-mono">{user.email}</span>
                      <span className="text-[10px] text-[#00D4AA] font-black uppercase tracking-widest hidden sm:inline">Joined {new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                   </div>
                </div>
              </div>

              <div className="flex items-center gap-2 relative z-10 bg-black/40 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/5 sm:border-none">
                 {/* Proxy Booking Trigger */}
                 <button 
                   onClick={() => {
                      setSelectedUser(user);
                      setIsProxyModalOpen(true);
                   }}
                   className="p-3 bg-white/5 hover:bg-[#6C63FF] hover:text-white text-[#6C63FF] rounded-xl transition-all border border-white/5 flex items-center gap-2 group/btn"
                   title="Initiate Proxy Booking"
                 >
                    <FiPlusCircle size={18} />
                    <span className="text-[10px] uppercase font-black tracking-widest sm:hidden group-hover/btn:inline duration-300">New Request</span>
                 </button>

                 {/* History Trigger */}
                 <button 
                   onClick={() => {
                      setSelectedUser(user);
                      setIsHistoryModalOpen(true);
                   }}
                   className="p-3 bg-white/5 hover:bg-[#00D4AA] hover:text-black text-[#00D4AA] rounded-xl transition-all border border-white/5"
                   title="Review Pulse History"
                 >
                    <FiList size={18} />
                 </button>

                 <div className="w-[1px] h-6 bg-white/10 mx-2" />

                <button
                  onClick={() => confirm('Promote this entity to Professional Partner?') && updateMutation.mutate({ id: user._id, data: { role: 'VENDOR' } })}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20 hover:bg-[#6C63FF] hover:text-white rounded-xl transition-all"
                >
                  Make Vendor
                </button>
                <button
                  onClick={() => confirm('Permanently purge this user from registry?') && deleteMutation.mutate(user._id)}
                  className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                  title="Purge User"
                >
                  <FiTrash2 size={18} />
                </button>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 lg:pl-64 overflow-y-auto">
       <div className="bg-[#12121a] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl my-auto">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
             <div>
                <h2 className="text-xl font-black text-white tracking-tight">Proxy Operation Terminal</h2>
                <p className="text-[10px] text-[#00D4AA] font-black tracking-widest mt-1">Executing for: {user.email}</p>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-[#8888aa]"><FiX size={24} /></button>
          </div>

          <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
             {/* VISUAL SERVICE VECTOR SELECTION */}
             <div className="space-y-4">
                <label className="text-[10px] font-black text-[#666680] uppercase tracking-widest block flex items-center gap-2">
                   <FiActivity className="text-[#6C63FF]" /> Activate Operational Sector
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                   {services?.data?.map((s: any) => (
                      <div 
                        key={s._id}
                        onClick={() => setFormData({...formData, serviceId: s._id})}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all relative group flex flex-col items-center text-center gap-2 ${
                           formData.serviceId === s._id 
                           ? 'bg-[#6C63FF]/10 border-[#6C63FF] shadow-[0_0_15px_rgba(108,99,255,0.2)]' 
                           : 'bg-black/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                         {formData.serviceId === s._id && (
                            <div className="absolute top-2 right-2 text-[#6C63FF]">
                               <FiCheckCircle size={14} />
                            </div>
                         )}
                         <div className="text-3xl group-hover:scale-110 transition-transform duration-500">
                            {s.icon || '⚙️'}
                         </div>
                         <p className="text-[10px] font-black text-white uppercase tracking-tight leading-tight">{s.name}</p>
                      </div>
                   ))}
                </div>
                {services?.data?.length === 0 && (
                   <p className="text-[10px] text-[#666680] italic uppercase tracking-widest opacity-40">No sectors available for engagement.</p>
                )}
             </div>

             <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-[10px] font-black text-[#666680] uppercase tracking-widest mb-2 block flex items-center gap-2">
                     <FiClock className="text-[#6C63FF]" /> Mission Clock (Scheduled Time)
                  </label>
                  <input 
                    type="datetime-local" 
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white text-sm focus:border-[#6C63FF] outline-none [color-scheme:dark]"
                    value={formData.preferredTime}
                    onChange={e => setFormData({...formData, preferredTime: e.target.value})}
                  />
                </div>
             </div>

             <div className="space-y-4">
                <label className="text-[10px] font-black text-[#666680] uppercase tracking-widest mb-2 block flex items-center gap-2">
                   <FiMapPin className="text-[#6C63FF]" /> Engagement Coordinate (Location)
                </label>
                
                <div className="border border-white/5 rounded-3xl overflow-hidden">
                   <LocationPicker 
                     onLocationSelect={handleLocationSelect} 
                     defaultLat={formData.latitude}
                     defaultLng={formData.longitude}
                   />
                </div>

                <div className="space-y-4 pt-2">
                   <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                      <p className="text-[9px] uppercase text-[#666680] font-black tracking-widest mb-1.5 opacity-80">Detected Area Signature</p>
                      <p className="text-xs text-white leading-relaxed italic">{formData.mapAddress || 'Waiting for coordinate lock...'}</p>
                   </div>

                   <div>
                      <label className="text-[10px] uppercase text-[#666680] font-black tracking-widest mb-2 block">Building / Flat / Sub-Zone Details</label>
                      <textarea 
                        rows={2} 
                        placeholder="e.g. Unit 4B, MG Road Plaza..."
                        className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white text-sm focus:border-[#6C63FF] outline-none resize-none transition-all"
                        value={formData.manualAddress}
                        onChange={(e) => handleManualAddressChange(e.target.value)}
                      />
                   </div>
                </div>
             </div>

             <div>
                <label className="text-[10px] font-black text-[#666680] uppercase tracking-widest mb-2 block">Sector Narrative (Description)</label>
                <textarea 
                  className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white text-sm focus:border-[#6C63FF] outline-none h-24 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Define the scope of engagement..."
                />
             </div>
          </div>

          <div className="p-6 bg-black/40 flex gap-4 border-t border-white/5">
             <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-[#8888aa] hover:bg-white/5 rounded-2xl transition-all">Abort Signal</button>
             <button 
               onClick={() => createMutation.mutate(formData)}
               disabled={createMutation.isPending || !formData.serviceId || !formData.address}
               className="flex-1 py-4 bg-[#6C63FF] text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-lg shadow-[#6C63FF]/20 hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
      case 'COMPLETED': return 'text-[#00D4AA]';
      case 'CANCELLED': return 'text-red-500';
      case 'IN_PROGRESS': return 'text-[#6C63FF]';
      default: return 'text-[#FFB74D]';
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300 lg:pl-64">
         <div className="bg-[#12121a] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40">
               <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Deployment Archives</h2>
                  <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest mt-1">Inspecting: {user.email}</p>
               </div>
               <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-[#8888aa]"><FiX size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
               {isLoading ? (
                  <div className="flex justify-center p-12">
                     <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
                  </div>
               ) : requests?.length === 0 ? (
                  <div className="text-center py-20 text-[#666680] uppercase font-black text-[10px] tracking-widest opacity-40 italic">No operational pulses recorded for this signature.</div>
               ) : (
                  requests?.map((req: any) => (
                    <div key={req._id} className="p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-[#6C63FF]/20 transition-all flex items-center justify-between gap-4">
                       <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0">
                             {req.serviceId?.icon || '⚙️'}
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-black text-white uppercase tracking-tight truncate">{req.serviceId?.name || 'Protocol Unknown'}</p>
                             <p className="text-[10px] text-[#666680] font-mono tracking-tighter">REF: {req._id.slice(-12).toUpperCase()}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${getStatusColor(req.status)}`}>{req.status}</p>
                            <p className="text-[9px] text-[#8888aa] font-medium italic">{new Date(req.createdAt).toLocaleDateString()}</p>
                          </div>
                          
                          <button 
                            onClick={() => {
                               setSelectedRequest(req);
                               setIsDetailsOpen(true);
                            }}
                            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-[#6C63FF] hover:bg-[#6C63FF]/10 transition-all"
                            title="Protocol Details"
                          >
                             <FiInfo size={16} />
                          </button>
                       </div>
                    </div>
                  ))
               )}
            </div>
            
            <div className="p-4 bg-black/60 text-center border-t border-white/5">
               <p className="text-[10px] text-[#666680] uppercase tracking-widest font-black font-mono">End of historical sector archive</p>
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
