'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import Link from 'next/link';

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d+$/, 'OTP must contain only numbers'),
});

type OtpForm = z.infer<typeof otpSchema>;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = sessionStorage.getItem('verifyEmail');
    if (!savedEmail) {
      toast.error('Session expired, please login again');
      router.push('/login');
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpForm) => {
    if (!email) return;
    
    setIsLoading(true);
    try {
      const res = await authAPI.verifyOTP({ email, otp: data.otp });
      const { accessToken, refreshToken, user } = res.data.data;
      
      const { useAuthStore } = await import('@/store/auth.store');
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);
      
      sessionStorage.removeItem('verifyEmail');
      toast.success('Email verified successfully!');
      
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient p-4">
      <div className="card w-full max-w-md glow-accent">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center">
              <span className="text-white font-bold text-lg">a</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Email</h1>
          <p className="text-[#8888aa]">Enter the 6-digit code sent to <br/><span className="text-white font-medium">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#8888aa] mb-2 text-center">OTP Code</label>
            <input
              {...register('otp')}
              type="text"
              maxLength={6}
              placeholder="123456"
              className="input-field text-center text-2xl tracking-[0.5em] font-mono"
            />
            {errors.otp && (
              <p className="mt-2 text-sm text-[#FF6B9D] text-center">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex justify-center items-center h-12 mt-6"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify & Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
