import { NotificationService } from './notification.service'

export const CommentService = {
  /**
   * Parse @mentions from comment text
   * Returns array of userIds mentioned
   */
  parseMentions(text: string): string[] {
    const mentionRegex = /@(\w+)/g
    const mentions: string[] = []
    let match

    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1]
      // In a real implementation, you'd need to map username to userId
      // For now, we'll store the username and resolve it elsewhere
      mentions.push(username)
    }

    return [...new Set(mentions)] // Remove duplicates
  },

  /**
   * Notify users mentioned in a comment
   */
  async notifyMentionedUsers(
    mentions: string[],
    taskId: string,
    commentText: string,
    commenterName: string,
    taskTitle: string,
    taskLink?: string
  ): Promise<void> {
    // This would need to be implemented with a mapping of usernames to userIds
    // For now, we'll log that mentions were found
    if (mentions.length > 0) {
      console.log(
        `Mentions found in comment: ${mentions.join(', ')} on task "${taskTitle}" by ${commenterName}`
      )

      // In a real implementation:
      // for (const userId of mentionedUserIds) {
      //   await NotificationService.notifyTaskMention(
      //     userId,
      //     taskTitle,
      //     commenterName,
      //     commentText.substring(0, 100),
      //     taskLink
      //   )
      // }
    }
  },

  /**
   * Format mentions in text with markdown links
   */
  formatMentionsForDisplay(text: string, mentions: string[]): string {
    let formattedText = text

    for (const mention of mentions) {
      const regex = new RegExp(`@${mention}`, 'g')
      formattedText = formattedText.replace(regex, `**@${mention}**`)
    }

    return formattedText
  },

  /**
   * Extract comment snippet for notifications
   */
  getCommentSnippet(text: string, maxLength: number = 50): string {
    const snippet = text.substring(0, maxLength)
    return snippet.length < text.length ? `${snippet}...` : snippet
  },
}
