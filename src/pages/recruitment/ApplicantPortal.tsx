import React, { useState, useEffect } from 'react'
import { recruitmentService } from '../../services/recruitmentService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { RecruitmentCampaign, Application } from '../../types'
import { 
  Users, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Send,
  UserCheck,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react'

interface ApplicantPortalProps {
  setCurrentTab: (tab: string) => void
}

export const ApplicantPortal: React.FC<ApplicantPortalProps> = ({ setCurrentTab }) => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([])
  const [myApps, setMyApps] = useState<Application[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Application Submission Modal State
  const [selectedCampaign, setSelectedCampaign] = useState<RecruitmentCampaign | null>(null)
  const [appAnswers, setAppAnswers] = useState<Record<string, string>>({
    motivation: '',
    experience: ''
  })
  const [resumeLink, setResumeLink] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const camps = await recruitmentService.getCampaigns()
      setCampaigns(camps.filter(c => c.status === 'active'))

      if (user) {
        const apps = await recruitmentService.getMyApplications()
        setMyApps(apps)
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch campaigns data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCampaign) return

    if (!appAnswers.motivation || !appAnswers.experience || !resumeLink) {
      showToast('Validation Error', 'Please complete all questionnaire fields and attach resume link', 'warning')
      return
    }

    setSubmitting(true)
    try {
      await recruitmentService.submitApplication(
        selectedCampaign.id,
        {
          'Why do you want to join?': appAnswers.motivation,
          'What prior experience do you bring?': appAnswers.experience
        },
        resumeLink
      )
      showToast('Application Submitted', 'Your screening process has officially started!', 'success')
      setSelectedCampaign(null)
      setAppAnswers({ motivation: '', experience: '' })
      setResumeLink('')
      loadData()
    } catch (err: any) {
      showToast('Submission Failed', err.message || 'You might have already applied to this drive.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStepper = (app: Application) => {
    const statusMap = {
      pending: { step: 1, label: 'Application Received', color: 'text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:border-amber-500/20' },
      screening: { step: 2, label: 'Under Review', color: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/20' },
      interview: { step: 3, label: 'Interview Scheduled', color: 'text-purple-700 bg-purple-50 border-purple-200 dark:text-purple-400 dark:bg-purple-500/10 dark:border-purple-500/20' },
      approved: { step: 4, label: 'Application Approved', color: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20' },
      rejected: { step: 4, label: 'Application Declined', color: 'text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-500/10 dark:border-rose-500/20' }
    }

    const currentStatus = app.status as keyof typeof statusMap
    const currentStepConfig = statusMap[currentStatus] || { step: 1, label: 'Submitted', color: 'text-slate-500 dark:text-slate-400' }

    const stepsList = [
      { id: 1, name: 'Submitted', desc: 'Application securely received and indexed in database.' },
      { id: 2, name: 'Screening', desc: 'Screening officer is auditing responses and resume link.' },
      { id: 3, name: 'Interview', desc: 'In-person or video panel session evaluation.' },
      { id: 4, name: 'Decision', desc: 'Final application approval or rejection.' }
    ]

    return (
      <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 space-y-6 text-left">
        <div>
          <span className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest block">Real-time Tracker</span>
          <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">Application Pipeline Tracker</h4>
          <p className="text-[11px] text-slate-600 dark:text-slate-450 mt-1">
            Tracking position: <span className="text-slate-850 dark:text-white font-bold">{app.recruitment_campaigns?.title}</span>
          </p>
        </div>

        {/* Vertical Timeline Stepper */}
        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-900">
          {stepsList.map((st) => {
            let active = st.id <= currentStepConfig.step
            let isCurrent = st.id === currentStepConfig.step
            let isRejected = app.status === 'rejected' && st.id === 4

            let dotColor = 'bg-slate-100 dark:bg-slate-900 border-slate-205 dark:border-slate-800'
            let textColor = 'text-slate-500 dark:text-slate-550'

            if (active) {
              if (isRejected) {
                dotColor = 'bg-rose-500 border-rose-450 ring-4 ring-rose-500/20'
                textColor = 'text-rose-700 dark:text-rose-450'
              } else if (isCurrent) {
                dotColor = 'bg-purple-600 border-purple-500 ring-4 ring-purple-500/20'
                textColor = 'text-purple-750 dark:text-purple-300 font-bold'
              } else {
                dotColor = 'bg-emerald-600 border-emerald-500'
                textColor = 'text-slate-700 dark:text-slate-300'
              }
            }

            return (
              <div key={st.id} className="flex gap-4 relative pl-8">
                {/* Visual Dot indicator */}
                <div className={`absolute left-0 top-1 w-6.5 h-6.5 rounded-full border-2 flex items-center justify-center z-10 transition-all ${dotColor}`}>
                  {st.id < currentStepConfig.step && !isRejected ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : isRejected && st.id === 4 ? (
                    <XCircle className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span className="text-[9px] font-black text-white">{st.id}</span>
                  )}
                </div>

                <div>
                  <h5 className={`text-xs ${textColor}`}>{st.name}</h5>
                  <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5 leading-relaxed">{st.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Feedback / Call to Actions */}
        <div className="pt-4 border-t border-slate-205 dark:border-slate-900/60 space-y-4">
          {app.feedback && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/30 rounded-xl border border-slate-200 dark:border-slate-900 flex items-start gap-2.5">
              <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">Reviewer Feedback Notes</p>
                <p className="text-[11px] text-purple-750 dark:text-purple-300 mt-0.5 italic">"{app.feedback}"</p>
              </div>
            </div>
          )}

          {app.status === 'approved' && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-250 dark:border-emerald-500/20 p-4 rounded-xl space-y-3 text-left">
              <p className="text-xs text-emerald-700 dark:text-emerald-450 leading-normal font-semibold">
                Congratulations! You are officially accepted.
              </p>
              <button
                onClick={() => setCurrentTab('onboarding')}
                className="w-full flex items-center justify-center gap-2 py-2 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer"
              >
                Go to Onboarding Checklist <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* Dynamic welcome header */}
      <div className="glass-panel p-8 rounded-3xl bg-gradient-premium relative overflow-hidden border border-slate-200 dark:border-slate-800/80">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative max-w-lg">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400">
            Recruitment Hub
          </span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4 leading-tight">Join the OrgPlus Family</h2>
          <p className="text-xs text-slate-650 dark:text-slate-400 mt-2 leading-relaxed">
            Apply to join our student organization campaigns. Submit responses to questionnaires, track review stages, and complete onboarding pipelines.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Loading portal details...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Stepper or Available Positions */}
          <div className="md:col-span-8 space-y-6">
            {myApps.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">My Active Submissions</h3>
                {myApps.map(app => (
                  <div key={app.id} className="grid md:grid-cols-1 gap-6">
                    {renderStepper(app)}
                  </div>
                ))}
              </div>
            )}

            {/* Display open positions if any */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Available Roster Openings</h3>
              {campaigns.length === 0 ? (
                <div className="glass-panel border border-slate-200 dark:border-slate-800/80 p-10 text-center rounded-2xl">
                  <Users className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-700 dark:text-slate-350 font-bold text-xs">No Active Recruitment Campaigns</p>
                  <p className="text-slate-500 text-[10px] mt-1">Position vacancy drives open seasonally. Keep checking back!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-1 gap-4">
                  {campaigns.map(c => {
                    const alreadyApplied = myApps.some(app => app.campaign_id === c.id)
                    return (
                      <div key={c.id} className="p-5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-left max-w-md">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400">
                            {c.type} position
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{c.title}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-450 mt-1 leading-normal line-clamp-2">{c.description}</p>
                        </div>

                        <div className="shrink-0">
                          {alreadyApplied ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-555" /> Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedCampaign(c)}
                              className="px-4 py-2 bg-purple-50 dark:bg-purple-600/20 hover:bg-purple-600 text-purple-750 dark:text-purple-300 hover:text-white dark:hover:text-white border border-purple-250 dark:border-purple-500/20 hover:border-transparent text-xs font-bold rounded-xl transition-all cursor-pointer"
                            >
                              Apply Now
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

          {/* RIGHT: Requirements / FAQ */}
          <div className="md:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Application Requirements
              </h4>
              <ul className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-555 shrink-0 mt-0.5" />
                  <span>Must be currently enrolled as a student in good standing.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-555 shrink-0 mt-0.5" />
                  <span>Include a link to a resume (Google Drive PDF / Github links preferred).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-555 shrink-0 mt-0.5" />
                  <span>Complete all onboarding tasks upon application approval.</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Need Help?
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-450 leading-relaxed">
                Applicants who complete onboarding are promoted to official Member level automatically, unlocking the full schedule calendar. For feedback, reach out to executive coordinators.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* QUESTIONNAIRE MODAL */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl glass-panel border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white text-lg"
            >
              &times;
            </button>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Apply for Recruitment</h3>
            <p className="text-xs text-purple-705 dark:text-purple-400 font-bold mb-6">{selectedCampaign.title}</p>
            
            <form onSubmit={handleApplySubmit} className="space-y-5">
              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-350 font-semibold mb-1.5">
                  1. Why are you interested in joining OrgPlus?
                </label>
                <textarea
                  value={appAnswers.motivation}
                  onChange={(e) => setAppAnswers({ ...appAnswers, motivation: e.target.value })}
                  placeholder="Explain your motivation and expectations."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-355 font-semibold mb-1.5">
                  2. Outline any prior experience or leadership roles you have held.
                </label>
                <textarea
                  value={appAnswers.experience}
                  onChange={(e) => setAppAnswers({ ...appAnswers, experience: e.target.value })}
                  placeholder="Summarize past clubs, projects, or classes you directed."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-600 dark:text-slate-360 font-semibold mb-1.5">
                  3. Link to Resume / Academic Portfolio (Google Drive / GitHub)
                </label>
                <input
                  type="url"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-205 dark:border-slate-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  By submitting, you agree that organization officers can view your profile responses for screening purposes.
                </span>
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
                    <Send className="w-3.5 h-3.5 text-white" /> Submit Application Form
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
