'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useProjects } from '@/hooks/useProjects'
import { useLanguage } from '@/contexts/LanguageContext'
import { UserService } from '@/lib/services/user.service'
import { User } from '@/types'
import Spinner from '@/components/ui/Spinner'
import { Users, Mail, User as UserIcon } from 'lucide-react'
import styles from './page.module.css'
import Badge from '@/components/ui/Badge'

export default function TeamPage() {
  const { t } = useLanguage()
  const { user, loading: authLoading } = useAuth()
  const { projects } = useProjects(user?.uid || null)
  const [teamMembers, setTeamMembers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!user || !projects.length) {
        setLoading(false)
        return
      }

      // Collect all unique members from user's projects
      const memberIds = new Set<string>()
      projects.forEach((project) => {
        if (project.members) {
          Object.keys(project.members).forEach((id) => memberIds.add(id))
        }
      })

      try {
         if (memberIds.size > 0) {
            const members = await UserService.getUsersByIds(Array.from(memberIds))
            setTeamMembers(members)
         } else {
             setTeamMembers([])
         }
      } catch (error) {
          console.error("Failed to fetch team members", error)
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchTeamMembers()
    }
  }, [user, authLoading, projects])

  if (authLoading || loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>{t('team.pleaseLogin')}</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('team.pageTitle')}</h1>
        <p className={styles.subtitle}>
          {t('team.subtitle')}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>{t('team.projectsCount', { count: projects.length })}</div>
          <div className={styles.cardContent}>
            <div className={styles.projectsList}>
              {projects.length === 0 ? (
                <p className={styles.emptyText}>{t('team.noProjects')}</p>
              ) : (
                projects.map((project) => (
                  <div key={project.id} className={styles.projectItem}>
                    <div className={styles.projectName}>{project.name}</div>
                    <div className={styles.projectMembers}>
                      {project.members ? Object.keys(project.members).length : 0} {t('team.membersCount')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>{t('team.teamMembersCount', { count: teamMembers.length })}</div>
          <div className={styles.cardContent}>
             {teamMembers.length === 0 ? (
                 <p className={styles.emptyText}>{t('team.noTeamMembers')}</p>
             ) : (
                 <div className={styles.membersGrid}>
                    {teamMembers.map(member => (
                        <div key={member.uid} className={styles.memberCard}>
                            <div className={styles.memberHeader}>
                                {member.photoURL ? (
                                    <img src={member.photoURL} alt={member.displayName} className={styles.avatar} />
                                ) : (
                                    <div className={styles.avatarPlaceholder}>
                                        <UserIcon size={24} />
                                    </div>
                                )}
                                <div className={styles.memberInfo}>
                                    <div className={styles.memberName}>{member.displayName || t('team.user')}</div>
                                    <div className={styles.memberEmail}>
                                        <Mail size={12} style={{marginRight: 4}} />
                                        {member.email}
                                    </div>
                                </div>
                            </div>
                            <div className={styles.memberRole}>
                                <Badge variant="secondary" size="sm">{t('team.member')}</Badge>
                                {/* Logic to show "Admin" or project count could go here */}
                            </div>
                        </div>
                    ))}
                 </div>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
