import React, { useState, useEffect } from 'react'
import { eventService } from '../../services/eventService'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import { Event, EventRegistration, EventCommittee, EventAnnouncement, EventReport, Profile, CommitteeRole, AttendanceStatus } from '../../types'
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Megaphone, 
  FileSpreadsheet, 
  Trash2, 
  Check, 
  X, 
  ClipboardList, 
  DollarSign, 
  Send,
  Plus
} from 'lucide-react'

interface EventDashboardProps {
  eventId: string
  onBack: () => void
}

export const EventDashboard: React.FC<EventDashboardProps> = ({ eventId, onBack }) => {
  const { showToast } = useToast()

  const [event, setEvent] = useState<Event | null>(null)
  const [activeTab, setActiveTab] = useState<'attendees' | 'committee' | 'announcements' | 'report'>('attendees')
  
  // Data lists
  const [regs, setRegs] = useState<EventRegistration[]>([])
  const [comms, setComms] = useState<EventCommittee[]>([])
  const [anns, setAnns] = useState<EventAnnouncement[]>([])
  const [report, setReport] = useState<EventReport | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([]) // Used for committee assignment auto-complete
  
  const [loading, setLoading] = useState<boolean>(true)

  // Committee Assignment Forms
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [commRole, setCommRole] = useState<CommitteeRole>('member')
  const [commDept, setCommDept] = useState<string>('Logistics')
  
  // Announcement Forms
  const [annTitle, setAnnTitle] = useState<string>('')
  const [annContent, setAnnContent] = useState<string>('')
  
  // Report Forms
  const [repSummary, setRepSummary] = useState<string>('')
  const [repBudget, setRepBudget] = useState<number>(0)
  const [repDocLink, setRepDocLink] = useState<string>('')
  
  const [submitting, setSubmitting] = useState<boolean>(false)

  const loadEventData = async () => {
    setLoading(true)
    try {
      const evs = await eventService.getEvents()
      const found = evs.find(e => e.id === eventId)
      if (!found) throw new Error('Event not found')
      setEvent(found)

      const registrations = await eventService.getRegistrations(eventId)
      setRegs(registrations)

      const committees = await eventService.getCommittees(eventId)
      setComms(committees)

      const announcements = await eventService.getAnnouncements(eventId)
      setAnns(announcements)

      const rep = await eventService.getReport(eventId)
      if (rep) {
        setReport(rep)
        setRepSummary(rep.summary)
        setRepBudget(rep.budget_spent)
        setRepDocLink(rep.documentation_url || '')
      }

      // Fetch potential users to assign to committee
      const allProfiles = authService.getMockProfiles()
      // Filter out profiles that are applicants or already on the committee
      const eligible = allProfiles.filter(p => p.role !== 'applicant' && !committees.some(c => c.user_id === p.id))
      setProfiles(eligible)
      if (eligible.length > 0) setSelectedUserId(eligible[0].id)

    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load event dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEventData()
  }, [eventId])

  // Attendance
  const handleCheckIn = async (regId: string, status: AttendanceStatus) => {
    try {
      await eventService.updateAttendance(regId, status)
      showToast('Attendance Logged', `Attendee marked as ${status}`, 'success')
      loadEventData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update attendance', 'error')
    }
  }

  // Committee assignment
  const handleAssignCommittee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) {
      showToast('Validation Error', 'Please select a member to assign', 'warning')
      return
    }

    try {
      await eventService.assignCommittee(eventId, selectedUserId, commRole, commDept, 'assigned')
      showToast('Member Assigned', 'User added to the event committee list.', 'success')
      loadEventData()
    } catch (err: any) {
      showToast('Assignment Failed', err.message || 'Failed to assign committee', 'error')
    }
  }

  const handleApproveCommittee = async (userId: string) => {
    try {
      await eventService.approveCommitteeStaff(eventId, userId)
      showToast('Staff Approved', 'User has been assigned to the committee roster.', 'success')
      loadEventData()
    } catch (err: any) {
      showToast('Approval Failed', err.message || 'Failed to approve application', 'error')
    }
  }

  const handleRemoveCommittee = async (userId: string) => {
    try {
      await eventService.removeCommittee(eventId, userId)
      showToast('Member Removed', 'User removed from event committee.', 'info')
      loadEventData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to remove from committee', 'error')
    }
  }

  // Announcements
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle || !annContent) {
      showToast('Validation Error', 'Fill in both title and announcement content', 'warning')
      return
    }

    try {
      await eventService.createAnnouncement(eventId, annTitle, annContent)
      showToast('Announcement Posted', 'Notification dispatched to registered attendees.', 'success')
      setAnnTitle('')
      setAnnContent('')
      loadEventData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create announcement', 'error')
    }
  }

  // Post-Event Report
  const handlePostReport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repSummary) {
      showToast('Validation Error', 'Please write a brief event summary', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await eventService.submitReport(eventId, repSummary, repBudget, repDocLink || null)
      showToast('Report Submitted', 'Event marked as Completed and documented.', 'success')
      loadEventData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to submit post-event report', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !event) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
        <p className="text-xs text-slate-400 font-semibold">Configuring dashboard control deck...</p>
      </div>
    )
  }

  const registeredRegs = regs.filter(r => r.status === 'registered')
  const presentCount = registeredRegs.filter(r => r.attendance_status === 'present').length
  const absentCount = registeredRegs.filter(r => r.attendance_status === 'absent').length

  return (
    <div className="space-y-6">
      
      {/* Back & Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 hover:bg-slate-800 text-[10px] font-bold rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Schedule
        </button>

        <div className="text-right">
          <h2 className="text-lg font-black text-white">{event.title}</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Status: <span className="text-purple-400 font-bold capitalize">{event.status.replace('_', ' ')}</span>
          </p>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-slate-900 gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('attendees')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'attendees'
              ? 'border-purple-500 text-purple-400 bg-purple-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Attendee Check-ins
        </button>
        <button
          onClick={() => setActiveTab('committee')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'committee'
              ? 'border-purple-500 text-purple-400 bg-purple-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserPlus className="w-4 h-4" /> Committee Planner
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'border-purple-500 text-purple-400 bg-purple-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Announcements Feed
        </button>
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'border-purple-500 text-purple-400 bg-purple-950/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Post-Event Report
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'attendees' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-center">
              <span className="text-[10px] text-slate-500 block">Total Registered</span>
              <span className="text-xl font-bold text-white mt-1 block">{registeredRegs.length}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-center">
              <span className="text-[10px] text-emerald-500/80 block">Confirmed Present</span>
              <span className="text-xl font-bold text-emerald-400 mt-1 block">{presentCount}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 text-center">
              <span className="text-[10px] text-rose-500/80 block">Unexcused Absent</span>
              <span className="text-xl font-bold text-rose-400 mt-1 block">{absentCount}</span>
            </div>
          </div>

          {/* Roster Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            {registeredRegs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No attendees registered yet for this event.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/40 border-b border-slate-800 text-slate-400">
                    <th className="p-4 font-semibold">User Profile</th>
                    <th className="p-4 font-semibold">Registration Date</th>
                    <th className="p-4 font-semibold">Attendance Log</th>
                    <th className="p-4 font-semibold text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {registeredRegs.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-900/20">
                      <td className="p-4 flex items-center gap-3">
                        <img
                          src={reg.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${reg.profiles?.full_name}`}
                          alt={reg.profiles?.full_name}
                          className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white">{reg.profiles?.full_name}</p>
                          <p className="text-[10px] text-slate-500">{reg.profiles?.email}</p>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {new Date(reg.registered_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${
                          reg.attendance_status === 'present' 
                            ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400'
                            : reg.attendance_status === 'excused'
                            ? 'bg-blue-950/20 border border-blue-500/30 text-blue-400'
                            : 'bg-rose-950/20 border border-rose-500/30 text-rose-400'
                        }`}>
                          {reg.attendance_status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleCheckIn(reg.id, 'present')}
                            className="px-2 py-1 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-transparent rounded text-[9px] font-semibold transition-all cursor-pointer"
                          >
                            Mark Present
                          </button>
                          <button
                            onClick={() => handleCheckIn(reg.id, 'absent')}
                            className="px-2 py-1 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 hover:border-transparent rounded text-[9px] font-semibold transition-all cursor-pointer"
                          >
                            Mark Absent
                          </button>
                          <button
                            onClick={() => handleCheckIn(reg.id, 'excused')}
                            className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/20 hover:border-transparent rounded text-[9px] font-semibold transition-all cursor-pointer"
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'committee' && (
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Assignment panel */}
          <div className="md:col-span-1 glass-panel p-5 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-4">Assign Committee Lead</h4>
            
            {profiles.length === 0 ? (
              <p className="text-[10px] text-slate-500 leading-relaxed">
                All organization members have already been allocated to committees for this event, or none are registered in the sandbox system.
              </p>
            ) : (
              <form onSubmit={handleAssignCommittee} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">Select Member</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800"
                  >
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} ({p.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">Department / Area</label>
                  <select
                    value={commDept}
                    onChange={(e) => setCommDept(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-850"
                  >
                    <option value="Logistics">Logistics Coordinator</option>
                    <option value="Technical">Technical Operations</option>
                    <option value="Marketing">Marketing & Swag</option>
                    <option value="Finance">Finance & Budget</option>
                    <option value="Program">Program Host</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 font-semibold mb-1">Committee Role</label>
                  <select
                    value={commRole}
                    onChange={(e) => setCommRole(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-850"
                  >
                    <option value="member">Staff Member</option>
                    <option value="coordinator">Coordinator Lead</option>
                    <option value="head">Committee Head</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-button text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Assign Member
                </button>
              </form>
            )}
          </div>

          {/* Committee assignments roster */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Active Roster */}
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-slate-50 p-4 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Allocated Committee Roster</h4>
                </div>
                
                {comms.filter(c => c.status !== 'pending').length === 0 ? (
                  <div className="p-12 text-center text-slate-500 text-xs">
                    No active committee assignments created. Use the left panel to delegate tasks!
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-550 text-[10px]">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Department</th>
                        <th className="p-4 font-semibold">Committee Role</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comms.filter(c => c.status !== 'pending').map(comm => (
                        <tr key={comm.id} className="hover:bg-slate-50/50">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={comm.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comm.profiles?.full_name}`}
                              alt={comm.profiles?.full_name}
                              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{comm.profiles?.full_name}</p>
                              <p className="text-[9px] text-slate-400">{comm.profiles?.email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700 font-bold">{comm.department}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                              comm.role === 'head' 
                                ? 'border-[#be185d]/30 bg-[#fdf2f8] text-[#be185d]' 
                                : comm.role === 'coordinator'
                                ? 'border-blue-200 bg-blue-50 text-blue-750'
                                : 'border-slate-200 bg-slate-100 text-slate-650'
                            }`}>
                              {comm.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleRemoveCommittee(comm.user_id)}
                              className="p-1.5 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-all cursor-pointer inline-flex"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pending Staff Applications */}
            <div className="glass-panel rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between">
              <div>
                <div className="bg-amber-50/50 p-4 border-b border-slate-200">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 text-amber-600 animate-pulse" /> Pending Staff Applications Queue
                  </h4>
                </div>
                
                {comms.filter(c => c.status === 'pending').length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No pending staff applications for this event.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-550 text-[10px]">
                        <th className="p-4 font-semibold">User</th>
                        <th className="p-4 font-semibold">Department</th>
                        <th className="p-4 font-semibold">Requested Role</th>
                        <th className="p-4 font-semibold text-right font-bold">Review Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {comms.filter(c => c.status === 'pending').map(comm => (
                        <tr key={comm.id} className="hover:bg-slate-50/50">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={comm.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comm.profiles?.full_name}`}
                              alt={comm.profiles?.full_name}
                              className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200"
                            />
                            <div>
                              <p className="font-semibold text-slate-800">{comm.profiles?.full_name}</p>
                              <p className="text-[9px] text-slate-400">{comm.profiles?.email}</p>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700 font-bold">{comm.department}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                              comm.role === 'coordinator'
                                ? 'border-blue-200 bg-blue-50 text-blue-750'
                                : 'border-slate-200 bg-slate-100 text-slate-650'
                            }`}>
                              {comm.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleApproveCommittee(comm.user_id)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 hover:border-transparent rounded text-[9px] font-semibold transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRemoveCommittee(comm.user_id)}
                                className="px-2 py-1 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 hover:border-transparent rounded text-[9px] font-semibold transition-all cursor-pointer"
                              >
                                Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Post updates form */}
          <div className="md:col-span-1 glass-panel p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-4">Post Announcement</h4>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. Swag details & Food schedule"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">Content Details</label>
                <textarea
                  placeholder="Specify agenda shifts, item checklist, etc."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-button text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Send className="w-4 h-4" /> Dispatch Alert
              </button>
            </form>
          </div>

          {/* Announcements feed */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Announcements History</h4>
            {anns.length === 0 ? (
              <div className="glass-panel p-12 text-center rounded-2xl text-slate-500 text-xs">
                No announcements dispatched for this event.
              </div>
            ) : (
              anns.map(ann => (
                <div key={ann.id} className="p-4 rounded-xl glass-panel relative border border-slate-800">
                  <div className="flex justify-between items-start gap-4">
                    <h5 className="text-xs font-bold text-white leading-tight">{ann.title}</h5>
                    <span className="text-[9px] text-slate-500">
                      {new Date(ann.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                  
                  <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center gap-2 text-[9px] text-slate-500">
                    <img
                      src={ann.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${ann.profiles?.full_name}`}
                      alt={ann.profiles?.full_name}
                      className="w-4 h-4 rounded-full"
                    />
                    <span>Posted by: <strong>{ann.profiles?.full_name}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'report' && (
        <div className="max-w-2xl mx-auto glass-panel p-6 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-slate-900">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-white">Post-Event Report & Audit Submission</h4>
          </div>

          {report && (
            <div className="p-4 rounded-xl bg-emerald-950/10 border border-emerald-500/20 text-xs text-emerald-400 mb-6 flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>An official post-event report was submitted by {report.profiles?.full_name || 'Officer'} on {new Date(report.submitted_at).toLocaleDateString()}. Event has been locked as Completed.</span>
            </div>
          )}

          <form onSubmit={handlePostReport} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 font-semibold mb-1">Executive Summary / Outcomes</label>
              <textarea
                value={repSummary}
                onChange={(e) => setRepSummary(e.target.value)}
                placeholder="Include attendance stats, highlights, problems faced, and overall summary of the event."
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1 flex items-center gap-0.5">
                  <DollarSign className="w-3.5 h-3.5" /> Total Budget Spent ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={repBudget}
                  onChange={(e) => setRepBudget(parseFloat(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Documentation File Link (PDF/Drive)</label>
                <input
                  type="url"
                  value={repDocLink}
                  onChange={(e) => setRepDocLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>
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
                  <Check className="w-3.5 h-3.5" /> Save & Complete Event Audit
                </>
              )}
            </button>
          </form>
        </div>
      )}

    </div>
  )
}
