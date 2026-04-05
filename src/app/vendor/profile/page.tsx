'use client';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, servicesAPI } from '@/lib/services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiSave, FiMapPin, FiBriefcase, FiPhone, FiAlertCircle, FiUser, FiInfo } from 'react-icons/fi';
import LocationPicker from '@/components/location-picker';

const vendorProfileSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  phoneNumber: z.string().min(10, 'Mobile number must be 10 digits'),
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessAddress: z.string().min(1, 'Please select a location on the map'),
  businessMapAddress: z.string().optional(),
  businessManualAddress: z.string().min(5, 'Building/Flat/Shop details are required'),
  bio: z.string().max(300, 'Bio should not exceed 300 characters').optional(),
  providedServices: z.array(z.string()).min(1, 'Select at least one service'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type VendorProfileForm = z.infer<typeof vendorProfileSchema>;

interface Service {
  _id: string;
  name: string;
  icon: string;
}

export default function VendorProfilePage() {
  const { user, setAuth } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch full user details (me)
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data } = await usersAPI.getMe();
      return data.data;
    },
  });

  // Fetch all available services
  const { data: services = [], isLoading: isServicesLoading } = useQuery({
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
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VendorProfileForm>({
    resolver: zodResolver(vendorProfileSchema),
    defaultValues: {
      providedServices: [],
    },
  });

  // Set default values when profile is loaded
  const hasPopulated = watch('businessName') !== undefined;
  if (profile && !hasPopulated) {
    setValue('fullName', profile.fullName || '');
    setValue('phoneNumber', profile.phoneNumber || '');
    setValue('businessName', profile.businessName || '');
    setValue('businessAddress', profile.businessAddress || '');
    setValue('businessMapAddress', profile.businessMapAddress || '');
    setValue('businessManualAddress', profile.businessManualAddress || '');
    setValue('bio', profile.bio || '');
    
    // Map objects to IDs for selection
    const serviceIds = profile.providedServices?.map((s: any) => typeof s === 'string' ? s : s._id) || [];
    setValue('providedServices', serviceIds);
    
    // Set location if exists
    if (profile.businessLocation?.coordinates) {
      setValue('latitude', profile.businessLocation.coordinates[1]);
      setValue('longitude', profile.businessLocation.coordinates[0]);
    }
  }

  const updateProfileMutation = useMutation({
    mutationFn: (data: VendorProfileForm) => {
      // Format businessLocation for GeoJSON backend
      const formattedData = {
        ...data,
        businessLocation: {
          type: 'Point',
          coordinates: [data.longitude || 0, data.latitude || 0]
        }
      };
      return usersAPI.updateMe(formattedData);
    },
    onSuccess: (res) => {
      toast.success('Profile updated successfully! Admin will review your details.');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      // Update global store
      setAuth(res.data.data, localStorage.getItem('accessToken') || '', localStorage.getItem('refreshToken') || '');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: VendorProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const selectedServices = watch('providedServices') || [];

  const toggleService = (id: string) => {
    const current = [...selectedServices];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue('providedServices', current, { shouldValidate: true, shouldDirty: true });
  };

  const handleLocationSelect = (loc: { address: string; lat: number; lng: number }) => {
    setValue('businessMapAddress', loc.address, { shouldValidate: true, shouldDirty: true });
    setValue('latitude', loc.lat, { shouldDirty: true });
    setValue('longitude', loc.lng, { shouldDirty: true });
    
    // Auto-update combined address
    const manual = watch('businessManualAddress') || '';
    setValue('businessAddress', manual ? `${manual}, ${loc.address}` : loc.address, { shouldValidate: true, shouldDirty: true });
  };

  if (isProfileLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-black text-white mb-3 tracking-tight">Business Profile</h1>
        <p className="text-[#8888aa] text-base italic font-medium">Manage your professional credentials and operational scope.</p>
        <div className="w-24 h-1 bg-gradient-to-r from-[#6C63FF] to-[#00D4AA] mx-auto mt-6 rounded-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiUser className="text-[#6C63FF]" /> Personal & Business Info
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8888aa]">Full Name</label>
                  <input {...register('fullName')} className="input-field" placeholder="Owner full name" />
                  {errors.fullName && <p className="text-xs text-[#FF6B9D]">{errors.fullName.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#8888aa]">Mobile Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8888aa]" />
                    <input {...register('phoneNumber')} className="input-field !pl-11" placeholder="10-digit number" />
                  </div>
                  {errors.phoneNumber && <p className="text-xs text-[#FF6B9D]">{errors.phoneNumber.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-medium text-[#8888aa]">Business Name</label>
                  <input {...register('businessName')} className="input-field" placeholder="Your brand name" />
                  {errors.businessName && <p className="text-xs text-[#FF6B9D]">{errors.businessName.message}</p>}
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="text-sm font-medium text-[#8888aa] flex items-center gap-2">
                    <FiMapPin className="text-[#FF6B9D]" /> Business Location (Shop/Office)
                  </label>
                  
                  <LocationPicker 
                    onLocationSelect={handleLocationSelect}
                    defaultLat={watch('latitude')}
                    defaultLng={watch('longitude')}
                  />

                  <div className="mt-4 space-y-4">
                     <div className="p-3 bg-black/20 border border-white/5 rounded-xl">
                        <p className="text-[10px] uppercase text-[#666680] font-black tracking-widest mb-1 opacity-80 flex items-center gap-1.5"><FiMapPin className="text-[#00D4AA]" /> Map-Detected Area</p>
                        <p className="text-xs text-white leading-relaxed min-h-[1.5em]">{watch('businessMapAddress') || 'Search or select shop location on map...'}</p>
                     </div>

                     <div>
                        <label className="text-[10px] uppercase text-[#666680] font-black tracking-widest mb-1.5 block">Building / Shop No / Floor Details</label>
                        <textarea 
                          {...register('businessManualAddress')} 
                          rows={2} 
                          placeholder="e.g. Shop G-12, West Wing, Metro Mall..."
                          className="input-field resize-none text-xs"
                          onChange={(e) => {
                             const val = e.target.value;
                             setValue('businessManualAddress', val, { shouldDirty: true });
                             const mapAddr = watch('businessMapAddress') || '';
                             setValue('businessAddress', mapAddr ? `${val}, ${mapAddr}` : val, { shouldDirty: true });
                          }}
                        />
                        {errors.businessManualAddress && (
                          <p className="mt-1 text-sm text-[#FF6B9D]">{errors.businessManualAddress.message}</p>
                        )}
                     </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-2">
                   <label className="text-sm font-medium text-[#8888aa]">Bio / Summary</label>
                   <textarea {...register('bio')} rows={2} className="input-field resize-none" placeholder="Briefly describe your experience..." />
                </div>
              </div>
            </div>

            <div className="card space-y-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiBriefcase className="text-[#00D4AA]" /> Provided Services
              </h2>
              <p className="text-sm text-[#8888aa]">Select all services your team can handle professionaly.</p>
              
              {isServicesLoading ? (
                <div className="flex justify-center p-4">
                   <div className="w-6 h-6 border-2 border-[#00D4AA] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {services.map((service: Service) => {
                    const isSelected = selectedServices.includes(service._id);
                    return (
                      <div
                        key={service._id}
                        onClick={() => toggleService(service._id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col items-center gap-2 text-center ${
                          isSelected 
                            ? 'bg-[rgba(0,212,170,0.1)] border-[#00D4AA] text-white' 
                            : 'bg-black/20 border-white/5 text-[#8888aa] hover:border-white/20'
                        }`}
                      >
                        <span className="text-2xl">{service.icon}</span>
                        <span className="text-xs font-semibold">{service.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.providedServices && <p className="text-xs text-[#FF6B9D]">{errors.providedServices.message}</p>}
            </div>

            <div className="flex items-center justify-between">
               <p className="text-xs text-[#8888aa]">
                 {isDirty ? 'Changes not saved' : 'Last sync with server'}
               </p>
               <button
                 type="submit"
                 disabled={isSubmitting || !isDirty}
                 className="btn-primary flex items-center gap-2 h-12 !px-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
               >
                 {isSubmitting ? 'Saving...' : <><FiSave /> Update Profile</>}
               </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
           <div className="card border-[#FFB74D]/20">
              <h3 className="text-[#FFB74D] font-bold flex items-center gap-2 mb-4">
                 <FiAlertCircle /> Verification Status
              </h3>
              <div className="space-y-4">
                 <div className="flex flex-col gap-1">
                   <span className="text-[10px] uppercase text-[#8888aa] tracking-widest font-bold">Status</span>
                   <span className={`text-sm font-black ${
                     profile?.businessStatus === 'APPROVED' ? 'text-[#00D4AA]' :
                     profile?.businessStatus === 'REJECTED' ? 'text-[#F44336]' :
                     'text-[#FFB74D]'
                   }`}>
                     {profile?.businessStatus || 'PENDING'}
                   </span>
                 </div>
                 
                 {profile?.adminComments && (
                   <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-[10px] uppercase text-[#8888aa] tracking-widest font-bold block mb-1">Admin Feedback</span>
                      <p className="text-xs text-white/90 leading-relaxed italic">&quot;{profile?.adminComments}&quot;</p>
                   </div>
                 )}

                 <p className="text-xs text-[#8888aa] leading-relaxed">
                   {profile?.businessStatus === 'APPROVED' 
                     ? 'Your business is live! You can now accept incoming service requests.' 
                     : 'Complete your profile to submit for admin review. Verification usually takes 24-48 hours.'}
                 </p>
              </div>
           </div>

           <div className="card bg-gradient-to-br from-[#6C63FF]/10 to-transparent border-[#6C63FF]/20">
              <h3 className="text-white font-bold mb-3">Quick Guide</h3>
              <ul className="text-xs text-[#8888aa] space-y-3 list-disc pl-4">
                <li>Double check your mobile number for client contact.</li>
                <li>Accurate address helps in matching local requests.</li>
                <li>Choosing active services increases your job visibility.</li>
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
