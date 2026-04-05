'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/services';
import Link from 'next/link';

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      await authAPI.signup({ email: data.email, password: data.password });
      toast.success('Account created! OTP sent to your email.');
      sessionStorage.setItem('verifyEmail', data.email);
      router.push('/verify-otp');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient p-4">
      <div className="card w-full max-w-md glow-secondary">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#FF6B9D] flex items-center justify-center">
              <span className="text-white font-bold text-lg">a</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-[#8888aa]">Join allWays today</p>
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

          <div>
            <label className="block text-sm font-medium text-[#8888aa] mb-2">Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              placeholder="••••••••"
              className="input-field"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-[#FF6B9D]">{errors.confirmPassword.message}</p>
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
              'Sign Up'
            )}
          </button>
        </form>

        <p className="text-center text-sm text-[#8888aa] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#6C63FF] hover:text-[#8B83FF] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
