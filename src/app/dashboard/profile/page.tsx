'use client';

import { useEffect } from 'react';

import { useAuthStore } from '@/store/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '@/lib/services';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FiSave, FiMapPin, FiPhone, FiUser, FiMail, FiCalendar } from 'react-icons/fi';
import LocationPicker from '@/components/location-picker';

const userProfileSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  phoneNumber: z.string().min(10, 'Mobile number must be 10 digits').optional().or(z.literal('')),
  businessAddress: z.string().optional().or(z.literal('')),
  businessMapAddress: z.string().optional().or(z.literal('')),
  businessManualAddress: z.string().optional().or(z.literal('')),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type UserProfileForm = z.infer<typeof userProfileSchema>;

export default function UserProfilePage() {
  const { user, setAuth, accessToken, refreshToken } = useAuthStore();
  const queryClient = useQueryClient();

  // Fetch full user details (me)
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: async () => {
      const { data } = await usersAPI.getMe();
      return data.data;
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
  });

  // Populate form when data is fetched
  useEffect(() => {
    if (profile) {
      reset({
        fullName: profile.fullName || '',
        phoneNumber: profile.phoneNumber || '',
        businessAddress: profile.businessAddress || '',
        businessMapAddress: profile.businessMapAddress || '',
        businessManualAddress: profile.businessManualAddress || '',
        latitude: profile.businessLocation?.coordinates?.[1],
        longitude: profile.businessLocation?.coordinates?.[0],
      });
    }
  }, [profile, reset]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: UserProfileForm) => {
      // Format location for GeoJSON backend
      const formattedData = {
        ...data,
        businessLocation: data.latitude && data.longitude ? {
          type: 'Point',
          coordinates: [data.longitude, data.latitude]
        } : undefined
      };
      return usersAPI.updateMe(formattedData);
    },
    onSuccess: (res) => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['my-profile'] });
      // Update global store
      setAuth(res.data.data, accessToken || '', refreshToken || '');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    },
  });

  const onSubmit = (data: UserProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleLocationSelect = (loc: { address: string; lat: number; lng: number }) => {
    setValue('businessMapAddress', loc.address, { shouldValidate: true, shouldDirty: true });
    setValue('latitude', loc.lat, { shouldDirty: true });
    setValue('longitude', loc.lng, { shouldDirty: true });

    // Auto-update combined address
    const manual = watch('businessManualAddress') || '';
    setValue('businessAddress', manual ? `${manual}, ${loc.address}` : loc.address, { shouldValidate: true, shouldDirty: true });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <div className="w-10 h-10 border-4 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-3xl text-emphasized text-[var(--foreground)] mb-2 tracking-tight">Profile Settings</h1>
        <p className="text-[var(--text-muted)] text-sm font-medium italic">Manage your personal identity and default deployment coordinates.</p>
        <div className="w-20 h-1 bg-gradient-to-r from-[#6C63FF] to-[#FF6B9D] mt-6 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card text-center !p-8 border-[#6C63FF]/20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center text-[var(--foreground)] text-4xl text-emphasized mx-auto mb-6 shadow-xl shadow-[var(--primary)]/20">
              {profile?.email?.charAt(0).toUpperCase()}
            </div>
            <h3 className="text-[var(--foreground)] text-emphasized text-xl uppercase tracking-tight">{profile?.fullName || 'Identity Pending'}</h3>
            <p className="text-xs text-[var(--text-muted)] font-mono tracking-widest mt-1 opacity-60">{profile?.email}</p>

            <div className="mt-8 pt-8 border-t border-[var(--border)] space-y-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-soft-dark border border-[var(--border)] flex items-center justify-center text-[var(--primary)]">
                  <FiMail size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest">Email Vector</p>
                  <p className="text-[11px] text-[var(--foreground)] font-medium">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-left">
                <div className="w-8 h-8 rounded-lg bg-soft-dark border border-[var(--border)] flex items-center justify-center text-[var(--accent)]">
                  <FiCalendar size={14} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest">Registry Date</p>
                  <p className="text-[11px] text-[var(--foreground)] font-medium">
                    {new Date(profile?.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-[#6C63FF]/5 to-transparent border-[#6C63FF]/10">
            <h3 className="text-[var(--foreground)] font-bold mb-3 flex items-center gap-2 italic text-sm"><FiSave className="text-[var(--primary)]" /> Strategy</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Keeping your profile and coordinates updated ensures faster dispatching and accurate mission routing.
            </p>
          </div>
        </div>

        {/* Main Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="card space-y-8">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <FiUser className="text-[var(--primary)]" /> Identity Matrix
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-emphasized text-[var(--placeholder)] uppercase tracking-widest">Full Name Signature</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/60" />
                      <input
                        {...register('fullName')}
                        className="input-field !pl-11"
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-[var(--secondary)]">{errors.fullName.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-emphasized text-[var(--placeholder)] uppercase tracking-widest">Primary Contact (Mobile)</label>
                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--accent)]/60" />
                      <input
                        {...register('phoneNumber')}
                        className="input-field !pl-11"
                        placeholder="10-digit number"
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-xs text-[var(--secondary)]">{errors.phoneNumber.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-[var(--border)]">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <FiMapPin className="text-[var(--secondary)]" /> Deployment Coordinates
                </h2>

                <div className="space-y-4">
                  <div className="border border-[var(--border)] rounded-3xl overflow-hidden shadow-2xl">
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      defaultLat={watch('latitude')}
                      defaultLng={watch('longitude')}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-soft-dark border border-[var(--border)] rounded-2xl">
                      <p className="text-[9px] uppercase text-[var(--placeholder)] text-emphasized tracking-widest mb-1.5 opacity-80 flex items-center gap-1.5">
                        <FiMapPin className="text-[var(--accent)]" /> Map-Detected Coordinate
                      </p>
                      <p className="text-xs text-[var(--foreground)] leading-relaxed italic">{watch('businessMapAddress') || 'No location locked...'}</p>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase text-[var(--placeholder)] text-emphasized tracking-widest mb-2 block">Building / Suite / Zone Details</label>
                      <textarea
                        {...register('businessManualAddress')}
                        rows={2}
                        placeholder="e.g. Flat 301, Emerald Heights..."
                        className="input-field resize-none text-xs"
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue('businessManualAddress', val, { shouldDirty: true });
                          const mapAddr = watch('businessMapAddress') || '';
                          setValue('businessAddress', mapAddr ? `${val}, ${mapAddr}` : val, { shouldDirty: true });
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border)]">
                <p className="text-[10px] text-[var(--placeholder)] text-emphasized uppercase tracking-widest italic">
                  {isDirty ? 'Unsaved signal detected' : 'Identity synchronized'}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="bg-[var(--primary)] !text-white px-8 h-12 rounded-2xl text-emphasized text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--primary)]/30 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><FiSave size={16} /> Sync Profile</>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
