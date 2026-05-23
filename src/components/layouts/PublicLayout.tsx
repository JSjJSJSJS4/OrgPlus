import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../common/Logo'
import { LogOut, User, Menu, X, ArrowLeft } from 'lucide-react'

interface PublicLayoutProps {
  children: React.ReactNode
  currentTab: string
  setCurrentTab: (tab: string) => void
  isAdminPreview?: boolean
  onExitPreview?: () => void
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ 
  children, 
  currentTab, 
  setCurrentTab, 
  isAdminPreview = false,
  onExitPreview
}) => {
  const { user, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (!user) return null

  // Determine navigation items based on user role
  const navItems: { id: string; label: string }[] = [
    { id: 'home', label: 'Home' }
  ]

  if (user.role === 'applicant') {
    navItems.push({ id: 'recruitment', label: 'Apply to Join' })
    navItems.push({ id: 'onboarding', label: 'Onboarding Checklist' })
  } else if (user.role === 'member') {
    navItems.push({ id: 'member-dashboard', label: 'Member Portal' })
    navItems.push({ id: 'onboarding', label: 'Onboarding History' })
  } else if (isAdminPreview) {
    // For admins previewing the portal, let them access member pages to test
    navItems.push({ id: 'member-dashboard', label: 'Member Portal Preview' })
    navItems.push({ id: 'recruitment', label: 'Apply Portal Preview' })
    navItems.push({ id: 'onboarding', label: 'Onboarding Preview' })
  }

  navItems.push({ id: 'profile', label: 'My Profile' })

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId)
    setMobileMenuOpen(false)
    setDropdownOpen(false)
  }

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-red-500/30 text-red-400 bg-red-950/40">Super Admin</span>
      case 'officer':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-blue-500/30 text-blue-400 bg-blue-950/40">Officer</span>
      case 'committee_member':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-teal-500/30 text-teal-400 bg-teal-950/40">Committee</span>
      case 'member':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-emerald-500/30 text-emerald-400 bg-emerald-950/40">Member</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase border border-amber-500/30 text-amber-400 bg-amber-950/40">Applicant</span>
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col relative">
      {/* Background Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-10 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none z-0"></div>

      {/* ADMIN PREVIEW NOTIFICATION BANNER */}
      {isAdminPreview && (
        <div className="bg-purple-950/80 border-b border-purple-500/20 px-6 py-2 flex items-center justify-between text-xs text-purple-300 relative z-40">
          <span className="font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping"></span>
            Viewing Public Site in Admin Preview Mode
          </span>
          <button 
            onClick={onExitPreview}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Console
          </button>
        </div>
      )}

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#0b0f19]/60 border-b border-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo Brand */}
          <div className="cursor-pointer" onClick={() => handleNavClick('home')}>
            <Logo iconSize="w-8 h-8" textSize="text-lg" />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map(item => {
              const active = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                    active 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* User Account Controls */}
          <div className="hidden md:flex items-center gap-4 relative">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 leading-tight">Signed in as</p>
              <p className="text-xs font-bold text-slate-300 leading-tight mt-0.5">{user.full_name}</p>
            </div>
            
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden flex items-center justify-center cursor-pointer shrink-0"
            >
              <img 
                src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.full_name}`} 
                alt={user.full_name} 
                className="w-full h-full object-cover"
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl glass-panel border border-slate-800/80 p-4 shadow-2xl z-50 text-left animate-in fade-in slide-in-from-top-2">
                <div className="pb-3 border-b border-slate-900/60">
                  <p className="text-xs font-bold text-white truncate leading-tight">{user.full_name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 truncate leading-none">{user.email}</p>
                  <div className="mt-2.5">{renderRoleBadge(user.role)}</div>
                </div>

                <div className="pt-2.5 space-y-1">
                  <button 
                    onClick={() => handleNavClick('profile')}
                    className="w-full flex items-center gap-2 px-2 py-2 hover:bg-slate-900/60 rounded-lg text-xs text-slate-300 hover:text-white transition-all cursor-pointer text-left font-semibold"
                  >
                    <User className="w-4 h-4 text-purple-400" /> My Profile settings
                  </button>
                  
                  <button 
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-2 py-2 hover:bg-rose-950/20 rounded-lg text-xs text-rose-400 hover:text-rose-350 transition-all cursor-pointer text-left font-semibold border border-transparent hover:border-rose-900/30"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Triggers */}
          <div className="md:hidden flex items-center gap-3">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center shrink-0"
            >
              <img 
                src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.full_name}`} 
                alt={user.full_name} 
                className="w-full h-full object-cover"
              />
            </button>
            
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900/50 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Options */}
        {dropdownOpen && (
          <div className="md:hidden absolute right-4 top-14 w-48 rounded-xl glass-panel border border-slate-800 p-3 shadow-xl z-50 text-left">
            <div className="pb-2 border-b border-slate-900/60">
              <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
              <div className="mt-1">{renderRoleBadge(user.role)}</div>
            </div>
            <div className="pt-2 space-y-1">
              <button 
                onClick={signOut}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-rose-400 cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-slate-900 px-6 py-4 space-y-2 animate-in slide-in-from-top duration-200">
            {navItems.map(item => {
              const active = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-xs font-bold rounded-xl text-left transition-all ${
                    active 
                      ? 'bg-purple-600/10 text-purple-400 border border-purple-500/20' 
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </div>
        )}
      </header>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="py-6 border-t border-slate-900/40 text-center text-[10px] text-slate-600">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; {new Date().getFullYear()} OrgPlus. All Rights Reserved.</span>
          <span className="text-slate-500">Connecting Campus Leadership</span>
        </div>
      </footer>
    </div>
  )
}
