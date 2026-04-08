'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { FiFilter, FiUser, FiClock, FiMapPin, FiCalendar, FiActivity, FiCheckCircle, FiTarget } from 'react-icons/fi';

const STATUS_OPTS = ['ALL', 'CREATED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

const STATUS_MARKERS = [
  { id: 'CREATED', label: 'Signal Logged', icon: <FiActivity /> },
  { id: 'ASSIGNED', label: 'Unit Dispatched', icon: <FiClock /> },
  { id: 'IN_PROGRESS', label: 'Field Engagement', icon: <FiTarget size={14} /> },
  { id: 'COMPLETED', label: 'Mission Success', icon: <FiCheckCircle /> },
];

export default function AdminDashboardPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');

  const { data: requests, isLoading } = useQuery({
    queryKey: ['all-requests', filter],
    queryFn: async () => {
      const statusParam = filter === 'ALL' ? undefined : filter;
      const { data } = await requestsAPI.getAll(statusParam);
      return data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) =>
      requestsAPI.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['all-requests'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  });

  const handleStatusChange = (id: string, newStatus: string) => {
    updateStatusMutation.mutate({ id, status: newStatus });
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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CREATED': return 'badge-created';
      case 'ASSIGNED': return 'badge-assigned';
      case 'IN_PROGRESS': return 'badge-progress';
      case 'COMPLETED': return 'badge-completed';
      case 'CANCELLED': return 'badge-cancelled';
      default: return 'bg-gray-800 text-gray-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mb-2">Service Requests Overview</h1>
          <p className="text-[var(--text-muted)]">Manage and track all customer service requests.</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[var(--text-muted)] whitespace-nowrap">
            <FiFilter /> Filter:
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field !py-2 !px-3 appearance-none min-w-[140px]"
          >
            {STATUS_OPTS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : requests?.length === 0 ? (
        <div className="card text-center py-16 w-full">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">No Requests Found</h3>
          <p className="text-[var(--text-muted)]">There are no service requests matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {requests?.map((req: {
            _id: string;
            status: string;
            serviceId?: { name: string; icon: string };
            userId?: { email: string };
            description: string;
            preferredTime: string;
            createdAt: string;
            address: string;
          }) => {
            const statusIndex = STATUS_MARKERS.findIndex(m => m.id === req.status);
            const currentIdx = statusIndex === -1 ? 1 : statusIndex;

            return (
              <div key={req._id} className="card relative transition-all duration-300 overflow-hidden group hover:border-[#00D4AA] w-full hover:bg-[rgba(108,99,255,0.02)]">

              <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`badge ${getStatusBadgeClass(req.status)} text-xs border-none`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[var(--placeholder)] font-mono">ID: {req._id}</span>
                  </div>

                  <div className="flex items-start gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-[rgba(108,99,255,0.1)] flex items-center justify-center text-2xl border border-[rgba(108,99,255,0.2)]">
                      {req.serviceId?.icon || '🔧'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">
                        {req.serviceId?.name || 'Unknown Service'}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                        <FiUser className="text-[var(--primary)]" /> {req.userId?.email || 'Unknown User'}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-muted)] bg-soft-dark p-4 rounded-xl border border-[var(--border)] whitespace-pre-wrap leading-relaxed mb-10 font-medium italic">
                    <span className="text-emphasized text-[var(--foreground)] block mb-1 text-[10px] uppercase tracking-widest">Narrative</span>
                    "{req.description}"
                  </p>

                  <div className="pt-2 px-1">
                    <div className="flex items-center justify-between relative px-2">
                      {/* Track Background */}
                      <div className="absolute top-4 left-0 w-full h-[1px] bg-soft-dark" />
                      
                      {STATUS_MARKERS.map((marker, mIdx) => {
                        const isPassed = mIdx <= currentIdx && req.status !== 'CANCELLED';
                        const isActive = mIdx === currentIdx && req.status !== 'CANCELLED';

                        return (
                          <div key={marker.id} className="relative z-10 flex flex-col items-center gap-2.5 w-1/4">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 border ${
                              isPassed 
                                ? 'bg-[var(--primary)] border-[#6C63FF] !text-white shadow-lg shadow-[var(--primary)]/20' 
                                : 'bg-soft-dark border-[var(--border)] text-[var(--placeholder)]'
                            } ${isActive ? 'scale-110 ring-4 ring-[#6C63FF]/20' : ''}`}>
                              {marker.icon}
                            </div>
                            <div className="text-center">
                               <p className={`text-[8px] text-emphasized uppercase tracking-widest ${isPassed ? 'text-[var(--foreground)]' : 'text-[var(--placeholder)] opacity-40'}`}>
                                 {marker.label}
                               </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Side Info & Actions */}
                <div className="xl:w-1/3 flex flex-col pt-4 xl:pt-0 border-t xl:border-t-0 xl:border-l border-[rgba(108,99,255,0.1)] xl:pl-6">

                  <div className="space-y-4 mb-6 flex-1">
                    <div className="flex items-start gap-3">
                      <FiCalendar className="text-[var(--accent)] mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1">Preferred Time</p>
                        <p className="text-sm text-[var(--foreground)] font-medium">{formatDate(req.preferredTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiClock className="text-[var(--primary)] mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1">Created At</p>
                        <p className="text-sm text-[var(--foreground)]">{formatDate(req.createdAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FiMapPin className="text-[var(--secondary)] mt-1 shrink-0" />
                      <div>
                        <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider mb-1">Address</p>
                        <p className="text-sm text-[var(--foreground)]">{req.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin Action */}
                  <div className="bg-[rgba(108,99,255,0.05)] rounded-xl p-4 border border-[rgba(108,99,255,0.1)] mt-auto">
                    <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                      Update Status
                    </label>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req._id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className="input-field !py-2 w-full appearance-none cursor-pointer focus:border-[#00D4AA]"
                    >
                      {STATUS_OPTS.filter(s => s !== 'ALL').map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
}
