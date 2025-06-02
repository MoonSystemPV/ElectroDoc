<template>
  <div class="notification-list max-h-96 overflow-y-auto">
    <div v-if="isLoading" class="py-8 text-center text-gray-500">
      <div class="animate-spin mx-auto h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      <p class="mt-2">Cargando notificaciones...</p>
    </div>
    
    <div v-else-if="notifications.length === 0" class="py-10 text-center text-gray-500">
      <span class="material-icons text-4xl mb-2">notifications_off</span>
      <p>No tienes notificaciones</p>
    </div>
    
    <template v-else>
      <NotificationItem 
        v-for="notification in notifications"
        :key="notification.id"
        :notification="notification"
        @click="onNotificationClick"
        @mark-as-read="markAsRead"
      />
    </template>
    
    <div v-if="hasMoreNotifications && !isLoading" class="p-3 text-center">
      <button 
        @click="loadMore"
        class="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Ver más notificaciones
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Components
import NotificationItem from './NotificationItem.vue'

const props = defineProps({
  limit: {
    type: Number,
    default: 5
  }
})

// Composables
const router = useRouter()
const { 
  notifications, 
  getNotifications, 
  markAsRead: markNotificationAsRead,
  isLoading,
  totalCount 
} = useNotifications()

// State
const currentLimit = ref(props.limit)

// Computed
const hasMoreNotifications = computed(() => {
  return notifications.value.length < totalCount.value
})

// Methods
const loadNotifications = async () => {
  await getNotifications(currentLimit.value)
}

const loadMore = async () => {
  currentLimit.value += 5
  await loadNotifications()
}

const onNotificationClick = (notification: any) => {
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
  }
}

const markAsRead = async (notificationId: string) => {
  await markNotificationAsRead(notificationId)
}

// Lifecycle
onMounted(async () => {
  await loadNotifications()
})
</script> 