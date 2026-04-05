'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { usersAPI, requestsAPI } from '@/lib/services';
import Link from 'next/link';
import { FiAlertCircle, FiCheckCircle, FiClock, FiSettings, FiActivity, FiXCircle } from 'react-icons/fi';

export default function VendorDashboardPage() {
  const { user } = useAuthStore();

  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data } = await usersAPI.getMe();
      return data.data;
    },
  });

  const { data: requests } = useQuery({
    queryKey: ['vendor-requests-summary'],
    queryFn: async () => {
      const { data } = await requestsAPI.getAll();
      return data.data;
    },
  });

  const activeJobsCount = requests?.filter((req: any) => 
    ['ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS'].includes(req.status)
  ).length || 0;

  const completedJobsCount = requests?.filter((req: any) => req.status === 'COMPLETED').length || 0;
  
  // Declined count is harder because REJECTED jobs removal from vendor list is happening on backend filter
  // or we just count based on 'rejectedVendors' array in ALL requests if we could.
  // Requirement: "Show count: Declined Requests".
  // I will check the rejectedVendors property in the requests returned.
  const declinedJobsCount = requests?.filter((req: any) => 
     req.rejectedVendors?.includes(user?._id || user?.userId)
  ).length || 0;

  const availableJobsCount = requests?.filter((req: any) => req.status === 'ASSIGNED').length || 0;

  const isProfileIncomplete = !profile?.businessName || !profile?.phoneNumber || !profile?.providedServices?.length;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-white mb-1 tracking-tight uppercase">Operational Center</h1>
           <p className="text-[#8888aa] text-sm">Welcome back, {profile?.businessName || 'Partner'}. Here is your real-time performance audit.</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-[#6C63FF]/10 border border-[#6C63FF]/20 rounded-full text-[#6C63FF] text-[10px] font-black uppercase tracking-widest">v2.0 Logic Engaged</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card border-white/5 bg-[#12121a] hover:border-[#6C63FF]/30 transition-all group !p-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] group-hover:scale-110 transition-transform">
               <FiActivity size={24} />
             </div>
             <div>
               <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Active Ops</p>
               <p className="text-2xl font-black text-white">{activeJobsCount}</p>
             </div>
          </div>
        </div>
        
        <div className="card border-white/5 bg-[#12121a] hover:border-[#00D4AA]/30 transition-all group !p-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#00D4AA]/10 flex items-center justify-center text-[#00D4AA] group-hover:scale-110 transition-transform">
               <FiCheckCircle size={24} />
             </div>
             <div>
               <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Closed</p>
               <p className="text-2xl font-black text-white">{completedJobsCount}</p>
             </div>
          </div>
        </div>

        <div className="card border-white/5 bg-[#12121a] hover:border-red-500/30 transition-all group !p-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
               <FiXCircle size={24} />
             </div>
             <div>
               <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Declined</p>
               <p className="text-2xl font-black text-white">{declinedJobsCount}</p>
             </div>
          </div>
        </div>

        <div className="card border-white/5 bg-[#12121a] hover:border-[#FFB74D]/30 transition-all group !p-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-[#FFB74D]/10 flex items-center justify-center text-[#FFB74D] group-hover:scale-110 transition-transform">
               <FiAlertCircle size={24} />
             </div>
             <div>
               <p className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Available</p>
               <p className="text-2xl font-black text-white">{availableJobsCount}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-6">
            <div className="card h-full space-y-6 !p-8 border-white/5 bg-gradient-to-br from-black/40 to-transparent">
               <div className="flex items-center justify-between">
                  <h3 className="font-black text-white text-lg uppercase tracking-tight">Business Snapshot</h3>
                  <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
               </div>
               
               <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group/item">
                     <span className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Legal Identity</span>
                     <span className="text-sm text-white font-black group-hover:text-[#6C63FF] transition-colors">{profile?.businessName || 'Awaiting Setup'}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group/item">
                     <span className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Primary Link</span>
                     <span className="text-sm text-white font-bold group-hover:text-[#6C63FF] transition-colors">{profile?.phoneNumber || profile?.email}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between group/item">
                     <span className="text-[10px] text-[#666680] font-black uppercase tracking-widest">Service Breadth</span>
                     <span className="px-3 py-1 bg-[#6C63FF]/10 text-[#6C63FF] text-[10px] font-black rounded-full border border-[#6C63FF]/20">
                        {profile?.providedServices?.length || 0} CATEGORIES
                     </span>
                  </div>
               </div>

               <Link href="/vendor/profile" className="flex items-center justify-center w-full py-4 text-xs font-black uppercase tracking-widest text-[#8888aa] border border-white/5 rounded-2xl hover:bg-white/5 transition-all gap-2 group">
                  Audit Configuration <FiSettings className="group-hover:rotate-90 transition-transform duration-500" />
               </Link>
            </div>
         </div>

         <div className="space-y-6">
            {isProfileIncomplete ? (
               <div className="card border-[#FFB74D]/20 bg-[#FFB74D]/5 p-8 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#FFB74D]/10 flex items-center justify-center text-[#FFB74D]">
                     <FiAlertCircle size={32} />
                  </div>
                  <div className="space-y-2">
                     <h3 className="font-black text-white uppercase tracking-tight text-xl">Compliance Warning</h3>
                     <p className="text-sm text-[#8888aa] leading-relaxed max-w-xs mx-auto italic">Your operational profile is missing verified credentials. You will not receive dispatches until documentation is complete.</p>
                     <div className="pt-4">
                        <Link href="/vendor/profile" className="px-8 py-3 bg-[#FFB74D] text-black font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-[#FFB74D]/20 hover:scale-105 transition-all inline-block">
                           Finalize Now
                        </Link>
                     </div>
                  </div>
               </div>
            ) : (
               <div className="card h-full p-8 border-white/5 bg-[#6C63FF]/5 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6C63FF] to-[#FF6B9D]" />
                  <div className="w-16 h-16 rounded-full bg-[#6C63FF]/10 flex items-center justify-center text-[#6C63FF] group-hover:rotate-[360deg] transition-transform duration-1000">
                     <FiCheckCircle size={32} />
                  </div>
                  <div className="space-y-2 relative z-10">
                     <h3 className="font-black text-white uppercase tracking-tight text-xl">Verified Provider</h3>
                     <p className="text-sm text-[#8888aa] leading-relaxed max-w-xs mx-auto">Your business is fully certified and prioritized for local dispatches. Ready for missions.</p>
                     <div className="pt-4">
                        <Link href="/vendor/jobs" className="px-8 py-3 bg-[#6C63FF] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-[#6C63FF]/20 hover:scale-105 transition-all inline-block">
                           View Mission Board
                        </Link>
                     </div>
                  </div>
                  {/* Subtle glass effect */}
                  <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-[#6C63FF]/5 blur-3xl rounded-full" />
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
