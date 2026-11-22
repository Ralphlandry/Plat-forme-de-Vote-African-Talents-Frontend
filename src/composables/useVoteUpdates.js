import { onMounted, onUnmounted } from 'vue'
import { voteEventsService } from '../services'

export function useVoteUpdates(refresh) {
  let socket
  let reconnectTimer
  let reconnectDelay = 1000
  let hasConnected = false
  let disposed = false
  let refreshing = false
  let refreshPending = false

  const refreshVotes = async () => {
    if (refreshing) {
      refreshPending = true
      return
    }

    refreshing = true
    do {
      refreshPending = false
      try {
        await refresh()
      } catch (error) {
        console.error('Impossible d’actualiser les votes après leur modification.', error)
      }
    } while (refreshPending)
    refreshing = false
  }

  const connect = () => {
    if (disposed) return

    socket = voteEventsService.connect()
    socket.addEventListener('open', () => {
      reconnectDelay = 1000
      if (hasConnected) void refreshVotes()
      hasConnected = true
    })
    socket.addEventListener('message', (message) => {
      try {
        const event = JSON.parse(message.data)
        if (event.event === 'votes.updated') void refreshVotes()
      } catch (error) {
        console.error('Événement de vote reçu dans un format invalide.', error)
      }
    })
    socket.addEventListener('close', () => {
      if (disposed) return
      reconnectTimer = window.setTimeout(connect, reconnectDelay)
      reconnectDelay = Math.min(reconnectDelay * 2, 30000)
    })
    socket.addEventListener('error', () => socket.close())
  }

  onMounted(connect)
  onUnmounted(() => {
    disposed = true
    window.clearTimeout(reconnectTimer)
    socket?.close()
  })
}
