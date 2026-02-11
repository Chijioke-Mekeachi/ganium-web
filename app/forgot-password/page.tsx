'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle, FiShield, FiAlertCircle, FiLoader, FiKey } from 'react-icons/fi';
import { getErrorMessage } from '@/lib/errors';

const emailSchema = z.object({
  email: z.string()
    .email({ message: 'Please enter a valid email address' })
    .min(1, { message: 'Email is required' }),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
  });

  const email = watch('email', '');

  const onSubmit = async (data: EmailFormData) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      setEmailSent(data.email);
      
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: unknown) {
      const message = getErrorMessage(err);
      console.error('Password reset error:', err);

      if (message.includes('rate limit')) {
        setError('Too many attempts. Please try again in a few minutes.');
      } else if (message.includes('user not found')) {
        setError('No account found with this email address.');
      } else {
        setError(message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => router.push('/')}
          className="flex items-center text-sm text-gray-600 hover:text-blue-600 mb-8 transition-colors group"
        >
          <FiArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="text-center mb-10 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-600/10 blur-3xl -z-10 rounded-full" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl shadow-lg shadow-blue-500/30 mb-6 relative">
            <FiKey className="w-10 h-10 text-white" />
            <div className="absolute inset-0 border-2 border-blue-400/30 rounded-3xl animate-ping" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Reset Password</h1>
          <p className="text-gray-600">
            We&apos;ll send you a secure reset link
          </p>
        </div>

        {success && (
          <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-6 animate-fade-in">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 text-lg mb-2">Reset Link Sent!</h3>
                <p className="text-green-700 text-sm mb-3">
                  We&apos;ve sent a password reset link to <span className="font-semibold">{emailSent}</span>. 
                  Please check your email inbox.
                </p>
                <div className="text-xs text-green-600/80">
                  <p className="mb-1">• The link will expire in 24 hours</p>
                  <p className="mb-1">• Check your spam folder if you don&apos;t see it</p>
                  <p>• Make sure to use the link within the same browser</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FiKey className="w-5 h-5 mr-2 text-blue-600" />
                Recover Account
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Enter your email address and we&apos;ll send you a secure link to reset your password. 
                The link is encrypted and will expire automatically for your security.
              </p>
            </div>

            {error && !success && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200 p-4">
                <div className="flex items-start space-x-3">
                  <FiAlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">Reset Failed</p>
                    <p className="text-xs text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
                  <FiMail className="w-4 h-4 mr-2 text-blue-600" />
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    {...register('email')}
                    type="email"
                    className={`w-full px-4 py-3 pl-11 bg-gray-50 border ${
                      errors.email 
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 group-hover:border-blue-300`}
                    placeholder="you@example.com"
                    disabled={loading || success}
                  />
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                  
                  {email && !errors.email && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <FiCheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-4">
                <div className="flex items-start space-x-3">
                  <FiShield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Security Information</p>
                    <ul className="text-xs text-blue-700/80 space-y-1">
                      <li className="flex items-start">
                        <span className="inline-block w-1 h-1 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        Reset links are encrypted and expire in 24 hours
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1 h-1 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        All communications are end-to-end encrypted
                      </li>
                      <li className="flex items-start">
                        <span className="inline-block w-1 h-1 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        No passwords are transmitted in plain text
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success || !isValid}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-medium py-3 px-6 rounded-xl hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative flex items-center justify-center">
                  {loading ? (
                    <>
                      <FiLoader className="w-5 h-5 mr-3 animate-spin" />
                      Sending Link...
                    </>
                  ) : success ? (
                    <>
                      <FiCheckCircle className="w-5 h-5 mr-3" />
                      Link Sent ✓
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5 mr-3 group-hover:translate-x-1 transition-transform" />
                      Send Reset Link
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Don&apos;t see the email?</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Check your spam or junk folder</p>
                  <p>• Make sure you entered the correct email address</p>
                  <p>• Wait a few minutes and try again</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100/50 to-blue-200/50 rounded-full border border-blue-200/50">
            <FiShield className="w-4 h-4 text-blue-600 mr-2" />
            <span className="text-xs font-medium text-blue-700">
              All communications are end-to-end encrypted
            </span>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
