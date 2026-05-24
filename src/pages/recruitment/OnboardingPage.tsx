import React, { useState, useEffect } from 'react'
import { recruitmentService } from '../../services/recruitmentService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { Application, OnboardingTemplate } from '../../types'
import { 
  CheckSquare, 
  Square, 
  Award, 
  ArrowRight, 
  Sparkles,
  Info,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react'

export const OnboardingPage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()

  const [myApp, setMyApp] = useState<Application | null>(null)
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [updatingStep, setUpdatingStep] = useState<string | null>(null)

  // Template Manager States (for Officers/Admins)
  const [allTemplates, setAllTemplates] = useState<OnboardingTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [newStepTitle, setNewStepTitle] = useState<string>('')
  const [newStepDesc, setNewStepDesc] = useState<string>('')
  const [newStepRequired, setNewStepRequired] = useState<boolean>(true)
  const [savingTemplate, setSavingTemplate] = useState<boolean>(false)

  const loadOnboarding = async () => {
    if (!user) return
    setLoading(true)
    try {
      // Fetch templates list first
      const temps = await recruitmentService.getOnboardingTemplates()
      setAllTemplates(temps)
      if (temps.length > 0) {
        setSelectedTemplateId(prev => prev || temps[0].id)
      }

      if (user.role === 'applicant') {
        const apps = await recruitmentService.getMyApplications()
        const approvedApp = apps.find(a => a.status === 'approved')

        if (approvedApp) {
          setMyApp(approvedApp)
          const targetRole = approvedApp.recruitment_campaigns?.type === 'officer' ? 'officer' : 'member'
          const match = temps.find(t => t.role_target === targetRole)
          if (match) {
            setTemplate(match)
          }
        }
      }
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch onboarding checklist', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOnboarding()
  }, [user])

  const handleCompleteStep = async (stepId: string) => {
    if (!myApp) return
    setUpdatingStep(stepId)
    try {
      const updatedApp = await recruitmentService.completeOnboardingStep(myApp.id, stepId)
      showToast('Step Complete', 'Checklist task marked as completed!', 'success')
      
      // If the status has changed to completed, trigger user role refresh
      if (updatedApp.onboarding_status === 'completed') {
        showToast('Congratulations!', 'You have completed onboarding and are promoted!', 'success')
        await refreshUser()
      }
      
      loadOnboarding()
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to complete onboarding task', 'error')
    } finally {
      setUpdatingStep(null)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Configuring onboarding list...</p>
      </div>
    )
  }

  const handleAddStep = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStepTitle || !selectedTemplateId) {
      showToast('Validation Error', 'Please enter a step title', 'warning')
      return
    }

    setSavingTemplate(true)
    try {
      const currentTemp = allTemplates.find(t => t.id === selectedTemplateId)
      if (!currentTemp) throw new Error('Template not found')

      const newStep = {
        id: 'step-' + Math.random().toString(36).substr(2, 9),
        title: newStepTitle,
        description: newStepDesc,
        required: newStepRequired
      }

      const updatedSteps = [...currentTemp.steps, newStep]
      await recruitmentService.updateOnboardingTemplate(currentTemp.id, {
        steps: updatedSteps
      })

      showToast('Checklist Updated', 'New task added to onboarding template!', 'success')
      setNewStepTitle('')
      setNewStepDesc('')
      setNewStepRequired(true)
      
      const temps = await recruitmentService.getOnboardingTemplates()
      setAllTemplates(temps)
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update template', 'error')
    } finally {
      setSavingTemplate(false)
    }
  }

  const handleDeleteStep = async (templateId: string, stepId: string) => {
    const currentTemp = allTemplates.find(t => t.id === templateId)
    if (!currentTemp) return

    setSavingTemplate(true)
    try {
      const updatedSteps = currentTemp.steps.filter(s => s.id !== stepId)
      await recruitmentService.updateOnboardingTemplate(templateId, {
        steps: updatedSteps
      })

      showToast('Task Removed', 'Onboarding task removed from template.', 'info')
      
      const temps = await recruitmentService.getOnboardingTemplates()
      setAllTemplates(temps)
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete task', 'error')
    } finally {
      setSavingTemplate(false)
    }
  }

  const renderTemplateManager = () => {
    const activeTemp = allTemplates.find(t => t.id === selectedTemplateId)
    if (!activeTemp) return null

    return (
      <div className="space-y-6 text-left max-w-4xl mx-auto">
        {/* Header Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Onboarding Checklist Configurator</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Add, update, or remove required tasks for newly approved members and officers.</p>
          </div>
          
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Target Role:</span>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="px-3 py-1.5 rounded-lg glass-input text-xs text-slate-700 dark:text-slate-300"
            >
              {allTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.role_target})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-start">
          {/* Current Steps List */}
          <div className="md:col-span-7 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Steps Checklist</h4>
            <div className="space-y-3">
              {activeTemp.steps.length === 0 ? (
                <div className="glass-panel p-8 text-center rounded-xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No onboarding tasks defined yet.</p>
                </div>
              ) : (
                activeTemp.steps.map((st, i) => (
                  <div key={st.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 glass-panel flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-400 font-bold mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{st.title}</span>
                          {st.required && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold border border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:bg-rose-950/15 uppercase">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{st.description}</p>
                      </div>
                    </div>

                    <button
                      disabled={savingTemplate}
                      onClick={() => handleDeleteStep(activeTemp.id, st.id)}
                      className="px-2.5 py-1 rounded bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-600 hover:bg-rose-600 hover:text-white hover:border-transparent dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Step Form */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Add Onboarding Step</h4>
            <form onSubmit={handleAddStep} className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  value={newStepTitle}
                  onChange={(e) => setNewStepTitle(e.target.value)}
                  placeholder="e.g. Read Code of Conduct"
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Description</label>
                <textarea
                  value={newStepDesc}
                  onChange={(e) => setNewStepDesc(e.target.value)}
                  placeholder="Details and instruction links for candidates."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiredCheck"
                  checked={newStepRequired}
                  onChange={(e) => setNewStepRequired(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-purple-600 bg-white dark:bg-slate-900"
                />
                <label htmlFor="requiredCheck" className="text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer">
                  Required step (blocking promotion)
                </label>
              </div>

              <button
                type="submit"
                disabled={savingTemplate}
                className="w-full py-2.5 bg-gradient-button text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                {savingTemplate ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Add Task Step
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // If user is already promoted (role is member or officer or admin), show they are past onboarding
  if (user && user.role !== 'applicant') {
    if (user.role === 'officer' || user.role === 'super_admin') {
      return renderTemplateManager()
    }

    return (
      <div className="max-w-2xl mx-auto glass-panel p-8 rounded-3xl text-center space-y-6 border border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/10 mx-auto">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Welcome, Official {user.role.replace('_', ' ')}!</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed max-w-md mx-auto">
            You have successfully completed your onboarding tasks and have been promoted to an official role. You now have access to event schedules, committee setups, and announcements!
          </p>
        </div>
        <div className="pt-4 border-t border-slate-100 dark:border-slate-900/60 flex justify-center">
          <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/30 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Ready to Collaborate
          </span>
        </div>
      </div>
    )
  }

  if (!myApp || !template) {
    return (
      <div className="max-w-2xl mx-auto glass-panel p-12 text-center rounded-3xl space-y-4 border border-slate-200 dark:border-slate-800">
        <Award className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
        <h3 className="text-slate-700 dark:text-slate-300 font-bold text-sm">No Active Onboarding Flow</h3>
        <p className="text-slate-500 dark:text-slate-500 text-xs leading-relaxed max-w-sm mx-auto">
          Onboarding checklists are unlocked only after your recruitment application is reviewed and **Approved** by an organization officer.
        </p>
      </div>
    )
  }

  // Calculate completion percentage
  const completedStepsCount = myApp.onboarding_steps_completed.length
  const totalStepsCount = template.steps.length
  const completionPercentage = totalStepsCount > 0 ? Math.round((completedStepsCount / totalStepsCount) * 100) : 0

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Title Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{template.title}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{template.description}</p>

        {/* Progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-purple-600 dark:text-purple-400">Onboarding Checklist Progress</span>
            <span className="text-slate-700 dark:text-white">{completionPercentage}% Completed</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-900 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        {template.steps.map(step => {
          const isCompleted = myApp.onboarding_steps_completed.includes(step.id)
          const isButtonDisabled = isCompleted || updatingStep === step.id

          return (
            <div 
              key={step.id} 
              className={`p-4 rounded-xl border glass-panel transition-all flex items-start gap-4 ${
                isCompleted 
                  ? 'border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/5' 
                  : 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <button
                disabled={isButtonDisabled}
                onClick={() => handleCompleteStep(step.id)}
                className={`shrink-0 mt-0.5 transition-colors cursor-pointer ${
                  isCompleted ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 hover:text-purple-600 dark:text-slate-500 dark:hover:text-purple-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 fill-emerald-500/10" />
                ) : updatingStep === step.id ? (
                  <span className="w-5 h-5 block border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-bold ${isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                    {step.title}
                  </span>
                  {step.required && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold border border-rose-300 text-rose-700 bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:bg-rose-950/10 uppercase">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {!isCompleted && (
                <button
                  disabled={updatingStep === step.id}
                  onClick={() => handleCompleteStep(step.id)}
                  className="px-3 py-1.5 border border-purple-200 bg-purple-50 hover:bg-purple-600 hover:text-white hover:border-transparent text-[10px] text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:hover:bg-purple-500 dark:hover:text-white dark:text-purple-300 font-bold rounded-lg transition-all cursor-pointer"
                >
                  Mark Done
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Help box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 dark:bg-slate-900/40 dark:border-slate-800 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-500 dark:text-purple-400 shrink-0 mt-0.5" />
        <span className="text-[10px] text-blue-700 dark:text-slate-400 leading-relaxed">
          Completed tasks are instantly tracked. Completing all **Required** onboarding tasks will automatically update your account privileges to an active Member / Officer level.
        </span>
      </div>

    </div>
  )
}
