import React, { useState, useEffect } from 'react'
import { eventService } from '../../services/eventService'
import { authService } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Event, EventRegistration, EventStatus } from '../../types'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Plus, 
  Check, 
  X, 
  Clock, 
  Info, 
  Megaphone, 
  FileSpreadsheet,
  Settings,
  Activity
} from 'lucide-react'

interface EventsPageProps {
  setSelectedEventIdForManage: (id: string | null) => void
  setCurrentTab: (tab: string) => void
}

export const EventsPage: React.FC<EventsPageProps> = ({ setSelectedEventIdForManage, setCurrentTab }) => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [events, setEvents] = useState<Event[]>([])
  const [registrations, setRegistrations] = useState<EventRegistration[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'my-registrations'>('upcoming')

  // Proposal Modal State
  const [showProposeModal, setShowProposeModal] = useState<boolean>(false)
  const [propTitle, setPropTitle] = useState<string>('')
  const [propDesc, setPropDesc] = useState<string>('')
  const [propDate, setPropDate] = useState<string>('')
  const [propLoc, setPropLoc] = useState<string>('')
  const [propMaxAttendees, setPropMaxAttendees] = useState<number>(100)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // Event Detail State
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedEventRegs, setSelectedEventRegs] = useState<EventRegistration[]>([])

  const isOfficer = user?.role === 'officer' || user?.role === 'super_admin'

  const loadData = async () => {
    setLoading(true)
    try {
      const evs = await eventService.getEvents()
      setEvents(evs)
      
      // Load user registrations if logged in
      if (user) {
        // Fetch all registrations in mock mode/Supabase, then filter or fetch user specific
        // We'll iterate events and see if user registered
        const userRegs: EventRegistration[] = []
        for (const ev of evs) {
          const regs = await eventService.getRegistrations(ev.id)
          const myReg = regs.find(r => r.user_id === user.id && r.status === 'registered')
          if (myReg) userRegs.push(myReg)
        }
        setRegistrations(userRegs)
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch events data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleProposeEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!propTitle || !propDesc || !propDate || !propLoc) {
      showToast('Validation Error', 'Please complete all proposal fields', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await eventService.createEventProposal({
        title: propTitle,
        description: propDesc,
        date: new Date(propDate).toISOString(),
        location: propLoc,
        max_attendees: propMaxAttendees || null
      })
      showToast('Proposal Submitted', 'Your event proposal has been forwarded for role approval.', 'success')
      setShowProposeModal(false)
      // Reset
      setPropTitle('')
      setPropDesc('')
      setPropDate('')
      setPropLoc('')
      setPropMaxAttendees(100)
      loadData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to submit proposal', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (eventId: string) => {
    try {
      await eventService.registerForEvent(eventId)
      showToast('Registered!', 'You are officially registered for this event.', 'success')
      loadData()
      // Refresh details if open
      if (selectedEvent && selectedEvent.id === eventId) {
        const details = await eventService.getRegistrations(eventId)
        setSelectedEventRegs(details)
      }
    } catch (err: any) {
      showToast('Registration Failed', err.message || 'Failed to register', 'error')
    }
  }

  const handleCancelRegistration = async (eventId: string) => {
    try {
      await eventService.cancelRegistration(eventId)
      showToast('Registration Cancelled', 'You cancelled your slot for this event.', 'info')
      loadData()
      if (selectedEvent && selectedEvent.id === eventId) {
        const details = await eventService.getRegistrations(eventId)
        setSelectedEventRegs(details)
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to cancel registration', 'error')
    }
  }

  // Filters logic
  const filteredEvents = events.filter(e => {
    const isApproved = e.status === 'approved' || e.status === 'ongoing' || e.status === 'completed'
    const isUserRegistered = registrations.some(r => r.event_id === e.id)

    // Regular members can only view approved events
    const canView = isApproved || isOfficer

    if (!canView) return false

    if (filter === 'all') return true
    if (filter === 'upcoming') {
      return (e.status === 'approved' || e.status === 'proposal_pending') && new Date(e.date).getTime() > Date.now()
    }
    if (filter === 'ongoing') return e.status === 'ongoing'
    if (filter === 'completed') return e.status === 'completed'
    if (filter === 'my-registrations') return isUserRegistered

    return true
  })

  const openEventDetails = async (event: Event) => {
    setSelectedEvent(event)
    try {
      const details = await eventService.getRegistrations(event.id)
      setSelectedEventRegs(details)
    } catch (err) {
      console.error(err)
    }
  }

  const isUserRegistered = (eventId: string) => {
    return registrations.some(r => r.event_id === eventId)
  }

  return (
    <div className="space-y-6">
      
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('ongoing')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === 'ongoing'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('my-registrations')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === 'my-registrations'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
            }`}
          >
            My Registrations
          </button>
          {isOfficer && (
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
              }`}
            >
              All Proposals
            </button>
          )}
        </div>

        <button
          onClick={() => setShowProposeModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-button text-xs font-bold rounded-xl shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Propose Event
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
          <p className="text-xs text-slate-400 font-semibold">Fetching scheduled events...</p>
        </div>
      ) : (
        /* EVENTS GRID */
        <div className="grid md:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="md:col-span-3 glass-panel p-12 text-center rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-bold text-sm">No Events Scheduled</p>
              <p className="text-slate-500 text-xs mt-1">Check back later or submit an event proposal above!</p>
            </div>
          ) : (
            filteredEvents.map(event => {
              const registered = isUserRegistered(event.id)
              let statusBadge = null
              
              if (event.status === 'proposal_pending') {
                statusBadge = <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">Proposal Pending</span>
              } else if (event.status === 'ongoing') {
                statusBadge = <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1"><Activity className="w-3 h-3 animate-pulse" /> Live Now</span>
              } else if (event.status === 'completed') {
                statusBadge = <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-400">Completed</span>
              } else if (event.status === 'rejected') {
                statusBadge = <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">Proposal Rejected</span>
              }

              return (
                <div key={event.id} className="rounded-2xl glass-panel glass-panel-hover p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <span className="text-[10px] font-bold text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {statusBadge}
                    </div>

                    <h3 className="text-sm font-bold text-white leading-tight">{event.title}</h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">{event.description}</p>
                    
                    <div className="space-y-2 mt-5 text-[11px] text-slate-400 border-t border-slate-900/60 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(event.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => openEventDetails(event)}
                      className="flex-1 py-2 border border-slate-800 hover:bg-slate-800 text-[11px] font-semibold rounded-xl text-slate-300 transition-all cursor-pointer text-center"
                    >
                      View Details
                    </button>

                    {isOfficer && (
                      <button
                        onClick={() => {
                          setSelectedEventIdForManage(event.id)
                          setCurrentTab('event-dashboard')
                        }}
                        className="p-2 border border-purple-500/20 hover:border-purple-500 bg-purple-500/10 hover:bg-purple-600 rounded-xl text-purple-300 hover:text-white transition-all cursor-pointer"
                        title="Manage Event Committees, Attendance & Reports"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {/* PROPOSAL MODAL */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowProposeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Propose Future Event</h3>
            
            <form onSubmit={handleProposeEvent} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Event Title</label>
                <input
                  type="text"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="e.g. Hackathon 2026 - Code & Build"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Description & Target Outcomes</label>
                <textarea
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  placeholder="Summarize the activities, expected timeline, and learning objectives."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Proposed Date & Time</label>
                  <input
                    type="datetime-local"
                    value={propDate}
                    onChange={(e) => setPropDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm text-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Location / Platform</label>
                  <input
                    type="text"
                    value={propLoc}
                    onChange={(e) => setPropLoc(e.target.value)}
                    placeholder="e.g. School Library Annex"
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Attendee Capacity Limit</label>
                <input
                  type="number"
                  value={propMaxAttendees}
                  onChange={(e) => setPropMaxAttendees(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-gradient-button font-bold text-white shadow-lg text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5" /> Submit Event Proposal
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL VIEW MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-white mb-2">{selectedEvent.title}</h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold text-purple-400 bg-purple-950/20 border border-purple-500/20 px-2.5 py-0.5 rounded-lg">
                Date: {new Date(selectedEvent.date).toLocaleDateString()} at {new Date(selectedEvent.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[10px] font-bold text-blue-400 bg-blue-950/20 border border-blue-500/20 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {selectedEvent.location}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Event Description</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                {selectedEvent.description}
              </p>
            </div>

            {/* Attendance & Registration Board */}
            {selectedEvent.status !== 'proposal_pending' && selectedEvent.status !== 'rejected' && (
              <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" /> Attendance Roster ({selectedEventRegs.filter(r => r.status === 'registered').length} Registered)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Register to reserve your slot. Only registered members can check in for attendance or review announcements.
                  </p>
                </div>

                <div className="flex gap-2">
                  {isUserRegistered(selectedEvent.id) ? (
                    <button
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      className="w-full py-2.5 border border-rose-900/30 bg-rose-950/15 hover:bg-rose-950/30 text-rose-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel Registration Slot
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRegister(selectedEvent.id)}
                      className="w-full py-2.5 bg-gradient-button text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                    >
                      Register for Event Slot
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Proposal notes if pending or reviewed */}
            {selectedEvent.status === 'proposal_pending' && (
              <div className="p-4 bg-amber-950/10 border border-amber-500/20 rounded-xl text-xs text-amber-400 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>This event is currently in the officer proposal queue. Registration will open once approved.</span>
              </div>
            )}

            {selectedEvent.approval_notes && (
              <div className="mt-4 p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-[10px] text-slate-400">
                <strong>Officer Review Notes:</strong> {selectedEvent.approval_notes}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
