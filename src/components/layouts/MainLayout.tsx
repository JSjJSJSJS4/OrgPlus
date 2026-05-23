import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Logo } from '../common/Logo'
import { 
  LogOut, 
  Menu, 
  X, 
  Compass, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  CheckSquare, 
  FolderLock, 
  TrendingUp,
  User
} from 'lucide-react'

interface MainLayoutProps {
  children: React.ReactNode
  currentTab: string
  setCurrentTab: (tab: string) => void
  onEnterPreview?: () => void
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentTab, setCurrentTab, onEnterPreview }) => {
  const { user, signOut, isMockMode } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  // Define sidebar navigation items based on user roles
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, roles: ['super_admin', 'officer', 'committee_member', 'member', 'applicant'] },
    { id: 'recruitment', label: 'Recruitment Campaigns', icon: Users, roles: ['super_admin', 'officer', 'committee_member', 'member', 'applicant'] },
    { id: 'screening', label: 'Applicants Screening', icon: FolderLock, roles: ['super_admin', 'officer'] },
    { id: 'onboarding', label: 'Onboarding Checklist', icon: CheckSquare, roles: ['super_admin', 'officer', 'applicant'] },
    { id: 'events', label: 'Events Schedule', icon: Calendar, roles: ['super_admin', 'officer', 'committee_member', 'member'] },
    { id: 'proposals', label: 'Review Proposals', icon: FileText, roles: ['super_admin', 'officer'] },
    { id: 'profile', label: 'My Profile', icon: User, roles: ['super_admin', 'officer', 'committee_member', 'member', 'applicant'] }
  ]

  const visibleItems = navigationItems.filter(item => item.roles.includes(user.role))

  // Render role badges with HSL Tailored Colors
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200 text-red-700 bg-red-50">Super Admin</span>
      case 'officer':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200 text-blue-700 bg-blue-50">Officer</span>
      case 'committee_member':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-teal-200 text-teal-700 bg-teal-50">Committee</span>
      case 'member':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 text-emerald-700 bg-emerald-50">Member</span>
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border border-amber-200 text-amber-700 bg-amber-50">Applicant</span>
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row relative">
      
      {/* Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#be185d]/3 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-blue-600/3 rounded-full blur-[150px] pointer-events-none"></div>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-slate-200 z-30">
        <Logo iconSize="w-7 h-7" textSize="text-base" lightText={false} />
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-650 hover:text-slate-950 bg-slate-100 border border-slate-200"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-slate-200/80 p-6 flex flex-col justify-between
        transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          {/* Logo Section */}
          <Logo iconSize="w-8 h-8" textSize="text-lg" lightText={false} />

          {/* Navigation links */}
          <nav className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase block mb-3 px-3">Navigation Menu</span>
            {visibleItems.map(item => {
              const Icon = item.icon
              const active = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer
                    ${active 
                      ? 'bg-blue-50/70 text-[#1e40af] border-l-4 border-[#1e40af]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-l-4 border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-4.5 h-4.5 ${active ? 'text-[#1e40af]' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-slate-200">
          {onEnterPreview && (user.role === 'super_admin' || user.role === 'officer') && (
            <button
              onClick={onEnterPreview}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[11px] font-bold tracking-wide text-[#be185d] hover:text-[#db2777] hover:bg-[#fdf2f8] border border-[#be185d]/20 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#be185d]" />
              View Public Site
            </button>
          )}
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-200/80">
            <img 
              src={user.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.full_name}`} 
              alt={user.full_name} 
              className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-250"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">{user.full_name}</p>
              <div className="mt-1">{renderRoleBadge(user.role)}</div>
            </div>
          </div>

          {isMockMode && (
            <div className="px-2 py-1.5 rounded-lg bg-[#fdf2f8] border border-[#be185d]/10 text-[9px] text-[#be185d] text-center font-bold">
              Sandbox Storage Active
            </div>
          )}

          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-250 hover:border-rose-350 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen overflow-y-auto">
        {/* Top Navbar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/40 border-b border-slate-200 backdrop-blur-md sticky top-0 z-20">
          <div>
            <h2 className="text-lg font-bold text-slate-900 capitalize">{currentTab.replace('-', ' ')}</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Welcome back, {user.full_name} • OrgPlus Hub</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-700">Active Session</p>
              <p className="text-[10px] text-slate-500">{user.email}</p>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-6 md:p-8 flex-1 relative z-10 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  )
}
