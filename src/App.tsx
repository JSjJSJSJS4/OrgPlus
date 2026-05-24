import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import { AuthPage } from './pages/auth/AuthPage'
import { MainLayout } from './components/layouts/MainLayout'
import { DashboardOverview } from './pages/dashboard/DashboardOverview'
import { RecruitmentPage } from './pages/recruitment/RecruitmentPage'
import { ScreeningPage } from './pages/admin/ScreeningPage'
import { OnboardingPage } from './pages/recruitment/OnboardingPage'
import { EventsPage } from './pages/events/EventsPage'
import { EventProposalsPage } from './pages/events/EventProposalsPage'
import { EventDashboard } from './pages/events/EventDashboard'
import { ProfilePage } from './pages/profile/ProfilePage'
import { PublicLayout } from './components/layouts/PublicLayout'
import { LandingPage } from './pages/landing/LandingPage'
import { MemberDashboard } from './pages/dashboard/MemberDashboard'
import { ApplicantPortal } from './pages/recruitment/ApplicantPortal'
import { useEffect } from 'react'

const AppContent: React.FC = () => {
  const { user, loading } = useAuth()
  
  // Default tab based on role loaded
  const [currentTab, setCurrentTab] = useState<string>('dashboard')
  const [selectedEventIdForManage, setSelectedEventIdForManage] = useState<string | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false)

  // Align tab and preview states when user changes
  useEffect(() => {
    if (user) {
      setIsPreviewMode(false)
      if (user.role === 'applicant' || user.role === 'member') {
        setCurrentTab('home')
      } else {
        setCurrentTab('dashboard')
      }
    }
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center gap-4 text-slate-100">
        <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
        <h2 className="text-sm font-extrabold tracking-wide uppercase text-purple-400">Loading OrgPlus...</h2>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  const isPublicLayout = user.role === 'applicant' || user.role === 'member' || isPreviewMode

  // Render active tab view
  const renderTabView = () => {
    if (isPublicLayout) {
      switch (currentTab) {
        case 'home':
          return <LandingPage setCurrentTab={setCurrentTab} userRole={user.role} />
        case 'recruitment':
          return <ApplicantPortal setCurrentTab={setCurrentTab} />
        case 'onboarding':
          return <OnboardingPage />
        case 'member-dashboard':
          return <MemberDashboard />
        case 'profile':
          return <ProfilePage />
        default:
          return <LandingPage setCurrentTab={setCurrentTab} userRole={user.role} />
      }
    }

    switch (currentTab) {
      case 'dashboard':
        return <DashboardOverview setCurrentTab={setCurrentTab} />
      case 'recruitment':
        return <RecruitmentPage />
      case 'screening':
        return <ScreeningPage />
      case 'onboarding':
        return <OnboardingPage />
      case 'events':
        return (
          <EventsPage 
            setSelectedEventIdForManage={setSelectedEventIdForManage}
            setCurrentTab={setCurrentTab}
          />
        )
      case 'proposals':
        return <EventProposalsPage />
      case 'profile':
        return <ProfilePage />
      case 'event-dashboard':
        return selectedEventIdForManage ? (
          <EventDashboard 
            eventId={selectedEventIdForManage} 
            onBack={() => {
              setSelectedEventIdForManage(null)
              setCurrentTab('events')
            }}
          />
        ) : (
          <DashboardOverview setCurrentTab={setCurrentTab} />
        )
      default:
        return <DashboardOverview setCurrentTab={setCurrentTab} />
    }
  }

  if (isPublicLayout) {
    return (
      <PublicLayout 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab}
        isAdminPreview={isPreviewMode}
        onExitPreview={() => {
          setIsPreviewMode(false)
          setCurrentTab('dashboard')
        }}
      >
        {renderTabView()}
      </PublicLayout>
    )
  }

  return (
    <MainLayout 
      currentTab={currentTab} 
      setCurrentTab={setCurrentTab}
      onEnterPreview={() => {
        setIsPreviewMode(true)
        setCurrentTab('home')
      }}
    >
      {renderTabView()}
    </MainLayout>
  )
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
