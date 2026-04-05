'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesAPI } from '@/lib/services';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const serviceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 chars'),
  description: z.string().min(5, 'Description must be at least 5 chars'),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
  isComingSoon: z.boolean().optional(),
  position: z.number().optional(),
});

type ServiceForm = z.infer<typeof serviceSchema>;

interface Service {
  _id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  isComingSoon: boolean;
  position?: number;
}

export default function AdminServicesPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data } = await servicesAPI.getAll();
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      icon: '✨',
      isActive: true,
      isComingSoon: false,
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: ServiceForm) => servicesAPI.create(data),
    onSuccess: () => {
      toast.success('Service created successfully');
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      setIsAdding(false);
      reset();
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ServiceForm> }) => servicesAPI.update(id, data),
    onSuccess: () => {
      toast.success('Service updated successfully');
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      setEditingId(null);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to update');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesAPI.delete(id),
    onSuccess: () => {
      toast.success('Service deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to delete');
    },
  });

  const onAddSubmit = (data: ServiceForm) => {
    createMutation.mutate(data);
  };

  const startEditing = (service: Service) => {
    setEditingId(service._id);
    setValue('name', service.name);
    setValue('description', service.description);
    setValue('icon', service.icon);
    setValue('isActive', service.isActive);
    setValue('isComingSoon', service.isComingSoon);
    setValue('position', service.position || 100);
  };

  const cancelEditing = () => {
    setEditingId(null);
    reset();
  };

  const saveEdit = handleSubmit((data) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    }
  });

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Manage Services</h1>
          <p className="text-[#8888aa]">Add, edit, or remove services offered on the platform.</p>
        </div>
        
        {!isAdding && !editingId && (
          <button 
            onClick={() => { setIsAdding(true); reset(); }}
            className="btn-primary flex items-center gap-2 glow-primary"
          >
            <FiPlus /> Add New Service
          </button>
        )}
      </div>

      {/* Add New Service Form */}
      {isAdding && (
        <div className="card mb-8 border-[#00D4AA]">
          <h2 className="text-lg font-semibold text-white mb-6">Create New Service</h2>
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#8888aa] mb-1">Service Name</label>
                <input {...register('name')} placeholder="e.g. Car Cleaning" className="input-field" />
                {errors.name && <p className="text-xs text-[#FF6B9D] mt-1">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#8888aa] mb-1">Emoji Icon</label>
                <input {...register('icon')} placeholder="e.g. 🚗" className="input-field !w-20 text-center" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-[#8888aa] mb-1">Description (Max 3 lines)</label>
                <textarea {...register('description')} rows={3} className="input-field resize-none block" />
                {errors.description && <p className="text-xs text-[#FF6B9D] mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex items-center gap-6 mt-2 pb-4 border-b border-[rgba(255,255,255,0.05)] md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer text-white">
                  <input type="checkbox" {...register('isActive')} className="w-5 h-5 accent-[#00D4AA]" />
                  Is Active
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#FF6B9D]">
                  <input type="checkbox" {...register('isComingSoon')} className="w-5 h-5 accent-[#FF6B9D]" />
                  Mark as &quot;Coming Soon&quot;
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); reset(); }}
                className="btn-secondary !py-2 text-sm"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary !py-2 text-sm flex items-center gap-2"
              >
                {isSubmitting ? 'Saving...' : <><FiSave /> Save Service</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {services?.map((service: Service) => {
            const isEditing = editingId === service._id;
            
            if (isEditing) {
              return (
                <div key={service._id} className="card ring-2 ring-[#00D4AA]">
                   <form onSubmit={saveEdit} className="space-y-4">
                     <div className="flex gap-2">
                       <input {...register('icon')} className="input-field !p-2 !w-14 text-center text-xl shrink-0" />
                       <input {...register('name')} className="input-field !p-2 flex-1 text-sm font-semibold min-w-0" />
                       <input type="number" {...register('position', { valueAsNumber: true })} title="Display Position" className="input-field !p-2 !w-14 text-center text-sm" />
                     </div>
                     <textarea {...register('description')} rows={3} className="input-field !p-2 resize-none block text-sm focus:ring-0" />
                     
                     <div className="flex items-center gap-4 text-xs font-medium bg-black/20 p-2 rounded-lg">
                        <label className="flex items-center gap-1.5 cursor-pointer text-white">
                          <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-[#00D4AA]" /> Active
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-[#FF6B9D]">
                          <input type="checkbox" {...register('isComingSoon')} className="w-4 h-4 accent-[#FF6B9D]" /> Coming Soon
                        </label>
                     </div>

                     <div className="flex gap-2 pt-2">
                       <button type="submit" className="flex-1 btn-primary !p-2 text-xs flex justify-center items-center gap-1 !rounded-lg">
                          <FiSave /> Save
                       </button>
                       <button type="button" onClick={cancelEditing} className="flex-1 btn-secondary !p-2 text-xs flex justify-center items-center gap-1 !rounded-lg border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500">
                          <FiX /> Cancel
                       </button>
                     </div>
                   </form>
                </div>
              );
            }

            return (
              <div key={service._id} className="card relative group flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                    <div className="text-3xl shrink-0">{service.icon}</div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#6C63FF] transition-colors truncate" title={service.name}>{service.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button 
                       onClick={() => startEditing(service)}
                       className="p-2 bg-[rgba(108,99,255,0.1)] text-[#6C63FF] hover:bg-[#6C63FF] hover:text-white rounded-lg transition-all"
                       title="Edit Service"
                    >
                      <FiEdit2 size={14} />
                    </button>
                    <button 
                       onClick={() => {
                         if (confirm('Are you sure you want to delete this service?')) {
                           deleteMutation.mutate(service._id);
                         }
                       }}
                       className="p-2 bg-[rgba(244,67,54,0.1)] text-[#F44336] hover:bg-[#F44336] hover:text-white rounded-lg transition-all"
                       title="Delete Service"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-[#8888aa] mb-auto line-clamp-3 leading-relaxed" title={service.description}>{service.description}</p>
                
                <div className="flex items-center gap-2 pt-4 mt-6 border-t border-[rgba(255,255,255,0.05)] shrink-0">
                  {service.isActive ? (
                    <span className="badge bg-[rgba(0,212,170,0.1)] text-[#00D4AA]">Active</span>
                  ) : (
                    <span className="badge bg-[rgba(255,255,255,0.1)] text-[#8888aa]">Inactive</span>
                  )}
                  
                  {service.isComingSoon && (
                    <span className="badge badge-coming-soon ml-auto">Coming Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
