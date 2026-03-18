import { useCallback, useEffect, useState } from 'react'
import { database } from '@/lib/firebase/config'
import { ref, push, update, remove, onValue, query, orderByChild, equalTo } from 'firebase/database'
import { WorkflowRule, WorkflowExecution } from '@/types/workflow'
import { getUserFriendlyError } from '@/lib/utils/errorHandler'

export function useWorkflowRules(projectId: string | null) {
  const [rules, setRules] = useState<WorkflowRule[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen for rules in real-time
  useEffect(() => {
    if (!projectId) {
      setRules([])
      setLoading(false)
      return
    }

    const rulesRef = ref(database, 'workflowRules')
    const rulesQuery = query(rulesRef, orderByChild('projectId'), equalTo(projectId))

    const unsubscribe = onValue(
      rulesQuery,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const rulesList = Object.entries(data).map(([id, ruleData]: [string, any]) => ({
            id,
            ...ruleData,
          }))
          setRules(rulesList.sort((a, b) => b.createdAt - a.createdAt))
        } else {
          setRules([])
        }
        setLoading(false)
      },
      (err) => {
        console.error('Error fetching workflow rules:', err)
        setError(getUserFriendlyError(err, 'useWorkflowRules'))
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [projectId])

  // Listen for execution history
  useEffect(() => {
    if (!projectId) {
      setExecutions([])
      return
    }

    const execRef = ref(database, 'workflowExecutions')
    const execQuery = query(execRef, orderByChild('projectId'), equalTo(projectId))

    const unsubscribe = onValue(
      execQuery,
      (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const execList = Object.entries(data).map(([id, execData]: [string, any]) => ({
            id,
            ...execData,
          }))
          setExecutions(execList.sort((a, b) => b.executedAt - a.executedAt).slice(0, 50))
        } else {
          setExecutions([])
        }
      }
    )

    return () => unsubscribe()
  }, [projectId])

  const createRule = useCallback(
    async (ruleData: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
      try {
        if (!projectId) throw new Error('Project ID is required')

        const newRef = push(ref(database, 'workflowRules'))
        const ruleId = newRef.key

        await update(newRef, {
          ...ruleData,
          projectId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })

        return ruleId!
      } catch (err) {
        setError(getUserFriendlyError(err, 'useWorkflowRules'))
        throw err
      }
    },
    [projectId]
  )

  const updateRule = useCallback(
    async (ruleId: string, updates: Partial<WorkflowRule>): Promise<void> => {
      try {
        await update(ref(database, `workflowRules/${ruleId}`), {
          ...updates,
          updatedAt: Date.now(),
        })
      } catch (err) {
        setError(getUserFriendlyError(err, 'useWorkflowRules'))
        throw err
      }
    },
    []
  )

  const deleteRule = useCallback(
    async (ruleId: string): Promise<void> => {
      try {
        await remove(ref(database, `workflowRules/${ruleId}`))
      } catch (err) {
        setError(getUserFriendlyError(err, 'useWorkflowRules'))
        throw err
      }
    },
    []
  )

  const toggleRule = useCallback(
    async (ruleId: string, enabled: boolean): Promise<void> => {
      await updateRule(ruleId, { enabled })
    },
    [updateRule]
  )

  const logExecution = useCallback(
    async (execution: Omit<WorkflowExecution, 'id'>): Promise<void> => {
      try {
        const newRef = push(ref(database, 'workflowExecutions'))
        await update(newRef, execution)
      } catch (err) {
        console.error('Error logging workflow execution:', err)
      }
    },
    []
  )

  return {
    rules,
    executions,
    loading,
    error,
    createRule,
    updateRule,
    deleteRule,
    toggleRule,
    logExecution,
  }
}
