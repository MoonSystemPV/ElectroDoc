<template>
  <div 
    class="notification-item p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
    :class="{ 'bg-blue-50': !notification.read }"
  >
    <div class="flex items-start">
      <div 
        class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3"
        :class="{
          'bg-blue-100 text-blue-600': notification.type === 'document',
          'bg-green-100 text-green-600': notification.type === 'project',
          'bg-yellow-100 text-yellow-600': notification.type === 'alert',
          'bg-purple-100 text-purple-600': notification.type === 'system'
        }"
      >
        <span class="material-icons text-lg">
          {{ getNotificationIcon(notification.type) }}
        </span>
      </div>
      
      <div class="flex-grow">
        <div class="flex items-center justify-between">
          <h4 class="text-sm font-medium text-gray-900">{{ notification.title }}</h4>
          <span class="text-xs text-gray-500">{{ formatDate(notification.timestamp) }}</span>
        </div>
        
        <p class="text-sm text-gray-600 mt-1">{{ notification.message }}</p>
        
        <div v-if="notification.actionUrl" class="mt-2">
          <button 
            @click="navigateTo(notification)"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver detalles
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'mark-as-read'])

// Helper functions
const formatDate = (date: Date) => {
  return format(date, 'dd MMM, HH:mm', { locale: es })
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'document':
      return 'description'
    case 'project':
      return 'folder'
    case 'alert':
      return 'warning'
    case 'system':
      return 'notifications'
    default:
      return 'notifications'
  }
}

const navigateTo = (notification: any) => {
  if (!notification.read) {
    emit('mark-as-read', notification.id)
  }
  
  emit('click', notification)
}
</script> 