import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { LogIn, UserPlus, Key, Info, Shield, Users } from 'lucide-react'
import { Logo } from '../../components/common/Logo'

export const AuthPage: React.FC = () => {
  const { signIn, signUp, isMockMode } = useAuth()
  const { showToast } = useToast()

  const [isLogin, setIsLogin] = useState<boolean>(true)
  const [email, setEmail] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')
  const [role, setRole] = useState<'applicant' | 'member' | 'officer' | 'super_admin'>('applicant')
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      showToast('Error', 'Please enter your email', 'error')
      return
    }

    setLoading(true)
    if (isLogin) {
      const res = await signIn(email)
      if (res.success) {
        showToast('Success', 'Logged in successfully!', 'success')
      } else {
        showToast('Authentication Failed', res.error || 'Failed to sign in', 'error')
      }
    } else {
      if (!fullName) {
        showToast('Error', 'Please enter your full name', 'error')
        setLoading(false)
        return
      }
      const res = await signUp(email, fullName, role)
      if (res.success) {
        showToast('Success', 'Account created! Welcome to OrgPlus.', 'success')
      } else {
        showToast('Sign Up Failed', res.error || 'Failed to create account', 'error')
      }
    }
    setLoading(false)
  }

  // Developer Quick Login handler
  const handleQuickLogin = async (mockEmail: string) => {
    setLoading(true)
    const res = await signIn(mockEmail)
    if (res.success) {
      showToast('Success', `Logged in as ${mockEmail}!`, 'success')
    } else {
      showToast('Error', res.error || 'Failed to quick login', 'error')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0b0f19] px-4 overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-600/10 rounded-full blur-[80px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] animate-pulse-slow"></div>

      <div className="w-full max-w-5xl grid md:grid-cols-12 gap-8 relative z-10 my-8">
        
        {/* Left Side: System Info Banner */}
        <div className="md:col-span-5 flex flex-col justify-between p-8 rounded-3xl glass-panel bg-gradient-premium relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          
          <div className="relative">
            {/* Logo */}
            <Logo iconSize="w-9 h-9" textSize="text-xl" lightText={true} />
            
            <h2 className="text-3xl font-extrabold text-white mt-12 leading-tight">
              Empower Your <br />
              <span className="text-gradient font-black">School Organization</span>
            </h2>
            
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Automated recruitment pipeline, applicant screening pipelines, role-based onboarding checklists, and premium event scheduling.
            </p>
          </div>

          <div className="mt-8 space-y-4 relative">
            <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <Shield className="w-5 h-5 text-purple-400 shrink-0" />
              <span className="text-xs text-slate-300">Secure role-based RLS workflows</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
              <Users className="w-5 h-5 text-blue-400 shrink-0" />
              <span className="text-xs text-slate-300">Recruitment pipelines & onboarding</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <div className="p-8 md:p-10 rounded-3xl glass-panel shadow-2xl">
            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {isLogin ? 'Log in to manage your school organization' : 'Register to submit applications'}
                </p>
              </div>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
              >
                {isLogin ? 'Need an account?' : 'Already registered?'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.edu"
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Initial Target Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  >
                    <option value="applicant">Applicant (Standard)</option>
                    <option value="member">General Member (Seeded)</option>
                    <option value="officer">Organization Officer (Staff)</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-white bg-gradient-button flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> Register Profile
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Panel */}
            <div className="mt-8 border-t border-slate-800/80 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Developer Console {isMockMode ? '(Sandbox Mode Active)' : '(Supabase Connected)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Click any role below to automatically log in and simulate permission flows. No password required.
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickLogin('admin@eventplan.org')}
                  className="px-3 py-2 rounded-lg bg-slate-900/50 border border-purple-500/20 hover:border-purple-500/50 text-[11px] text-purple-300 font-semibold transition-all text-left flex flex-col justify-between"
                >
                  <span>Super Admin</span>
                  <span className="text-[9px] text-slate-500 font-normal">Full control</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('officer@eventplan.org')}
                  className="px-3 py-2 rounded-lg bg-slate-900/50 border border-blue-500/20 hover:border-blue-500/50 text-[11px] text-blue-300 font-semibold transition-all text-left flex flex-col justify-between"
                >
                  <span>Officer</span>
                  <span className="text-[9px] text-slate-500 font-normal">Approver / Reviewer</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('committee@eventplan.org')}
                  className="px-3 py-2 rounded-lg bg-slate-900/50 border border-teal-500/20 hover:border-teal-500/50 text-[11px] text-teal-300 font-semibold transition-all text-left flex flex-col justify-between"
                >
                  <span>Committee</span>
                  <span className="text-[9px] text-slate-500 font-normal">Event Coordinator</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('member@eventplan.org')}
                  className="px-3 py-2 rounded-lg bg-slate-900/50 border border-emerald-500/20 hover:border-emerald-500/50 text-[11px] text-emerald-300 font-semibold transition-all text-left flex flex-col justify-between"
                >
                  <span>Member</span>
                  <span className="text-[9px] text-slate-500 font-normal">Attend events</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('applicant@eventplan.org')}
                  className="px-3 py-2 rounded-lg bg-slate-900/50 border border-amber-500/20 hover:border-amber-500/50 text-[11px] text-amber-300 font-semibold transition-all text-left flex flex-col justify-between"
                >
                  <span>Applicant</span>
                  <span className="text-[9px] text-slate-500 font-normal">Recruitment pipeline</span>
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
