'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const res = await authAPI.login(data);
      const { accessToken, refreshToken, user } = res.data.data;
      
      // Need to use the store but avoid hydration mismatch by requiring it dynamically or using simple window access
      // However we already have useAuthStore since it's a client component
      const { useAuthStore } = await import('@/store/auth.store');
      useAuthStore.getState().setAuth(user, accessToken, refreshToken);
      
      toast.success('Login successful');
      
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'VENDOR') {
        router.push('/vendor');
      } else {
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; requiresVerification?: boolean } } };
      if (err.response?.data?.requiresVerification) {
        toast.error('Email not verified. OTP sent to your email.');
        // store email for OTP page
        sessionStorage.setItem('verifyEmail', data.email);
        router.push('/verify-otp');
      } else {
        toast.error(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient p-4">
      <div className="card w-full max-w-md glow-primary">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center">
              <span className="text-white font-bold text-lg">a</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[#8888aa]">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#8888aa] mb-2">Email</label>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input-field"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-[#FF6B9D]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#8888aa] mb-2">Password</label>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="input-field"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-[#FF6B9D]">{errors.password.message}</p>
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
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#8888aa] mt-6">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-[#6C63FF] hover:text-[#8B83FF] font-medium transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
