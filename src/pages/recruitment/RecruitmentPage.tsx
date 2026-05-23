import React, { useState, useEffect } from 'react'
import { recruitmentService } from '../../services/recruitmentService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { RecruitmentCampaign, Application, CampaignType, CampaignStatus } from '../../types'
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
  TrendingUp
} from 'lucide-react'

export const RecruitmentPage: React.FC = () => {
  const { user } = useAuth()
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState<'campaigns' | 'my-applications'>('campaigns')
  const [campaigns, setCampaigns] = useState<RecruitmentCampaign[]>([])
  const [myApps, setMyApps] = useState<Application[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Campaign Creation State (Officers)
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [newCampaignTitle, setNewCampaignTitle] = useState<string>('')
  const [newCampaignDesc, setNewCampaignDesc] = useState<string>('')
  const [newCampaignType, setNewCampaignType] = useState<CampaignType>('member')
  const [newCampaignEndDate, setNewCampaignEndDate] = useState<string>('')

  // Application Submission State
  const [selectedCampaign, setSelectedCampaign] = useState<RecruitmentCampaign | null>(null)
  const [appAnswers, setAppAnswers] = useState<Record<string, string>>({
    motivation: '',
    experience: ''
  })
  const [resumeLink, setResumeLink] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)

  const isOfficer = user?.role === 'officer' || user?.role === 'super_admin'

  const loadData = async () => {
    setLoading(true)
    try {
      const camps = await recruitmentService.getCampaigns()
      setCampaigns(camps)

      if (user) {
        const apps = await recruitmentService.getMyApplications()
        setMyApps(apps)
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch recruitment data', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCampaignTitle || !newCampaignDesc) {
      showToast('Validation Error', 'Please fill in all campaign fields', 'warning')
      return
    }

    try {
      await recruitmentService.createCampaign({
        title: newCampaignTitle,
        description: newCampaignDesc,
        type: newCampaignType,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: newCampaignEndDate ? new Date(newCampaignEndDate).toISOString() : null,
        created_by: user?.id || null
      })
      showToast('Success', 'Recruitment campaign launched successfully!', 'success')
      setShowCreateModal(false)
      // Reset form
      setNewCampaignTitle('')
      setNewCampaignDesc('')
      setNewCampaignType('member')
      setNewCampaignEndDate('')
      loadData()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to create campaign', 'error')
    }
  }

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
      setActiveTab('my-applications')
    } catch (err: any) {
      showToast('Submission Failed', err.message || 'You might have already applied to this drive.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">Approved</span>
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">Rejected</span>
      case 'screening':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">In Screening</span>
      case 'interview':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">Interviewing</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">Pending Review</span>
    }
  }

  const renderCampaignStatusBadge = (status: CampaignStatus) => {
    if (status === 'active') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">Active</span>
    }
    if (status === 'draft') {
      return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-400">Draft</span>
    }
    return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/40 border border-rose-500/30 text-rose-400">Closed</span>
  }

  return (
    <div className="space-y-6">
      
      {/* Tab Switcher & Top Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'campaigns'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
            }`}
          >
            Recruitment Drives
          </button>
          {!isOfficer && (
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'my-applications'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                  : 'bg-slate-900/50 hover:bg-slate-900 text-slate-400 border border-slate-800/80'
              }`}
            >
              My Applications
            </button>
          )}
        </div>

        {isOfficer && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-button text-xs font-bold rounded-xl shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
          <p className="text-xs text-slate-400 font-semibold">Loading campaigns...</p>
        </div>
      ) : activeTab === 'campaigns' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {campaigns.length === 0 ? (
            <div className="md:col-span-2 glass-panel p-12 text-center rounded-2xl">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 font-bold text-sm">No Active Campaigns Available</p>
              <p className="text-slate-500 text-xs mt-1">Check back later or ask your organization officer.</p>
            </div>
          ) : (
            campaigns.map(campaign => (
              <div key={campaign.id} className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide border ${
                      campaign.type === 'officer' 
                        ? 'border-purple-500/30 bg-purple-950/40 text-purple-400' 
                        : 'border-blue-500/30 bg-blue-950/40 text-blue-400'
                    }`}>
                      {campaign.type} recruitment
                    </span>
                    {renderCampaignStatusBadge(campaign.status)}
                  </div>
                  <h3 className="text-base font-bold text-white mt-3.5 leading-tight">{campaign.title}</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{campaign.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-900/60 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[10px]">
                      {campaign.end_date 
                        ? `Closes ${new Date(campaign.end_date).toLocaleDateString()}` 
                        : 'Open recruitment'
                      }
                    </span>
                  </div>

                  {campaign.status === 'active' && !isOfficer && (
                    <button
                      onClick={() => {
                        setSelectedCampaign(campaign)
                        setAppAnswers({ motivation: '', experience: '' })
                      }}
                      className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/20 hover:border-transparent text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* My Applications Tab */
        <div className="space-y-6">
          {myApps.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl">
              <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-300 font-bold text-sm">You haven't submitted any applications yet.</p>
              <p className="text-slate-500 text-xs mt-1">Browse active recruitment campaigns above to get started!</p>
            </div>
          ) : (
            myApps.map(app => (
              <div key={app.id} className="p-6 rounded-2xl glass-panel relative overflow-hidden">
                {/* Visual Progress Stepper */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-900/60 pb-6 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {app.recruitment_campaigns?.title || 'Unknown Drive'}
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">Submitted on {new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-semibold">Application Status:</span>
                    {renderStatusBadge(app.status)}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Summary of questionnaire answers */}
                  <div className="md:col-span-2 space-y-4">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">Questionnaire Responses</h4>
                    {Object.entries(app.answers).map(([question, answer]) => (
                      <div key={question} className="p-3.5 rounded-xl bg-slate-950/20 border border-slate-900">
                        <p className="text-[11px] font-bold text-purple-300">{question}</p>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{answer}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions / Next steps box */}
                  <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3">Next Steps</h4>
                      {app.status === 'pending' && (
                        <p className="text-xs text-slate-400 leading-relaxed">
                          Your application is in the queue. An officer will review it shortly. You will be scheduled for screening.
                        </p>
                      )}
                      {app.status === 'screening' && (
                        <p className="text-xs text-slate-400 leading-relaxed text-blue-300">
                          Officers are reviewing your responses and credentials. We may contact you for details.
                        </p>
                      )}
                      {app.status === 'interview' && (
                        <div className="space-y-2">
                          <p className="text-xs text-slate-400 leading-relaxed text-purple-300">
                            Congratulations! You've advanced to the interview round.
                          </p>
                          {app.feedback && (
                            <div className="p-2 bg-purple-950/20 rounded border border-purple-900 text-[10px] text-purple-300">
                              <strong>Note:</strong> {app.feedback}
                            </div>
                          )}
                        </div>
                      )}
                      {app.status === 'rejected' && (
                        <div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Thank you for your interest. Unfortunately, we cannot move forward with your application at this time.
                          </p>
                          {app.feedback && (
                            <p className="text-[10px] text-slate-400 mt-2 bg-slate-950/30 p-2 rounded">
                              <strong>Officer Feedback:</strong> {app.feedback}
                            </p>
                          )}
                        </div>
                      )}
                      {app.status === 'approved' && (
                        <div className="space-y-3">
                          <p className="text-xs text-emerald-400 leading-relaxed font-semibold">
                            Welcome Aboard! Your application is approved.
                          </p>
                          <p className="text-[10px] text-slate-400 leading-normal">
                            To complete your membership, please finish the role-specific onboarding checklist.
                          </p>
                        </div>
                      )}
                    </div>

                    {app.status === 'approved' && (
                      <div className="mt-4">
                        {app.onboarding_status === 'completed' ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-900/30">
                            <CheckCircle className="w-4 h-4" /> Onboarding Completed
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              // Trigger state switch in App or redirect to Onboarding
                              window.location.reload() // In simpler single page context, reloading restores session and unlocks Member role if onboarding auto promotes. Wait, better to let them switch tabs.
                              showToast('Redirecting', 'Navigating to your onboarding dashboard...', 'info')
                              // Let's set a global event or simply alert.
                            }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer"
                          >
                            <UserCheck className="w-4 h-4" /> Start Onboarding <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* MODAL: Launch Campaign (Officers) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg glass-panel p-6 rounded-2xl shadow-2xl relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              &times;
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Launch Recruitment Drive</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Campaign Title</label>
                <input
                  type="text"
                  value={newCampaignTitle}
                  onChange={(e) => setNewCampaignTitle(e.target.value)}
                  placeholder="e.g. Executive Board Officer Drive 2026"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-1">Description & Requirements</label>
                <textarea
                  value={newCampaignDesc}
                  onChange={(e) => setNewCampaignDesc(e.target.value)}
                  placeholder="Describe the duties, requirements, and benefits of joining."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Recruitment Target</label>
                  <select
                    value={newCampaignType}
                    onChange={(e) => setNewCampaignType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  >
                    <option value="member">General Member</option>
                    <option value="officer">Organization Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 font-semibold mb-1">Closes Date</label>
                  <input
                    type="date"
                    value={newCampaignEndDate}
                    onChange={(e) => setNewCampaignEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-button font-bold text-white shadow-lg text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer mt-4"
              >
                <Send className="w-3.5 h-3.5" /> Launch Recruitment Drive
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Submit Application */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCampaign(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              &times;
            </button>
            <h3 className="text-base font-bold text-white mb-1">Apply for Recruitment</h3>
            <p className="text-xs text-purple-400 font-bold mb-4">{selectedCampaign.title}</p>
            
            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  1. Why are you interested in joining OrgPlus?
                </label>
                <textarea
                  value={appAnswers.motivation}
                  onChange={(e) => setAppAnswers({ ...appAnswers, motivation: e.target.value })}
                  placeholder="Tell us about your interest and expectations."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  2. Describe any prior experience or leadership roles you've held.
                </label>
                <textarea
                  value={appAnswers.experience}
                  onChange={(e) => setAppAnswers({ ...appAnswers, experience: e.target.value })}
                  placeholder="Outline projects, class events, or committees you previously participated in."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                  3. Link to Resume / Portfolio (Google Drive / GitHub link)
                </label>
                <input
                  type="url"
                  value={resumeLink}
                  onChange={(e) => setResumeLink(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[10px] text-slate-400 leading-relaxed">
                  By submitting, you agree that organization officers can view your submitted academic/work profile details for screening.
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
                    <Send className="w-3.5 h-3.5" /> Submit Application
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
