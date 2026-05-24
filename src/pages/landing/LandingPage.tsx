import React, { useState, useEffect } from 'react'
import { recruitmentService } from '../../services/recruitmentService'
import { eventService } from '../../services/eventService'
import { RecruitmentCampaign, Event } from '../../types'
import { Logo } from '../../components/common/Logo'
import { 
  Compass, 
  Target, 
  Users, 
  Award, 
  ArrowRight, 
  Sparkles, 
  Heart, 
  CheckCircle,
  Calendar,
  Layers,
  MapPin
} from 'lucide-react'

interface LandingPageProps {
  setCurrentTab: (tab: string) => void
  userRole?: string
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentTab, userRole }) => {
  const [activeCampaigns, setActiveCampaigns] = useState<RecruitmentCampaign[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLandingData = async () => {
      setLoading(true)
      try {
        const camps = await recruitmentService.getCampaigns()
        setActiveCampaigns(camps.filter(c => c.status === 'active'))

        const evs = await eventService.getEvents()
        setFeaturedEvents(evs.filter(e => e.status === 'completed' || e.status === 'approved').slice(0, 3))
      } catch (err) {
        console.error('Failed to load landing page data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLandingData()
  }, [])

  const officers = [
    {
      name: 'Arthur Pendragon',
      role: 'Super Admin',
      title: 'President & Founder',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Arthur',
      quote: 'Building the next generation of campus leaders through technology and collaboration.'
    },
    {
      name: 'Guinevere Vance',
      role: 'Officer',
      title: 'Vice President of Operations',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Guinevere',
      quote: 'Ensuring seamless workflow pipelines, budget management, and event proposals.'
    },
    {
      name: 'Lancelot du Lac',
      role: 'Committee Head',
      title: 'Technical Director',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lancelot',
      quote: 'Directing technical committees for our annual hackathons and speaker workshops.'
    }
  ]

  const galleryImages = [
    {
      title: 'Spring Leadership Summit',
      desc: 'Annual management conference',
      category: 'Conference',
      gradient: 'from-purple-600/40 to-blue-500/40'
    },
    {
      title: 'Tech Annex Hackathon',
      desc: '24-hour programming sprint',
      category: 'Competition',
      gradient: 'from-fuchsia-600/40 to-pink-500/40'
    },
    {
      title: 'Orientation Social',
      desc: 'Welcoming general members',
      category: 'Social Event',
      gradient: 'from-emerald-600/40 to-teal-500/40'
    },
    {
      title: 'AI & Ethics Seminar',
      desc: 'Expert panel discussions',
      category: 'Seminar',
      gradient: 'from-amber-600/40 to-orange-500/40'
    }
  ]

  return (
    <div className="space-y-20 pb-10">
      
      {/* 1. HERO COVER SECTION */}
      <section className="relative rounded-3xl overflow-hidden min-h-[500px] flex items-center p-8 sm:p-12 md:p-16 border border-slate-200/25 dark:border-white/5 bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-950 dark:from-[#0b0f19] dark:via-[#0f172a] dark:to-[#311042]/60">
        {/* Subtle grid decoration */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
        
        {/* Floating circles decoration */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-2xl space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-950/50 border border-purple-500/30 text-purple-400">
            <Sparkles className="w-3.5 h-3.5" /> Empowering Student Leadership
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white leading-tight">
            Shape the Future of Campus Life with <span className="text-gradient">OrgPlus</span>
          </h1>
          
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-lg">
            Welcome to the premier platform for school organization management. Whether you want to apply as a new member, coordinate events in committees, or direct board operations, OrgPlus connects it all.
          </p>

          <div className="pt-4 flex flex-wrap gap-3.5">
            {userRole === 'applicant' ? (
              <button 
                onClick={() => setCurrentTab('recruitment')}
                className="px-6 py-3 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer flex items-center gap-2 group transition-all"
              >
                Apply to Join Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : userRole === 'member' ? (
              <button 
                onClick={() => setCurrentTab('member-dashboard')}
                className="px-6 py-3 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer flex items-center gap-2 group transition-all"
              >
                Go to Member Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={() => setCurrentTab('member-dashboard')}
                className="px-6 py-3 bg-gradient-button text-xs font-bold text-white rounded-xl shadow-lg cursor-pointer flex items-center gap-2 group transition-all"
              >
                Preview Portals <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            <a 
              href="#about"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white rounded-xl cursor-pointer transition-all inline-block"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* 2. RECRUITMENT SPOTLIGHT SECTION */}
      {activeCampaigns.length > 0 && (
        <section className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Recruitment Spotlight</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Join Our Open Positions</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We are actively looking for talented students to shape next semester. Browse open campaigns and apply.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {activeCampaigns.map(c => (
              <div 
                key={c.id} 
                className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-purple-500/10 hover:border-purple-500/30 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="text-left">
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-purple-50 border border-purple-200 text-purple-700 dark:bg-purple-950/40 dark:border-purple-500/20 dark:text-purple-400">
                      {c.type} recruitment
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Active Campaign</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-4">{c.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">{c.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-900/60 flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {c.end_date ? `Closes: ${new Date(c.end_date).toLocaleDateString()}` : 'Rolling application'}
                  </span>
                  <button
                    onClick={() => setCurrentTab('recruitment')}
                    className="px-4 py-2 bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200 hover:border-transparent dark:bg-purple-950/30 dark:hover:bg-purple-600 dark:text-purple-400 dark:hover:text-white dark:border-purple-500/30 dark:hover:border-transparent text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1"
                  >
                    Open Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. MISSION & VISION */}
      <section id="about" className="grid md:grid-cols-3 gap-6 text-left">
        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-8">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-4">Our Core Mission</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              We empower student communities by introducing structured software, creating opportunities for team collaborations, leadership growth, and building high-impact student events.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold uppercase tracking-wider">Mission Statement</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-8">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-450">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-4">Our Future Vision</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              To be the digital hub of academic student life, creating a seamless bridge where every student can discover roles, register for events, and contribute to campus milestones.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-455 font-bold uppercase tracking-wider">Vision Statement</span>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-8">
          <div>
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-4">Pillars of Excellence</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              We operate under core principles of visual design systems, security (Row Level Security database safeguards), structural event reporting, and role-based workflows.
            </p>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold uppercase tracking-wider">Organizational Pillars</span>
        </div>
      </section>

      {/* 4. OFFICER HIGHLIGHTS */}
      <section className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Executive Board</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Meet Our Leaders</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The passionate executive committee managing campaign setups, applicant screenings, and event approvals.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 text-left">
          {officers.map(off => (
            <div key={off.name} className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-850 flex flex-col items-center text-center space-y-4 relative">
              <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0">
                <img src={off.avatar} alt={off.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{off.name}</h4>
                <p className="text-[9px] font-extrabold uppercase text-purple-600 dark:text-purple-400 tracking-wider mt-1">{off.title}</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic border-t border-slate-100 dark:border-slate-900/60 pt-3">
                "{off.quote}"
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FEATURED ACTIVITIES GALLERY */}
      <section className="space-y-6">
        <div className="text-center max-w-lg mx-auto space-y-2">
          <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Snapshots</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Featured Org Activities</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            A visual overview of the major workshops, seminar talks, and social drives hosted by our committees.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galleryImages.map((img, i) => (
            <div 
              key={i} 
              className="group rounded-2xl overflow-hidden aspect-[4/3] border border-slate-200 dark:border-slate-800 relative cursor-pointer"
            >
              {/* Background color gradient block */}
              <div className={`absolute inset-0 bg-gradient-to-tr ${img.gradient} group-hover:scale-110 transition-transform duration-500`} />
              
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-colors" />

              {/* Text metadata */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-left bg-gradient-to-t from-slate-950/90 to-transparent">
                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-purple-950/60 border border-purple-500/20 text-purple-400">
                  {img.category}
                </span>
                <h4 className="text-xs font-bold text-white mt-1.5 truncate">{img.title}</h4>
                <p className="text-[10px] text-slate-350 mt-0.5 truncate">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. RECENT COMPLETED/FEATURED EVENTS FEED */}
      {featuredEvents.length > 0 && (
        <section className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-2">
            <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">Events Feed</span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Featured Announcements</h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Take a look at the details of our latest public event schedule.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-left">
            {featuredEvents.map(ev => (
              <div key={ev.id} className="p-6 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 dark:text-slate-400 dark:bg-slate-900 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                      {new Date(ev.date).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase bg-purple-50 dark:bg-purple-950/25 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-400">
                      {ev.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{ev.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">{ev.description}</p>
                </div>
                
                <div className="space-y-2 mt-5 text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-900/60 pt-4">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
