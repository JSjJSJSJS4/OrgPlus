import React, { useState, useEffect } from 'react'
import { recruitmentService } from '../../services/recruitmentService'
import { useToast } from '../../context/ToastContext'
import { Application, ApplicationStatus } from '../../types'
import { 
  FileText, 
  ArrowRight, 
  MessageSquare, 
  Check, 
  X, 
  Search, 
  ExternalLink,
  ChevronRight,
  TrendingUp
} from 'lucide-react'

export const ScreeningPage: React.FC = () => {
  const { showToast } = useToast()
  
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>('')
  
  // Detail Modal State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [feedbackNotes, setFeedbackNotes] = useState<string>('')
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false)

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await recruitmentService.getApplications()
      setApps(data)
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch applications', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  const handleUpdateStatus = async (appId: string, nextStatus: ApplicationStatus) => {
    setStatusUpdating(true)
    try {
      await recruitmentService.updateApplication(appId, {
        status: nextStatus,
        feedback: feedbackNotes || null
      })
      showToast('Status Updated', `Application moved to ${nextStatus}`, 'success')
      setSelectedApp(null)
      setFeedbackNotes('')
      loadApplications()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update application status', 'error')
    } finally {
      setStatusUpdating(false)
    }
  }

  // Filter columns
  const filterByStatus = (status: ApplicationStatus) => {
    return apps.filter(a => {
      const matchesStatus = a.status === status
      const matchesSearch = 
        a.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.profiles?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.recruitment_campaigns?.title.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesStatus && (searchQuery ? matchesSearch : true)
    })
  }

  const columns: { id: ApplicationStatus; title: string; colorClass: string; borderClass: string }[] = [
    { id: 'pending', title: 'Pending Review', colorClass: 'text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border border-amber-200 dark:border-transparent', borderClass: 'border-amber-200 dark:border-amber-500/20' },
    { id: 'screening', title: 'Screening', colorClass: 'text-blue-700 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border border-blue-200 dark:border-transparent', borderClass: 'border-blue-200 dark:border-blue-500/20' },
    { id: 'interview', title: 'Interview Round', colorClass: 'text-purple-700 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border border-purple-200 dark:border-transparent', borderClass: 'border-purple-200 dark:border-purple-500/20' },
    { id: 'approved', title: 'Approved', colorClass: 'text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-200 dark:border-transparent', borderClass: 'border-emerald-200 dark:border-emerald-500/20' },
    { id: 'rejected', title: 'Rejected', colorClass: 'text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 border border-rose-200 dark:border-transparent', borderClass: 'border-rose-200 dark:border-rose-500/20' }
  ]

  return (
    <div className="space-y-6">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Applicant Screening Board</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Review candidates, progress them through interviews, and approve onboarding workflows.</p>
        </div>
        
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicants or drives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
          <p className="text-xs text-slate-400 font-semibold">Syncing candidates database...</p>
        </div>
      ) : (
        /* KANBAN BOARD GRID */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {columns.map(col => {
            const list = filterByStatus(col.id)
            return (
              <div key={col.id} className="min-w-[220px] flex flex-col rounded-2xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-900 p-4 min-h-[500px]">
                {/* Column Header */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200 dark:border-slate-900">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${col.colorClass}`}>
                    {col.title}
                  </span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-500 font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-full">
                    {list.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] scrollbar-none">
                  {list.length === 0 ? (
                    <div className="text-center py-8 text-[10px] text-slate-500 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl">
                      Empty column
                    </div>
                  ) : (
                    list.map(app => (
                      <div
                        key={app.id}
                        onClick={() => {
                          setSelectedApp(app)
                          setFeedbackNotes(app.feedback || '')
                        }}
                        className={`p-4 rounded-xl border glass-panel glass-panel-hover text-left cursor-pointer ${col.borderClass}`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={app.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${app.profiles?.full_name}`}
                            alt={app.profiles?.full_name}
                            className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800"
                          />
                          <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[120px]">
                            {app.profiles?.full_name}
                          </span>
                        </div>
                        
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-2 truncate">
                          {app.recruitment_campaigns?.title}
                        </p>
 
                        <div className="mt-4 flex justify-between items-center text-[9px] text-slate-550 dark:text-slate-400">
                          <span className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                            {app.recruitment_campaigns?.type}
                          </span>
                          <span className="text-purple-600 dark:text-purple-400 flex items-center gap-0.5 font-semibold">
                            Review <ChevronRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl glass-panel p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              &times;
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-900 pb-4 mb-6">
              <img
                src={selectedApp.profiles?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedApp.profiles?.full_name}`}
                alt={selectedApp.profiles?.full_name}
                className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{selectedApp.profiles?.full_name}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{selectedApp.profiles?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                    Applying for: <strong className="text-purple-605 dark:text-purple-400 capitalize">{selectedApp.recruitment_campaigns?.type}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Applied on {new Date(selectedApp.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Answers & Resume */}
            <div className="space-y-4 mb-6">
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-300 uppercase tracking-wide">Questionnaire Submissions</h4>
              {Object.entries(selectedApp.answers).map(([question, answer]) => (
                <div key={question} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-900">
                  <p className="text-[11px] font-bold text-purple-700 dark:text-purple-300">{question}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{answer}</p>
                </div>
              ))}

              {selectedApp.resume_url && (
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-slate-200 dark:border-slate-900/60">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-xs">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Attached resume or portfolio document</span>
                  </div>
                  <a
                    href={selectedApp.resume_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  >
                    Open Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Feedback & Screening Control Panel */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Screening Decisions & Candidate Feedback
              </h4>
              <textarea
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                placeholder="Write interview schedules, screening notes, or reason for status update. Candidates will see this feedback in their tracking panel."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />

              <div className="mt-4 flex flex-wrap gap-2 justify-end">
                {selectedApp.status !== 'pending' && (
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'pending')}
                    className="px-3.5 py-2 border border-slate-800 hover:bg-slate-800 text-[10px] font-semibold rounded-xl text-slate-300 cursor-pointer"
                  >
                    Revert to Queue
                  </button>
                )}
                {selectedApp.status !== 'screening' && (
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'screening')}
                    className="px-3.5 py-2 border border-blue-900/30 bg-blue-950/20 hover:bg-blue-950/40 text-[10px] font-semibold rounded-xl text-blue-400 cursor-pointer"
                  >
                    Send to Screening
                  </button>
                )}
                {selectedApp.status !== 'interview' && (
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'interview')}
                    className="px-3.5 py-2 border border-purple-900/30 bg-purple-950/20 hover:bg-purple-950/40 text-[10px] font-semibold rounded-xl text-purple-400 cursor-pointer"
                  >
                    Invite to Interview
                  </button>
                )}
                {selectedApp.status !== 'rejected' && (
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'rejected')}
                    className="flex items-center gap-1 px-3.5 py-2 border border-rose-900/30 bg-rose-950/20 hover:bg-rose-950/40 text-[10px] font-semibold rounded-xl text-rose-400 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                )}
                {selectedApp.status !== 'approved' && (
                  <button
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus(selectedApp.id, 'approved')}
                    className="flex items-center gap-1 px-3.5 py-2 bg-gradient-button text-[10px] font-bold text-white rounded-xl shadow-lg cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve & Enable Onboarding
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
