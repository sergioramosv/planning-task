import { useCallback, useEffect, useState } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { Proposal, ProposalStatus } from '@/types/proposal'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export function useProposals(projectId: string | null) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!projectId) {
      setProposals([])
      setLoading(false)
      return
    }

    const proposalsRef = ref(database, `proposals`)
    const proposalsQuery = query(proposalsRef, orderByChild('projectId'), equalTo(projectId))

    const unsubscribe = onValue(
      proposalsQuery,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const proposalsList = Object.entries(data).map(([id, proposalData]: [string, any]) => ({
            id,
            ...proposalData,
          }))
          // Filtrar solo las pendientes por defecto
          setProposals(proposalsList.filter(p => p.status === 'pending'))
        } else {
          setProposals([])
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching proposals:', err)
        setError(getUserFriendlyError(err, 'useProposals'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  // Crear propuesta
  const createProposal = useCallback(
    async (
      proposalData: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<string> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        const newProposalRef = push(ref(database, 'proposals'))
        const proposalId = newProposalRef.key

        await update(newProposalRef, {
          ...proposalData,
          projectId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        return proposalId!
      } catch (err) {
        setError(getUserFriendlyError(err, 'useProposals'))
        throw err
      }
    },
    [projectId]
  )

  // Actualizar estado de propuesta
  const updateProposalStatus = useCallback(
    async (proposalId: string, status: ProposalStatus): Promise<void> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        await update(ref(database, `proposals/${proposalId}`), {
          status,
          updatedAt: Date.now(),
        })
      } catch (err) {
        setError(getUserFriendlyError(err, 'useProposals'))
        throw err
      }
    },
    [projectId]
  )

  // Eliminar propuesta
  const deleteProposal = useCallback(
    async (proposalId: string): Promise<void> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        await remove(ref(database, `proposals/${proposalId}`))
      } catch (err) {
        setError(getUserFriendlyError(err, 'useProposals'))
        throw err
      }
    },
    [projectId]
  )

  return {
    proposals,
    loading,
    error,
    createProposal,
    updateProposalStatus,
    deleteProposal,
  }
}
