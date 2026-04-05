'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { servicesAPI, requestsAPI } from '@/lib/services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiMapPin, FiInfo } from 'react-icons/fi';
import LocationPicker from '@/components/location-picker';

const requestSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  address: z.string().min(1, 'Please select a location on the map'),
  mapAddress: z.string().optional(),
  manualAddress: z.string().min(5, 'Building/Flat/Road details are required'),
  description: z.string().min(10, 'Please provide more details (min 10 chars)'),
  preferredTime: z.string().min(1, 'Please select a preferred date and time'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type RequestForm = z.infer<typeof requestSchema>;

interface Service {
  _id: string;
  name: string;
  description: string;
  icon: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Fetch only active services
  const { data: servicesRes, isLoading: isServicesLoading } = useQuery({
    queryKey: ['active-services'],
    queryFn: async () => {
      const { data } = await servicesAPI.getActive();
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
  });

  const createRequestMutation = useMutation({
    mutationFn: (data: RequestForm) => requestsAPI.create(data),
    onSuccess: () => {
      toast.success('Service request created successfully!');
      reset();
      setSelectedService(null);
      router.push('/dashboard/history');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to create request');
    },
  });

  const onSubmit = (data: RequestForm) => {
    createRequestMutation.mutate(data);
  };

  const handleLocationSelect = (loc: { address: string; lat: number; lng: number }) => {
    setValue('mapAddress', loc.address, { shouldValidate: true });
    setValue('latitude', loc.lat);
    setValue('longitude', loc.lng);
    // Auto-update combined address
    const manual = watch('manualAddress') || '';
    setValue('address', manual ? `${manual}, ${loc.address}` : loc.address, { shouldValidate: true });
  };

  const services = servicesRes || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Raise a Service Request</h1>
        <p className="text-[#8888aa]">Select a service and provide details to book an appointment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Service Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white mb-4">1. Select Service</h2>
          
          {isServicesLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((service: Service) => (
                <div
                  key={service._id}
                  onClick={() => {
                    setSelectedService(service);
                    setValue('serviceId', service._id, { shouldValidate: true });
                  }}
                  className={`card !p-4 cursor-pointer transition-all relative overflow-hidden group flex flex-col items-center text-center ${
                    selectedService?._id === service._id
                      ? 'border-[#6C63FF] bg-[rgba(108,99,255,0.15)] ring-2 ring-[#6C63FF] shadow-[0_0_20px_rgba(108,99,255,0.3)] scale-[1.02]'
                      : 'hover:border-[rgba(108,99,255,0.3)]'
                  }`}
                >
                  {selectedService?._id === service._id && (
                    <div className="absolute top-2 right-2 text-[#6C63FF]">
                      <FiCheckCircle size={20} className="fill-[rgba(108,99,255,0.2)]" />
                    </div>
                  )}
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="font-semibold text-white group-hover:text-[#6C63FF] transition-colors">{service.name}</h3>
                </div>
              ))}
            </div>
          )}
          {errors.serviceId && (
            <p className="text-sm text-[#FF6B9D] mt-2">{errors.serviceId.message}</p>
          )}
        </div>

        {/* Request Details Form */}
        <div className="card h-fit">
          <h2 className="text-lg font-semibold text-white mb-6">2. Appointment Details</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#8888aa] mb-3 flex items-center gap-2">
                <FiMapPin className="text-[#6C63FF]" /> Service Location
              </label>
              
              <LocationPicker 
                onLocationSelect={handleLocationSelect} 
                defaultLat={watch('latitude')}
                defaultLng={watch('longitude')}
              />

              <div className="mt-4 space-y-4">
                 <div className="p-3 bg-black/20 border border-white/5 rounded-xl">
                    <p className="text-[10px] uppercase text-[#666680] font-black tracking-widest mb-1 opacity-80 flex items-center gap-1.5"><FiMapPin className="text-[#00D4AA]" /> Map-Detected Area</p>
                    <p className="text-xs text-white leading-relaxed min-h-[1.5em]">{watch('mapAddress') || 'Select location on map above...'}</p>
                 </div>

                 <div>
                    <label className="text-[10px] uppercase text-[#666680] font-black tracking-widest mb-1.5 block">Building / Flat / Road Details</label>
                    <textarea 
                      {...register('manualAddress')} 
                      rows={2} 
                      placeholder="e.g. Flat 402, Sunshine Apartment, MG Road..."
                      className="input-field resize-none text-xs"
                      onChange={(e) => {
                         const val = e.target.value;
                         setValue('manualAddress', val);
                         const mapAddr = watch('mapAddress') || '';
                         setValue('address', mapAddr ? `${val}, ${mapAddr}` : val);
                      }}
                    />
                    {errors.manualAddress && (
                      <p className="mt-1 text-sm text-[#FF6B9D]">{errors.manualAddress.message}</p>
                    )}
                 </div>
              </div>
              
              {errors.address && (
                <p className="mt-1 text-sm text-[#FF6B9D]">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8888aa] mb-2">Issue Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Describe the issue you are facing..."
                className="input-field resize-none block"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-[#FF6B9D]">{errors.description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#8888aa] mb-2">Preferred Date & Time</label>
              {/* Note: Using datetime-local ensures ISO format matching */}
              <input
                {...register('preferredTime')}
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                className="input-field block w-full [color-scheme:dark]"
              />
              {errors.preferredTime && (
                <p className="mt-1 text-sm text-[#FF6B9D]">{errors.preferredTime.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedService}
              className="btn-primary w-full flex justify-center items-center h-12 mt-4"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Book Appointment'
              )}
            </button>
            {!selectedService && (
             <p className="text-xs text-center text-[#8888aa] mt-2">Please select a service first</p> 
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
