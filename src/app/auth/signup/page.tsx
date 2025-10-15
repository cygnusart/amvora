'use client';

import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, Sparkles, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .refine(email => email.endsWith('@gmail.com') || email.endsWith('@yahoo.com') || email.endsWith('@outlook.com'), {
      message: 'Please use Gmail, Yahoo, or Outlook email'
    }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and numbers'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;
      
      if (authData.user) {
        router.push('/auth/login?message=check-email');
      }
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-teal-400 rounded-full opacity-60 animate-float">
          <div className="w-full h-full bg-teal-400 rounded-full animate-ping"></div>
        </div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full opacity-40 animate-float delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-violet-400 rounded-full opacity-50 animate-float delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-teal-300 rounded-full opacity-30 animate-float delay-1500"></div>
        
        {/* Animated Gradients */}
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Main Card */}
      <motion.div 
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="glass-amethyst p-8 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl">
          {/* Header with Animated Icon */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-teal-500 rounded-2xl mb-4 shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Zap className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-teal-200 bg-clip-text text-transparent">
              Join Amvora
            </h1>
            <p className="text-purple-200/80">Where focus meets intelligence</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <label className="flex items-center text-white/90 text-sm font-medium">
                <Mail className="w-4 h-4 mr-2" />
                Email Address
              </label>
              <div className="relative">
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/30 transition-all duration-300"
                  placeholder="your@email.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300/60" />
              </div>
              <AnimatePresence>
                {errors.email && (
                  <motion.p 
                    className="text-red-400/90 text-sm flex items-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                    {errors.email.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="flex items-center text-white/90 text-sm font-medium">
                <Lock className="w-4 h-4 mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/30 transition-all duration-300"
                  placeholder="Create secure password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300/60 hover:text-teal-300 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.password && (
                  <motion.p 
                    className="text-red-400/90 text-sm flex items-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                    {errors.password.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Confirm Password Field */}
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="flex items-center text-white/90 text-sm font-medium">
                <Lock className="w-4 h-4 mr-2" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? "text" : "password"}
                  className="w-full px-4 py-3 pl-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/30 transition-all duration-300"
                  placeholder="Confirm your password"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-300/60" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300/60 hover:text-teal-300 transition"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <AnimatePresence>
                {errors.confirmPassword && (
                  <motion.p 
                    className="text-red-400/90 text-sm flex items-center"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-purple-700 hover:to-teal-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating Your Space...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Begin Intelligent Journey
                  </div>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div 
            className="flex items-center my-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-purple-200/60 text-sm">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </motion.div>

          {/* Login Link */}
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-purple-200/80">
              Already have an account?{' '}
              <motion.a 
                href="/auth/login" 
                className="text-teal-300 hover:text-teal-200 font-semibold transition-colors duration-200 relative group"
                whileHover={{ scale: 1.05 }}
              >
                Sign in here
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-300 group-hover:w-full transition-all duration-300"></span>
              </motion.a>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}