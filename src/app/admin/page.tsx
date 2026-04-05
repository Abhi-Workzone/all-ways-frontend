'use client';

import { useQuery } from '@tanstack/react-query';
import { requestsAPI, usersAPI, servicesAPI } from '@/lib/services';
import { 
  FiUsers, 
  FiBriefcase, 
  FiActivity, 
  FiCheckCircle, 
  FiClock, 
  FiTrendingUp, 
  FiAlertCircle, 
  FiTarget,
  FiZap,
  FiMaximize,
  FiFileText,
  FiArrowUpRight,
  FiLayers,
  FiSettings,
  FiShieldOff
} from 'react-icons/fi';
import Link from 'next/link';

export default function AdminAnalyticsDashboard() {
  // Aggregate data for analytics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [usersRes, vendorsRes, requestsRes, servicesRes] = await Promise.all([
        usersAPI.getUsers('USER'),
        usersAPI.getUsers('VENDOR'),
        requestsAPI.getAll(),
        servicesAPI.getAll()
      ]);

      const users = usersRes.data.data;
      const vendors = vendorsRes.data.data;
      const requests = requestsRes.data.data;
      const sectors = servicesRes.data.data;

      const completed = requests.filter((r: any) => r.status === 'COMPLETED').length;
      const pending = requests.filter((r: any) => ['CREATED', 'ASSIGNED', 'ACCEPTED', 'ON_THE_WAY'].includes(r.status)).length;
      const active = requests.filter((r: any) => ['IN_PROGRESS'].includes(r.status)).length;
      const cancelled = requests.filter((r: any) => r.status === 'CANCELLED').length;
      const unverified = vendors.filter((v: any) => !v.isVerified).length;

      return {
        totalUsers: users.length,
        totalVendors: vendors.length,
        totalRequests: requests.length,
        completed,
        pending,
        active,
        cancelled,
        totalSectors: sectors.length,
        unverified,
        recentRequests: requests.slice(0, 5)
      };
    },
    refetchInterval: 10000, // Sync every 10s
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const metrics = [
    { label: 'Total Clients', value: stats?.totalUsers, icon: FiUsers, color: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]/10', sub: 'Active registry' },
    { label: 'Total Partners', value: stats?.totalVendors, icon: FiBriefcase, color: 'text-[#00D4AA]', bg: 'bg-[#00D4AA]/10', sub: 'Verified force' },
    { label: 'Completed', value: stats?.completed, icon: FiCheckCircle, color: 'text-[#00D4AA]', bg: 'bg-[#00D4AA]/10', sub: 'System success' },
    { label: 'Live Operations', value: stats?.active, icon: FiActivity, color: 'text-[#FF6B9D]', bg: 'bg-[#FF6B9D]/10', sub: 'Active pulses' },
    { label: 'In Queue', value: stats?.pending, icon: FiClock, color: 'text-[#FFB74D]', bg: 'bg-[#FFB74D]/10', sub: 'Awaiting dispatch' },
    { label: 'Cancelled', value: stats?.cancelled, icon: FiAlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', sub: 'Voided signals' },
    { label: 'Service Sectors', value: stats?.totalSectors, icon: FiSettings, color: 'text-[#6C63FF]', bg: 'bg-[#6C63FF]/10', sub: 'Active categories' },
    { label: 'Awaiting Auth', value: stats?.unverified, icon: FiShieldOff, color: 'text-[#FF6B9D]', bg: 'bg-[#FF6B9D]/10', sub: 'Pending verification' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">System Overview</h1>
           <p className="text-[#8888aa] text-sm italic font-medium">Real-time analytical metrics for AllWays operations.</p>
        </div>
        <div className="flex items-center gap-3 px-5 py-3 bg-[#6C63FF]/5 border border-[#6C63FF]/10 rounded-2xl">
           <div className="w-2 h-2 rounded-full bg-[#00D4AA] animate-pulse" />
           <p className="text-[10px] text-white/50 font-black uppercase tracking-widest leading-none">Status: <span className="text-white">OPERATIONAL</span></p>
        </div>
      </div>

      {/* METRICS HUD - 4 CARDS PER ROW ON LARGE SCREENS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card !p-6 group hover:border-[#6C63FF]/30 transition-all relative overflow-hidden backdrop-blur-xl group cursor-default">
               <div className={`absolute -right-4 -top-4 w-24 h-24 ${m.bg} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
               
               <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-3">
                     <p className="text-[9px] font-black text-[#666680] uppercase tracking-widest leading-none mb-1 opacity-80">{m.label}</p>
                     <p className="text-4xl font-black text-white tracking-tighter leading-none">{m.value}</p>
                     <p className="text-[10px] text-[#8888aa] italic font-medium">{m.sub}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl ${m.bg} flex items-center justify-center ${m.color} text-xl border border-white/5 transition-transform duration-500 group-hover:scale-110`}>
                     <Icon />
                  </div>
               </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* ACTIVITY FEED */}
         <div className="lg:col-span-2 card !p-8 space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#6C63FF]/10 text-[#6C63FF] rounded-xl"><FiLayers size={24} /></div>
                  <div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">Recent Live Requests</h3>
                     <p className="text-[10px] text-[#8888aa] font-black uppercase tracking-widest">Latest mission signals</p>
                  </div>
               </div>
               <Link href="/admin/live-requests" className="flex items-center gap-2 text-[#6C63FF] text-[10px] font-black uppercase tracking-widest hover:translate-x-1 transition-transform">
                  View Monitor <FiArrowUpRight />
               </Link>
            </div>

            <div className="space-y-4">
               {stats?.recentRequests.map((req: any) => (
                  <div key={req._id} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:bg-[#6C63FF]/5 transition-all group overflow-hidden relative">
                     <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl shrink-0 group-hover:bg-[#6C63FF]/20 transition-colors">
                           {req.serviceId?.icon || '⚙️'}
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-black text-white uppercase tracking-tight truncate">{req.serviceId?.name}</p>
                           <p className="text-[10px] text-[#666680] font-mono tracking-tighter lowercase">{req.userId?.email}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${
                           req.status === 'COMPLETED' ? 'text-[#00D4AA]' : 
                           req.status === 'CANCELLED' ? 'text-red-500' : 'text-[#6C63FF]'
                        }`}>{req.status.replace('_', ' ')}</p>
                        <p className="text-[8px] text-[#666680] font-bold uppercase tracking-widest">{new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                  </div>
               ))}
               {stats?.recentRequests.length === 0 && (
                  <div className="text-center py-10 text-[#666680] uppercase font-black text-[10px] tracking-widest italic opacity-40">No recent operational signals.</div>
               )}
            </div>
         </div>

         {/* STATS & QUICK LINKS */}
         <div className="space-y-6">
            <div className="card !p-8 bg-gradient-to-br from-[#6C63FF]/10 to-transparent border-[#6C63FF]/20 relative overflow-hidden">
               <FiTarget className="absolute -right-8 -bottom-8 text-white/5 text-9xl rotate-12" />
               <div className="w-12 h-12 rounded-xl bg-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] mb-6 border border-[#6C63FF]/20">
                  <FiTarget size={24} />
               </div>
               <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Platform Efficiency</h3>
               <p className="text-xs text-[#8888aa] leading-relaxed italic mb-8">Mission completion optimization tracking.</p>
               
               <div className="space-y-4">
                  <div className="h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                     <div 
                       className="h-full bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] rounded-full shadow-[0_0_10px_rgba(108,99,255,0.4)] transition-all duration-1000" 
                       style={{ width: `${(stats?.completed / (stats?.totalRequests || 1)) * 100}%` }} 
                     />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#666680]">
                     <span>Success Rate</span>
                     <span className="text-white">{( (stats?.completed / (stats?.totalRequests || 1)) * 100 ).toFixed(1)}%</span>
                  </div>
               </div>
            </div>

            <div className="card !p-8">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-[#FF6B9D]/10 text-[#FF6B9D] rounded-lg flex items-center justify-center"><FiZap /></div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest">System Management</h3>
               </div>
               <div className="space-y-3">
                  <Link href="/admin/users" className="w-full p-4 flex items-center justify-between bg-black/20 border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest group">
                     User Registry
                     <FiMaximize size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link href="/admin/vendors" className="w-full p-4 flex items-center justify-between bg-black/20 border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest group">
                     Partner Registry
                     <FiBriefcase size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <Link href="/admin/services" className="w-full p-4 flex items-center justify-between bg-black/20 border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest group">
                     Service Config
                     <FiFileText size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
