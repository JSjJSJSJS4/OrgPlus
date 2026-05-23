import React, { useState, useEffect } from 'react'
import { eventService } from '../../services/eventService'
import { useToast } from '../../context/ToastContext'
import { Event } from '../../types'
import { 
  FileCheck, 
  Clock, 
  MapPin, 
  FileText, 
  ThumbsUp, 
  ThumbsDown,
  Info,
  Calendar
} from 'lucide-react'

export const EventProposalsPage: React.FC = () => {
  const { showToast } = useToast()

  const [proposals, setProposals] = useState<Event[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  
  // Review state
  const [selectedProp, setSelectedProp] = useState<Event | null>(null)
  const [reviewNotes, setReviewNotes] = useState<string>('')
  const [reviewing, setReviewing] = useState<boolean>(false)

  const loadProposals = async () => {
    setLoading(true)
    try {
      const evs = await eventService.getEvents()
      const pends = evs.filter(e => e.status === 'proposal_pending')
      setProposals(pends)
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to fetch event proposals', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProposals()
  }, [])

  const handleReview = async (eventId: string, approve: boolean) => {
    setReviewing(true)
    try {
      const nextStatus = approve ? 'approved' : 'rejected'
      await eventService.updateEventStatus(eventId, nextStatus, reviewNotes)
      showToast(
        approve ? 'Proposal Approved' : 'Proposal Rejected',
        approve ? 'Event is now published for registration!' : 'Proposal marked as rejected.',
        approve ? 'success' : 'info'
      )
      setSelectedProp(null)
      setReviewNotes('')
      loadProposals()
    } catch (err: any) {
      showToast('Review Failed', err.message || 'Failed to submit proposal review', 'error')
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-purple-400" /> Event Review Console
        </h2>
        <p className="text-xs text-slate-400 mt-1">Review event proposals submitted by organization members and committee leads. Approvals publish events to the schedule.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></span>
          <p className="text-xs text-slate-400 font-semibold">Fetching proposals queue...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-bold text-sm">Proposal Queue Empty</p>
          <p className="text-slate-500 text-xs mt-1">There are no pending event proposals requiring your review at this time.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {proposals.map(prop => (
            <div key={prop.id} className="p-6 rounded-2xl glass-panel glass-panel-hover flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center gap-3">
                  <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    Needs Approval
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Proposed by: {prop.proposal_profile?.full_name || 'Member'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-4 leading-tight">{prop.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{prop.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-5 p-3 rounded-xl bg-slate-950/20 text-[10px] text-slate-400 border border-slate-900">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{new Date(prop.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{prop.location}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedProp(prop)}
                className="mt-6 w-full py-2 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/20 hover:border-transparent text-xs font-bold rounded-xl transition-all cursor-pointer text-center"
              >
                Review Proposal
              </button>
            </div>
          ))}
        </div>
      )}

      {/* REVIEW DETAILS MODAL */}
      {selectedProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl glass-panel p-6 rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedProp(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg"
            >
              &times;
            </button>

            <h3 className="text-lg font-bold text-white mb-2">{selectedProp.title}</h3>
            
            <div className="grid grid-cols-2 gap-4 my-4 p-3.5 rounded-xl bg-slate-950/20 border border-slate-900 text-xs text-slate-300">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">Proposed Date:</span>
                <span className="font-semibold">{new Date(selectedProp.date).toLocaleString()}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 block">Location:</span>
                <span className="font-semibold">{selectedProp.location}</span>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Event Summary & Agenda</h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-4 rounded-xl border border-slate-900">
                {selectedProp.description}
              </p>
            </div>

            {/* Decision Board */}
            <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-3">
                Review Decision & Response Notes
              </h4>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Include details regarding budget approval, logistics scheduling, or adjustments needed before approving."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  disabled={reviewing}
                  onClick={() => handleReview(selectedProp.id, false)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-950/30 border border-rose-900/40 text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-950/50 transition-all cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" /> Reject Proposal
                </button>
                <button
                  disabled={reviewing}
                  onClick={() => handleReview(selectedProp.id, true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-button text-white text-xs font-bold rounded-xl shadow-lg cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" /> Approve & Schedule
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
