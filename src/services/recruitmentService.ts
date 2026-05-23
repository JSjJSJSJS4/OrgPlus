import { supabase } from '../lib/supabaseClient'
import { RecruitmentCampaign, Application, OnboardingTemplate, ApplicationStatus, OnboardingStatus, UserRole } from '../types'
import { authService } from './authService'
import { saveStorage } from './mockData'

export const recruitmentService = {
  isMockMode: authService.isMockMode,

  // --- CAMPAIGNS ---
  async getCampaigns(): Promise<RecruitmentCampaign[]> {
    if (this.isMockMode) {
      return JSON.parse(localStorage.getItem('ep_mock_campaigns') || '[]')
    } else {
      const { data, error } = await supabase
        .from('recruitment_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as RecruitmentCampaign[]
    }
  },

  async createCampaign(campaign: Omit<RecruitmentCampaign, 'id' | 'created_at'>): Promise<RecruitmentCampaign> {
    if (this.isMockMode) {
      const campaigns: RecruitmentCampaign[] = JSON.parse(localStorage.getItem('ep_mock_campaigns') || '[]')
      const newCampaign: RecruitmentCampaign = {
        ...campaign,
        id: 'c-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }
      campaigns.push(newCampaign)
      saveStorage('ep_mock_campaigns', campaigns)
      return newCampaign;
    } else {
      const { data, error } = await supabase
        .from('recruitment_campaigns')
        .insert(campaign)
        .select()
        .single()
      
      if (error) throw error
      return data as RecruitmentCampaign
    }
  },

  async updateCampaign(id: string, updates: Partial<RecruitmentCampaign>): Promise<RecruitmentCampaign> {
    if (this.isMockMode) {
      const campaigns: RecruitmentCampaign[] = JSON.parse(localStorage.getItem('ep_mock_campaigns') || '[]')
      const idx = campaigns.findIndex(c => c.id === id)
      if (idx === -1) throw new Error('Campaign not found')
      const updated = { ...campaigns[idx], ...updates }
      campaigns[idx] = updated
      saveStorage('ep_mock_campaigns', campaigns)
      return updated
    } else {
      const { data, error } = await supabase
        .from('recruitment_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as RecruitmentCampaign
    }
  },

  // --- APPLICATIONS ---
  async getApplications(campaignId?: string): Promise<Application[]> {
    if (this.isMockMode) {
      let apps: Application[] = JSON.parse(localStorage.getItem('ep_mock_applications') || '[]')
      const profiles: any[] = JSON.parse(localStorage.getItem('ep_mock_profiles') || '[]')
      const campaigns: any[] = JSON.parse(localStorage.getItem('ep_mock_campaigns') || '[]')
      
      if (campaignId) {
        apps = apps.filter(a => a.campaign_id === campaignId)
      }

      // Map profiles and campaigns to mimic sql joins
      return apps.map(a => ({
        ...a,
        profiles: profiles.find(p => p.id === a.applicant_id),
        recruitment_campaigns: campaigns.find(c => c.id === a.campaign_id)
      }))
    } else {
      let query = supabase
        .from('applications')
        .select('*, profiles(*), recruitment_campaigns(*)')
        .order('created_at', { ascending: false })
      
      if (campaignId) {
        query = query.eq('campaign_id', campaignId)
      }

      const { data, error } = await query
      if (error) throw error
      return data as any[]
    }
  },

  async getMyApplications(): Promise<Application[]> {
    const user = await authService.getCurrentUser()
    if (!user) return []

    if (this.isMockMode) {
      const apps: Application[] = JSON.parse(localStorage.getItem('ep_mock_applications') || '[]')
      const campaigns: any[] = JSON.parse(localStorage.getItem('ep_mock_campaigns') || '[]')
      const myApps = apps.filter(a => a.applicant_id === user.id)

      return myApps.map(a => ({
        ...a,
        profiles: user,
        recruitment_campaigns: campaigns.find(c => c.id === a.campaign_id)
      }))
    } else {
      const { data, error } = await supabase
        .from('applications')
        .select('*, profiles(*), recruitment_campaigns(*)')
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as any[]
    }
  },

  async submitApplication(campaignId: string, answers: Record<string, string>, resumeUrl: string | null = null): Promise<Application> {
    const user = await authService.getCurrentUser()
    if (!user) throw new Error('Must be logged in to apply')

    if (this.isMockMode) {
      const apps: Application[] = JSON.parse(localStorage.getItem('ep_mock_applications') || '[]')
      const existing = apps.find(a => a.campaign_id === campaignId && a.applicant_id === user.id)
      if (existing) throw new Error('You have already applied to this campaign!')

      const newApp: Application = {
        id: 'a-' + Math.random().toString(36).substr(2, 9),
        campaign_id: campaignId,
        applicant_id: user.id,
        status: 'pending',
        answers,
        resume_url: resumeUrl,
        feedback: null,
        onboarding_status: 'not_started',
        onboarding_steps_completed: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      apps.push(newApp)
      saveStorage('ep_mock_applications', apps)
      return newApp
    } else {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          campaign_id: campaignId,
          applicant_id: user.id,
          answers,
          resume_url: resumeUrl
        })
        .select()
        .single()
      
      if (error) throw error
      return data as Application
    }
  },

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    if (this.isMockMode) {
      const apps: Application[] = JSON.parse(localStorage.getItem('ep_mock_applications') || '[]')
      const idx = apps.findIndex(a => a.id === id)
      if (idx === -1) throw new Error('Application not found')
      
      const updated = { 
        ...apps[idx], 
        ...updates, 
        updated_at: new Date().toISOString() 
      }
      apps[idx] = updated
      saveStorage('ep_mock_applications', apps)

      // Auto trigger onboarding start when status changes to 'approved'
      if (updates.status === 'approved' && apps[idx].onboarding_status === 'not_started') {
        updated.onboarding_status = 'in_progress'
        apps[idx] = updated
        saveStorage('ep_mock_applications', apps)
      }

      return updated
    } else {
      const { data, error } = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Application
    }
  },

  // --- ONBOARDING TEMPLATES ---
  async getOnboardingTemplates(): Promise<OnboardingTemplate[]> {
    if (this.isMockMode) {
      return JSON.parse(localStorage.getItem('ep_mock_onboarding_templates') || '[]')
    } else {
      const { data, error } = await supabase
        .from('onboarding_templates')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as OnboardingTemplate[]
    }
  },

  async createOnboardingTemplate(template: Omit<OnboardingTemplate, 'id' | 'created_at'>): Promise<OnboardingTemplate> {
    if (this.isMockMode) {
      const temps: OnboardingTemplate[] = JSON.parse(localStorage.getItem('ep_mock_onboarding_templates') || '[]')
      const newTemp: OnboardingTemplate = {
        ...template,
        id: 't-' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }
      temps.push(newTemp)
      saveStorage('ep_mock_onboarding_templates', temps)
      return newTemp
    } else {
      const { data, error } = await supabase
        .from('onboarding_templates')
        .insert(template)
        .select()
        .single()
      
      if (error) throw error
      return data as OnboardingTemplate
    }
  },

  async updateOnboardingTemplate(id: string, updates: Partial<OnboardingTemplate>): Promise<OnboardingTemplate> {
    if (this.isMockMode) {
      const temps: OnboardingTemplate[] = JSON.parse(localStorage.getItem('ep_mock_onboarding_templates') || '[]')
      const idx = temps.findIndex(t => t.id === id)
      if (idx === -1) throw new Error('Template not found')
      const updated = { ...temps[idx], ...updates }
      temps[idx] = updated
      saveStorage('ep_mock_onboarding_templates', temps)
      return updated
    } else {
      const { data, error } = await supabase
        .from('onboarding_templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as OnboardingTemplate
    }
  },

  // --- ONBOARDING PROGRESS ---
  async completeOnboardingStep(applicationId: string, stepId: string): Promise<Application> {
    if (this.isMockMode) {
      const apps: Application[] = JSON.parse(localStorage.getItem('ep_mock_applications') || '[]')
      const idx = apps.findIndex(a => a.id === applicationId)
      if (idx === -1) throw new Error('Application not found')

      const app = apps[idx]
      let steps = [...app.onboarding_steps_completed]
      if (!steps.includes(stepId)) {
        steps.push(stepId)
      }

      // Fetch campaign target role type
      const campaigns = await this.getCampaigns()
      const campaign = campaigns.find(c => c.id === app.campaign_id)
      const targetRole: UserRole = campaign?.type === 'officer' ? 'officer' : 'member'

      // Fetch onboarding template for this role target
      const templates = await this.getOnboardingTemplates()
      const template = templates.find(t => t.role_target === targetRole)
      const totalRequiredSteps = template?.steps.filter(s => s.required).map(s => s.id) || []
      
      const allRequiredCompleted = totalRequiredSteps.every(rid => steps.includes(rid))
      let onboarding_status: OnboardingStatus = 'in_progress'

      if (allRequiredCompleted) {
        onboarding_status = 'completed'
        // PROMOTE APPLICANT ROLE!
        await authService.updateProfile(app.applicant_id, { role: targetRole })
      }

      const updated = { 
        ...app, 
        onboarding_steps_completed: steps,
        onboarding_status,
        updated_at: new Date().toISOString()
      }
      apps[idx] = updated
      saveStorage('ep_mock_applications', apps)
      return updated
    } else {
      // Fetch application and check details
      const { data: appData, error: appErr } = await supabase
        .from('applications')
        .select('*, recruitment_campaigns(*)')
        .eq('id', applicationId)
        .single()
      
      if (appErr) throw appErr
      
      const currentSteps = appData.onboarding_steps_completed || []
      const newSteps = Array.from(new Set([...currentSteps, stepId]))

      const targetRole: UserRole = appData.recruitment_campaigns?.type === 'officer' ? 'officer' : 'member'
      
      const { data: temp } = await supabase
        .from('onboarding_templates')
        .select('*')
        .eq('role_target', targetRole)
        .single()

      const totalRequiredSteps = temp?.steps?.filter((s: any) => s.required).map((s: any) => s.id) || []
      const allRequiredCompleted = totalRequiredSteps.every((rid: string) => newSteps.includes(rid))
      
      let onboardingStatus: OnboardingStatus = 'in_progress'
      if (allRequiredCompleted) {
        onboardingStatus = 'completed'
        // Promote applicant's user role
        await authService.updateProfile(appData.applicant_id, { role: targetRole })
      }

      const { data, error } = await supabase
        .from('applications')
        .update({
          onboarding_steps_completed: newSteps,
          onboarding_status: onboardingStatus
        })
        .eq('id', applicationId)
        .select()
        .single()
      
      if (error) throw error
      return data as Application
    }
  }
}
