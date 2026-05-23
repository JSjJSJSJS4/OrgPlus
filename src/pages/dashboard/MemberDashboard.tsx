import React, { useState, useEffect } from 'react'
import { eventService } from '../../services/eventService'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Event, EventRegistration, EventAnnouncement } from '../../types'
import { 
  Megaphone, 
  Calendar, 
  CheckCircle, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Award, 
  UserCheck,
  ClipboardList,
  AlertCircle
} from 'lucide-react'

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [announcements, setAnnouncements] = useState<(EventAnnouncement & { eventTitle: string })[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadMemberPortalData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const evs = await eventService.getEvents()
      // Filter out rejected/draft events for member view
      const memberEvents = evs.filter(e => e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed')
      setEvents(memberEvents)

      const userRegs: EventRegistration[] = []
      const allAnns: (EventAnnouncement & { eventTitle: string })[] = []

      // Iterate through events to fetch user registrations and announcements
      for (const ev of memberEvents) {
        const regs = await eventService.getRegistrations(ev.id)
        const myReg = regs.find(r => r.user_id === user.id && r.status === 'registered')
        if (myReg) {
          userRegs.push(myReg)
        }

        const anns = await eventService.getAnnouncements(ev.id)
        anns.forEach(a => {
          allAnns.push({
            ...a,
            eventTitle: ev.title
          })
        })
      }

      setRegistrations(userRegs)
      // Sort announcements by date (newest first)
      allAnns.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      setAnnouncements(allAnns)

    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load member portal data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemberPortalData()
  }, [user])

  const handleRegister = async (eventId: string) => {
    try {
      await eventService.registerForEvent(eventId)
      showToast('Registered!', 'You are registered for this event.', 'success')
      loadMemberPortalData()
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Failed to register', 'error')
    }
  }

  const handleCancelRegistration = async (eventId: string) => {
    try {
      await eventService.cancelRegistration(eventId)
      showToast('Registration Cancelled', 'You cancelled your slot for this event.', 'info')
      loadMemberPortalData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to cancel registration', 'error')
    }
  }

  const isUserRegistered = (eventId: string) => {
    return registrations.some(r => r.event_id === eventId)
  }

  if (!user) return null

  // Calculate participation rate
  const registeredCount = registrations.length
  // Past events user was registered for
  const pastUserRegs = registrations.filter(r => {
    const ev = events.find(e => e.id === r.event_id)
    return ev && ev.status === 'completed'
  })
  const attendedCount = pastUserRegs.filter(r => r.attendance_status === 'present').length
  const totalEvaluated = pastUserRegs.filter(r => r.attendance_status === 'present' || r.attendance_status === 'absent').length
  const attendanceRate = totalEvaluated > 0 ? Math.round((attendedCount / totalEvaluated) * 100) : 100

  // Filter events: only show approved/ongoing in the dashboard schedule
  const upcomingEvents = events.filter(e => (e.status === 'approved' || e.status === 'ongoing') && new Date(e.date).getTime() > Date.now())

  return (
    <div className="space-y-8 text-left">
      
      {/* Dynamic welcome header */}
      <div className="glass-panel p-8 rounded-3xl bg-gradient-premium relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
            Active Member Portal
          </span>
          <h2 className="text-2xl font-black text-white mt-4 leading-tight">Welcome back, {user.full_name}!</h2>
          <p className="text-xs text-slate-400 mt-1">Review event announcements, verify registrations, and audit attendance logs.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
          <p className="text-xs text-slate-400 font-semibold">Configuring member panel...</p>
        </div>
      ) : (
        <>
          {/* METRICS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl glass-panel border border-slate-800/80">
              <Calendar className="w-6 h-6 text-purple-400 mb-2" />
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Registered Events</span>
              <span className="text-2xl font-black text-white mt-1 block">{registeredCount}</span>
            </div>
            
            <div className="p-5 rounded-xl glass-panel border border-slate-800/80">
              <UserCheck className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Events Attended</span>
              <span className="text-2xl font-black text-white mt-1 block">{attendedCount}</span>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800/80">
              <TrendingUp className="w-6 h-6 text-teal-400 mb-2" />
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Attendance Rate</span>
              <span className="text-2xl font-black text-teal-400 mt-1 block">{attendanceRate}%</span>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-slate-800/80">
              <Award className="w-6 h-6 text-amber-400 mb-2" />
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Onboarding Checklist</span>
              <span className="text-2xl font-black text-emerald-400 mt-1 block text-sm flex items-center gap-1.5 font-extrabold">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Completed
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: Announcements & Upcoming Schedule */}
            <div className="md:col-span-8 space-y-6">
              
              {/* Announcements megaphones */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-purple-400 animate-bounce" /> Organization Announcements
                </h3>
                {announcements.length === 0 ? (
                  <div className="p-8 rounded-2xl glass-panel text-center">
                    <p className="text-slate-400 text-xs font-semibold">No recent announcements published.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="p-4 rounded-xl glass-panel border border-slate-850 text-left">
                        <div className="flex justify-between items-start gap-4 flex-wrap">
                          <span className="text-[10px] font-bold text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2 py-0.5 rounded">
                            {ann.eventTitle}
                          </span>
                          <span className="text-[9px] text-slate-500">
                            {new Date(ann.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-2">{ann.title}</h4>
                        <p className="text-xs text-slate-450 mt-1.5 leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming events calendar */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" /> Upcoming Events Schedule
                </h3>
                {upcomingEvents.length === 0 ? (
                  <div className="p-8 rounded-2xl glass-panel text-center">
                    <p className="text-slate-400 text-xs font-semibold">No upcoming events scheduled.</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {upcomingEvents.map((ev) => {
                      const registered = isUserRegistered(ev.id)
                      return (
                        <div key={ev.id} className="p-5 rounded-2xl glass-panel border border-slate-850 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                                {new Date(ev.date).toLocaleDateString()}
                              </span>
                              {registered && (
                                <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-emerald-950/25 border border-emerald-500/20 text-emerald-400">
                                  Registered
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-white">{ev.title}</h4>
                            <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">{ev.description}</p>
                          </div>

                          <div className="space-y-2 mt-4 pt-3 border-t border-slate-900/60 text-[10px] text-slate-450">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-slate-500" />
                              <span>{new Date(ev.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" />
                              <span className="truncate">{ev.location}</span>
                            </div>
                          </div>

                          <div className="mt-4 flex gap-2">
                            {registered ? (
                              <button
                                onClick={() => handleCancelRegistration(ev.id)}
                                className="w-full py-2 border border-rose-950/20 bg-rose-950/10 hover:bg-rose-950/20 text-xs font-bold rounded-xl text-rose-400 transition-all cursor-pointer text-center"
                              >
                                Cancel Slot
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRegister(ev.id)}
                                className="w-full py-2 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer text-center"
                              >
                                Register Slot
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Participation details & history logs */}
            <div className="md:col-span-4 space-y-6">
              
              {/* Check-in Log History */}
              <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-teal-400" /> Check-in Roster History
                </h4>
                {registrations.length === 0 ? (
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Once you check in at past events, your attendance status log will appear here.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {registrations.map((reg) => {
                      const ev = events.find(e => e.id === reg.event_id)
                      if (!ev) return null

                      let badge = <span className="text-[9px] px-2 py-0.5 rounded border border-slate-800 bg-slate-900/50 text-slate-500 uppercase font-extrabold">Absent</span>
                      if (reg.attendance_status === 'present') {
                        badge = <span className="text-[9px] px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 uppercase font-extrabold">Present</span>
                      } else if (reg.attendance_status === 'excused') {
                        badge = <span className="text-[9px] px-2 py-0.5 rounded border border-amber-500/20 bg-amber-950/10 text-amber-400 uppercase font-extrabold">Excused</span>
                      }

                      return (
                        <div key={reg.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/40 last:border-0">
                          <div className="text-left overflow-hidden pr-2">
                            <p className="font-bold text-slate-350 truncate">{ev.title}</p>
                            <p className="text-[9px] text-slate-550 mt-0.5">{new Date(ev.date).toLocaleDateString()}</p>
                          </div>
                          <div className="shrink-0">{badge}</div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Onboarding materials */}
              <div className="p-6 rounded-2xl glass-panel border border-slate-800/80 space-y-3">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-400" /> Onboarding & Guidelines
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  You are an official member. You have completed the Code of Conduct signing and initial briefs. View your credentials or update seeds in the **Profile** tab.
                </p>
              </div>

            </div>

          </div>
        </>
      )}

    </div>
  )
}
