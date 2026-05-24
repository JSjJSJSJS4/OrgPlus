import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { recruitmentService } from '../../services/recruitmentService'
import { eventService } from '../../services/eventService'
import { authService } from '../../services/authService'
import { 
  Users, 
  Calendar, 
  Award, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  CheckSquare, 
  Compass,
  ListTodo
} from 'lucide-react'

interface DashboardOverviewProps {
  setCurrentTab: (tab: string) => void
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setCurrentTab }) => {
  const { user } = useAuth()
  const { theme } = useTheme()
  
  const [stats, setStats] = useState({
    applicantsCount: 0,
    activeCampaigns: 0,
    eventsCount: 0,
    myRegsCount: 0
  })
  const [roleCounts, setRoleCounts] = useState({
    super_admin: 0,
    officer: 0,
    committee_member: 0,
    member: 0,
    applicant: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return
      setLoading(true)
      try {
        const campaigns = await recruitmentService.getCampaigns()
        const apps = await recruitmentService.getApplications()
        const events = await eventService.getEvents()
        const profiles = await authService.getProfiles()
        
        let myRegsCount = 0
        for (const e of events) {
          const regs = await eventService.getRegistrations(e.id)
          if (regs.some(r => r.user_id === user.id && r.status === 'registered')) {
            myRegsCount++
          }
        }

        const counts = {
          super_admin: 0,
          officer: 0,
          committee_member: 0,
          member: 0,
          applicant: 0
        }
        profiles.forEach(p => {
          if (counts[p.role] !== undefined) {
            counts[p.role]++
          }
        })
        setRoleCounts(counts)

        setStats({
          applicantsCount: apps.filter(a => a.status !== 'approved' && a.status !== 'rejected').length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          eventsCount: events.filter(e => e.status === 'approved' || e.status === 'ongoing').length,
          myRegsCount
        })
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [user])

  if (!user) return null

  const renderRosterChart = () => {
    const totalUsers = roleCounts.super_admin + roleCounts.officer + roleCounts.committee_member + roleCounts.member + roleCounts.applicant
    
    const isDark = theme === 'dark'
    const roleMetadata = [
      { key: 'super_admin', label: 'Super Admin', color: isDark ? '#f87171' : '#ef4444', borderClass: 'border-red-200 dark:border-red-500/30', textClass: 'text-red-700 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-950/40' },
      { key: 'officer', label: 'Officer', color: isDark ? '#60a5fa' : '#3b82f6', borderClass: 'border-blue-200 dark:border-blue-500/30', textClass: 'text-blue-700 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-950/40' },
      { key: 'committee_member', label: 'Committee Member', color: isDark ? '#2dd4bf' : '#0d9488', borderClass: 'border-teal-200 dark:border-teal-500/30', textClass: 'text-teal-700 dark:text-teal-400', bgClass: 'bg-teal-50 dark:bg-teal-950/40' },
      { key: 'member', label: 'General Member', color: isDark ? '#34d399' : '#10b981', borderClass: 'border-emerald-200 dark:border-emerald-500/30', textClass: 'text-emerald-700 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-950/40' },
      { key: 'applicant', label: 'Applicant', color: isDark ? '#fbbf24' : '#f59e0b', borderClass: 'border-amber-200 dark:border-amber-500/30', textClass: 'text-amber-700 dark:text-amber-400', bgClass: 'bg-amber-50 dark:bg-amber-950/40' }
    ]

    const r = 36
    const circumference = 2 * Math.PI * r // ~226.195
    let currentOffset = 0

    const donutSegments = roleMetadata.map(role => {
      const count = roleCounts[role.key as keyof typeof roleCounts] || 0
      const percentage = totalUsers > 0 ? (count / totalUsers) * 100 : 0
      const dashArray = (count / (totalUsers || 1)) * circumference
      const dashOffset = -currentOffset
      currentOffset += dashArray
      return {
        ...role,
        count,
        percentage,
        dashArray: `${dashArray} ${circumference}`,
        dashOffset
      }
    })

    return (
      <div className="grid md:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 md:col-span-2 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-3 max-w-xs text-left">
            <div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400">
                Organization Roster
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-white mt-2 leading-tight">Member Roster Statistics</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time distribution of users by role. This chart visualizes administrative staff, event coordinators, and active general members.
            </p>
            <div className="pt-1">
              <span className="inline-block px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950/30 border border-slate-205 dark:border-slate-900 text-slate-600 dark:text-slate-400 text-xs font-bold">
                Total Registered Users: <span className="text-slate-900 dark:text-white font-extrabold">{loading ? '...' : totalUsers}</span>
              </span>
            </div>
          </div>
          
          {/* Chart Ring + Legend */}
          <div className="flex flex-col sm:flex-row items-center gap-8 w-full md:w-auto justify-center">
            {/* SVG Donut Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r={r}
                  fill="transparent"
                  stroke={isDark ? '#161b2a' : '#f1f5f9'}
                  strokeWidth="8"
                />
                {!loading && donutSegments.map((seg) => {
                  if (seg.count === 0) return null
                  return (
                    <circle
                      key={seg.key}
                      cx="50"
                      cy="50"
                      r={r}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="8"
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      strokeLinecap={seg.percentage === 100 ? 'butt' : 'round'}
                      className="transition-all duration-700 ease-out hover:stroke-[10] cursor-pointer"
                    >
                      <title>{`${seg.label}: ${seg.count}`}</title>
                    </circle>
                  )
                })}
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white block leading-none">
                  {loading ? '...' : totalUsers}
                </span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">Users</span>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-2.5 w-full sm:w-auto shrink-0">
              {donutSegments.map(seg => (
                <div key={seg.key} className="flex items-center gap-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: seg.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium w-32 text-left">{seg.label}</span>
                  <span className="text-slate-600 dark:text-slate-400 text-[10px] text-right font-bold w-6">
                    {loading ? '..' : seg.count}
                  </span>
                  <span className="text-slate-550 dark:text-slate-500 text-[10px] text-right w-10">
                    {loading ? '..' : `(${seg.percentage.toFixed(0)}%)`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between relative overflow-hidden text-left">
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Role Classifications</h3>
            <div className="space-y-2">
              {roleMetadata.slice(0, 4).map(role => (
                <div key={role.key} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-slate-900/60 last:border-0">
                  <span className="text-slate-600 dark:text-slate-400">{role.label}s</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold uppercase border ${role.borderClass} ${role.textClass} ${role.bgClass}`}>
                    {role.key === 'super_admin' ? 'Root access' : role.key === 'officer' ? 'Full Admin' : role.key === 'committee_member' ? 'Event Head' : 'Registered'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed mt-4">
            Members can apply for specific officer or committee head vacancies in active recruitment campaigns.
          </p>
        </div>
      </div>
    )
  }

  // Renders different dashboard styles based on roles
  const renderApplicantDashboard = () => (
    <div className="space-y-6">
      <div className="glass-panel p-8 rounded-3xl bg-gradient-premium relative overflow-hidden border border-slate-200 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative max-w-lg">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400">
            Applicant Dashboard
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 leading-tight">Welcome to the OrgPlus Portal!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
            Submit applications to join committees or register for general member recruitment. Once approved, complete your onboarding checklist here.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              onClick={() => setCurrentTab('recruitment')}
              className="px-4 py-2.5 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer"
            >
              Browse Recruitment Campaigns
            </button>
            <button
              onClick={() => setCurrentTab('onboarding')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-850 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl cursor-pointer"
            >
              Check Onboarding Checklist
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-panel relative border border-slate-200 dark:border-slate-800/80">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Application Progress Tracking</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-900">
              <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-850 dark:text-white">Pending Application Screening</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                  Your submitted answer forms will go through screening. Check the **Recruitment Campaigns** tab to review feedback notes.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl glass-panel relative border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Help & FAQ</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              For any questions, reach out to your school organization coordinators. After approval, you will gain access to upcoming event calendars and scheduling permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderMemberDashboard = () => (
    <div className="space-y-6">
      <div className="glass-panel p-8 rounded-3xl bg-gradient-premium relative overflow-hidden border border-slate-200 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Welcome, {user.full_name}!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">You are logged in as a General Member. Discover upcoming events and rosters.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80">
          <Calendar className="w-6 h-6 text-purple-655 dark:text-purple-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Upcoming Events Scheduled</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{stats.eventsCount}</span>
        </div>
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80">
          <Users className="w-6 h-6 text-blue-655 dark:text-blue-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">My Event Registrations</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{stats.myRegsCount}</span>
        </div>
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80 col-span-2 md:col-span-1">
          <Award className="w-6 h-6 text-teal-655 dark:text-teal-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Organization Level</span>
          <span className="text-lg font-bold text-teal-600 dark:text-teal-400 mt-1 block capitalize">{user.role.replace('_', ' ')}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wide mb-4">Quick Navigation Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setCurrentTab('events')}
              className="p-3 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl text-center text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Browse Event Calendar
            </button>
            <button
              onClick={() => setCurrentTab('profile')}
              className="p-3 bg-slate-50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-900 rounded-xl text-center text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              Manage My Profile
            </button>
          </div>
        </div>
      </div>

      {renderRosterChart()}
    </div>
  )

  const renderOfficerDashboard = () => (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80">
          <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Pending Applications</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{loading ? '...' : stats.applicantsCount}</span>
        </div>
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80">
          <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Active Recruitment Campaigns</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{loading ? '...' : stats.activeCampaigns}</span>
        </div>
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80">
          <Calendar className="w-6 h-6 text-teal-655 dark:text-teal-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Upcoming Scheduled Events</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">{loading ? '...' : stats.eventsCount}</span>
        </div>
        <div className="p-5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800/80">
          <Award className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Officer Privilege Level</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block capitalize">{user.role.replace('_', ' ')}</span>
        </div>
      </div>

      {/* Main Grid: Management Shortcuts & Pipeline Logs */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Management Shortcuts */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Staff Administration Dashboard</h3>
            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed mb-6">
              Access screening pipelines to review, approve/reject candidates, write interview schedules, assign committee heads, check attendance logs, or publish announcements.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => setCurrentTab('screening')}
              className="py-3 bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-600 text-purple-750 dark:text-purple-300 hover:text-white dark:hover:text-white border border-purple-200 dark:border-purple-500/20 hover:border-transparent text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Users className="w-4 h-4" /> Screening Pipelines
            </button>
            <button
              onClick={() => setCurrentTab('proposals')}
              className="py-3 bg-blue-50 dark:bg-blue-600/20 hover:bg-blue-600 text-blue-750 dark:text-blue-300 hover:text-white dark:hover:text-white border border-blue-200 dark:border-blue-500/20 hover:border-transparent text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-4 h-4" /> Review Proposals
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Core Reminders</h3>
          <div className="space-y-3.5">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-900 flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Always review the applicant’s answers and resume link prior to approving. Approved users automatically start the onboarding checklist.
              </p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-900 flex items-start gap-3">
              <ListTodo className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                Post-Event reports must detail budget spent. Submitting a report automatically shifts event status to **Completed**.
              </p>
            </div>
          </div>
        </div>

      </div>

      {renderRosterChart()}
    </div>
  )

  // Choose sub-dashboard based on role type
  if (user.role === 'applicant') return renderApplicantDashboard()
  if (user.role === 'member') return renderMemberDashboard()
  // super_admin, officer, or committee_member sees the management overview
  return renderOfficerDashboard()
}
