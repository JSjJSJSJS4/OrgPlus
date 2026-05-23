import { supabase } from '../lib/supabaseClient'
import { Event, EventCommittee, EventRegistration, EventAnnouncement, EventReport, EventStatus, CommitteeRole, RegistrationStatus, AttendanceStatus } from '../types'
import { authService } from './authService'
import { saveStorage } from './mockData'

export const eventService = {
  isMockMode: authService.isMockMode,

  // --- EVENTS ---
  async getEvents(): Promise<Event[]> {
    if (this.isMockMode) {
      const events: Event[] = JSON.parse(localStorage.getItem('ep_mock_events') || '[]')
      const profiles: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      return events.map(e => ({
        ...e,
        proposal_profile: profiles.find(p => p.id === e.proposal_by),
        approved_profile: profiles.find(p => p.id === e.approved_by)
      }))
    } else {
      const { data, error } = await supabase
        .from('events')
        .select('*, proposal_profile:profiles!events_proposal_by_fkey(*), approved_profile:profiles!events_approved_by_fkey(*)')
        .order('date', { ascending: true })
      
      if (error) throw error
      return data as Event[]
    }
  },

  async createEventProposal(event: Omit<Event, 'id' | 'status' | 'proposal_by' | 'approved_by' | 'approval_notes' | 'created_at' | 'updated_at'>): Promise<Event> {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Must be logged in to propose events')

    if (this.isMockMode) {
      const events: Event[] = JSON.parse(localStorage.getItem('ep_mock_events') || '[]')
      const newEvent: Event = {
        ...event,
        id: 'e-' + Math.random().toString(36).substr(2, 9),
        status: 'proposal_pending',
        proposal_by: user.id,
        approved_by: null,
        approval_notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      events.push(newEvent)
      saveStorage('ep_mock_events', events)
      return newEvent
    } else {
      const { data, error } = await supabase
        .from('events')
        .insert({
          ...event,
          status: 'proposal_pending',
          proposal_by: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      return data as Event
    }
  },

  async updateEventStatus(id: string, status: EventStatus, notes: string | null = null): Promise<Event> {
    const reviewer = await authService.getCurrentUser()
    if (!reviewer) throw new Error('Must be logged in to review proposals')

    if (this.isMockMode) {
      const events: Event[] = JSON.parse(localStorage.getItem('ep_mock_events') || '[]')
      const idx = events.findIndex(e => e.id === id)
      if (idx === -1) throw new Error('Event not found')

      const updated = { 
        ...events[idx], 
        status, 
        approved_by: reviewer.id,
        approval_notes: notes,
        updated_at: new Date().toISOString()
      }
      events[idx] = updated
      saveStorage('ep_mock_events', events)
      return updated
    } else {
      const { data, error } = await supabase
        .from('events')
        .update({
          status,
          approved_by: reviewer.id,
          approval_notes: notes
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Event
    }
  },

  // --- REGISTRATIONS ---
  async getRegistrations(eventId: string): Promise<EventRegistration[]> {
    if (this.isMockMode) {
      const regs: EventRegistration[] = JSON.parse(localStorage.getItem('ep_mock_registrations') || '[]')
      const profiles: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      return regs
        .filter(r => r.event_id === eventId)
        .map(r => ({
          ...r,
          profiles: profiles.find(p => p.id === r.user_id)
        }))
    } else {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profiles(*)')
        .eq('event_id', eventId)
      
      if (error) throw error
      return data as EventRegistration[]
    }
  },

  async registerForEvent(eventId: string): Promise<EventRegistration> {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Must be logged in to register')

    if (this.isMockMode) {
      const regs: EventRegistration[] = JSON.parse(localStorage.getItem('ep_mock_registrations') || '[]')
      const existing = regs.find(r => r.event_id === eventId && r.user_id === user.id)
      
      if (existing) {
        if (existing.status === 'registered') return existing
        existing.status = 'registered'
        saveStorage('ep_mock_registrations', regs)
        return existing
      }

      const newReg: EventRegistration = {
        id: 'r-' + Math.random().toString(36).substr(2, 9),
        event_id: eventId,
        user_id: user.id,
        status: 'registered',
        attendance_status: 'absent',
        registered_at: new Date().toISOString(),
        attended_at: null
      }
      regs.push(newReg)
      saveStorage('ep_mock_registrations', regs)
      return newReg
    } else {
      const { data, error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id
        })
        .select()
        .single()
      
      if (error) throw error
      return data as EventRegistration
    }
  },

  async cancelRegistration(eventId: string): Promise<void> {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Must be logged in')

    if (this.isMockMode) {
      const regs: EventRegistration[] = JSON.parse(localStorage.getItem('ep_mock_registrations') || '[]')
      const idx = regs.findIndex(r => r.event_id === eventId && r.user_id === user.id)
      if (idx !== -1) {
        regs[idx].status = 'cancelled'
        saveStorage('ep_mock_registrations', regs)
      }
    } else {
      const { error } = await supabase
        .from('event_registrations')
        .update({ status: 'cancelled' })
        .eq('event_id', eventId)
        .eq('user_id', user.id)
      
      if (error) throw error
    }
  },

  async updateAttendance(registrationId: string, status: AttendanceStatus): Promise<EventRegistration> {
    if (this.isMockMode) {
      const regs: EventRegistration[] = JSON.parse(localStorage.getItem('ep_mock_registrations') || '[]')
      const idx = regs.findIndex(r => r.id === registrationId)
      if (idx === -1) throw new Error('Registration not found')

      regs[idx].attendance_status = status
      regs[idx].attended_at = status === 'present' ? new Date().toISOString() : null
      saveStorage('ep_mock_registrations', regs)
      return regs[idx]
    } else {
      const { data, error } = await supabase
        .from('event_registrations')
        .update({
          attendance_status: status,
          attended_at: status === 'present' ? new Date() : null
        })
        .eq('id', registrationId)
        .select()
        .single()
      
      if (error) throw error
      return data as EventRegistration
    }
  },

  // --- COMMITTEES ---
  async getCommittees(eventId: string): Promise<EventCommittee[]> {
    if (this.isMockMode) {
      const committees: EventCommittee[] = JSON.parse(localStorage.getItem('ep_mock_committees') || '[]')
      const profiles: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      return committees
        .filter(c => c.event_id === eventId)
        .map(c => ({
          ...c,
          profiles: profiles.find(p => p.id === c.user_id)
        }))
    } else {
      const { data, error } = await supabase
        .from('event_committees')
        .select('*, profiles(*)')
        .eq('event_id', eventId)
      
      if (error) throw error
      return data as EventCommittee[]
    }
  },

  async assignCommittee(eventId: string, userId: string, role: CommitteeRole, department: string): Promise<EventCommittee> {
    if (this.isMockMode) {
      const committees: EventCommittee[] = JSON.parse(localStorage.getItem('ep_mock_committees') || '[]')
      const existing = committees.find(c => c.event_id === eventId && c.user_id === userId)

      if (existing) {
        existing.role = role
        existing.department = department
        saveStorage('ep_mock_committees', committees)
        return existing
      }

      const newComm: EventCommittee = {
        id: 'ec-' + Math.random().toString(36).substr(2, 9),
        event_id: eventId,
        user_id: userId,
        role,
        department,
        created_at: new Date().toISOString()
      }
      committees.push(newComm)
      saveStorage('ep_mock_committees', committees)

      // Promote to committee_member role if they are a regular member
      const profilesList: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      const userProf = profilesList.find(p => p.id === userId)
      if (userProf && userProf.role === 'member') {
        await authService.updateProfile(userId, { role: 'committee_member' })
      }

      return newComm
    } else {
      const { data, error } = await supabase
        .from('event_committees')
        .insert({ event_id: eventId, user_id: userId, role, department })
        .select()
        .single()
      
      if (error) throw error
      
      // Attempt profile promotion
      const { data: userProf } = await supabase.from('profiles').select('role').eq('id', userId).single()
      if (userProf && userProf.role === 'member') {
        await authService.updateProfile(userId, { role: 'committee_member' })
      }

      return data as EventCommittee
    }
  },

  async removeCommittee(eventId: string, userId: string): Promise<void> {
    if (this.isMockMode) {
      const committees: EventCommittee[] = JSON.parse(localStorage.getItem('ep_mock_committees') || '[]')
      const filtered = committees.filter(c => !(c.event_id === eventId && c.user_id === userId))
      saveStorage('ep_mock_committees', filtered)
    } else {
      const { error } = await supabase
        .from('event_committees')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)
      
      if (error) throw error
    }
  },

  // --- ANNOUNCEMENTS ---
  async getAnnouncements(eventId: string): Promise<EventAnnouncement[]> {
    if (this.isMockMode) {
      const anns: EventAnnouncement[] = JSON.parse(localStorage.getItem('ep_mock_announcements') || '[]')
      const profiles: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      return anns
        .filter(a => a.event_id === eventId)
        .map(a => ({
          ...a,
          profiles: profiles.find(p => p.id === a.created_by)
        }))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else {
      const { data, error } = await supabase
        .from('event_announcements')
        .select('*, profiles(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as EventAnnouncement[]
    }
  },

  async createAnnouncement(eventId: string, title: string, content: string): Promise<EventAnnouncement> {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Must be logged in')

    if (this.isMockMode) {
      const anns: EventAnnouncement[] = JSON.parse(localStorage.getItem('ep_mock_announcements') || '[]')
      const newAnn: EventAnnouncement = {
        id: 'ea-' + Math.random().toString(36).substr(2, 9),
        event_id: eventId,
        title,
        content,
        created_by: user.id,
        created_at: new Date().toISOString()
      }
      anns.push(newAnn)
      saveStorage('ep_mock_announcements', anns)
      return newAnn
    } else {
      const { data, error } = await supabase
        .from('event_announcements')
        .insert({ event_id: eventId, title, content, created_by: user.id })
        .select()
        .single()
      
      if (error) throw error
      return data as EventAnnouncement
    }
  },

  // --- REPORTS ---
  async getReport(eventId: string): Promise<EventReport | null> {
    if (this.isMockMode) {
      const reports: EventReport[] = JSON.parse(localStorage.getItem('ep_mock_reports') || '[]')
      const found = reports.find(r => r.event_id === eventId)
      if (!found) return null
      const profiles: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      return {
        ...found,
        profiles: profiles.find(p => p.id === found.submitted_by)
      }
    } else {
      const { data, error } = await supabase
        .from('event_reports')
        .select('*, profiles(*)')
        .eq('event_id', eventId)
        .maybeSingle()
      
      if (error) throw error
      return data as EventReport | null
    }
  },

  async submitReport(eventId: string, summary: string, budgetSpent: number, documentationUrl: string | null = null): Promise<EventReport> {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Must be logged in')

    if (this.isMockMode) {
      const reports: EventReport[] = JSON.parse(localStorage.getItem('ep_mock_reports') || '[]')
      const existingIdx = reports.findIndex(r => r.event_id === eventId)

      const reportData: EventReport = {
        id: existingIdx !== -1 ? reports[existingIdx].id : 'er-' + Math.random().toString(36).substr(2, 9),
        event_id: eventId,
        summary,
        budget_spent: budgetSpent,
        documentation_url: documentationUrl,
        submitted_by: user.id,
        submitted_at: new Date().toISOString()
      }

      if (existingIdx !== -1) {
        reports[existingIdx] = reportData
      } else {
        reports.push(reportData)
      }

      saveStorage('ep_mock_reports', reports)

      // Also set event status to 'completed'
      const events: Event[] = JSON.parse(localStorage.getItem('ep_mock_events') || '[]')
      const evIdx = events.findIndex(e => e.id === eventId)
      if (evIdx !== -1) {
        events[evIdx].status = 'completed'
        saveStorage('ep_mock_events', events)
      }

      return reportData
    } else {
      const { data, error } = await supabase
        .from('event_reports')
        .upsert({
          event_id: eventId,
          summary,
          budget_spent: budgetSpent,
          documentation_url: documentationUrl,
          submitted_by: user.id,
          submitted_at: new Date()
        })
        .select()
        .single()
      
      if (error) throw error

      // Mark event as completed
      await supabase.from('events').update({ status: 'completed' }).eq('id', eventId)

      return data as EventReport
    }
  }
}
