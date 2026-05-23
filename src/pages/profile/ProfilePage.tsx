import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import { 
  User, 
  Mail, 
  Award, 
  ShieldCheck, 
  Camera, 
  Save 
} from 'lucide-react'

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth()
  const { showToast } = useToast()

  const [fullName, setFullName] = useState<string>(user?.full_name || '')
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '')
  const [updating, setUpdating] = useState<boolean>(false)

  if (!user) return null

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName) {
      showToast('Validation Error', 'Full name cannot be empty', 'warning')
      return
    }

    setUpdating(true)
    try {
      const { error } = await authService.updateProfile(user.id, {
        full_name: fullName,
        avatar_url: avatarUrl || null
      })

      if (error) throw error
      
      showToast('Profile Updated', 'Your profile details were saved successfully!', 'success')
      await refreshUser()
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Failed to update profile', 'error')
    } finally {
      setUpdating(false)
    }
  }

  // Pre-configured funny avatar options
  const avatarSeeds = ['Arthur', 'Guinevere', 'Lancelot', 'Galahad', 'Robin', 'Merlin', 'Morgana']

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group shrink-0">
          <img
            src={avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.full_name}`}
            alt={user.full_name}
            className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-purple-500/30 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center md:text-left overflow-hidden">
          <h2 className="text-lg font-bold text-white leading-tight">{user.full_name}</h2>
          <p className="text-xs text-slate-400 mt-1">{user.email}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
            <span className="px-3 py-1 rounded-xl text-[10px] font-bold border border-purple-500/20 text-purple-400 bg-purple-950/20 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Role Level: <strong className="uppercase">{user.role.replace('_', ' ')}</strong>
            </span>
            <span className="px-3 py-1 rounded-xl text-[10px] font-bold border border-blue-500/20 text-blue-400 bg-blue-950/20 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Permissions Secured
            </span>
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-6 border-b border-slate-900 pb-3">Edit Profile Settings</h3>
        
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
              <User className="w-4 h-4 text-purple-400" /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
              <Mail className="w-4 h-4 text-purple-400" /> Email Address (Read-only)
            </label>
            <input
              type="email"
              disabled
              value={user.email}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/50 border border-slate-900 text-xs text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 font-semibold mb-2">Select Avatar Seed (Dicebear Style)</label>
            <div className="flex flex-wrap gap-2">
              {avatarSeeds.map(seed => {
                const url = `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`
                const isSelected = avatarUrl === url
                return (
                  <button
                    key={seed}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`p-1 rounded-xl border-2 transition-all shrink-0 cursor-pointer ${
                      isSelected ? 'border-purple-500 bg-purple-950/20' : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
                    }`}
                  >
                    <img src={url} alt={seed} className="w-10 h-10 rounded-lg" />
                  </button>
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full py-3 rounded-xl bg-gradient-button text-xs font-bold text-white shadow-lg flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            {updating ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile Details
              </>
            )}
          </button>
        </form>
      </div>

    </div>
  )
}
