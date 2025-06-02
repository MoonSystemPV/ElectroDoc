<template>
  <span 
    class="badge"
    :class="colorClass"
  >
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value: string) => {
      return ['default', 'success', 'info', 'warning', 'danger'].includes(value)
    }
  },
  outlined: {
    type: Boolean,
    default: false
  }
})

const colorClass = computed(() => {
  if (props.outlined) {
    switch (props.type) {
      case 'success':
        return 'bg-transparent text-green-700 border border-green-700'
      case 'info':
        return 'bg-transparent text-blue-700 border border-blue-700'
      case 'warning':
        return 'bg-transparent text-yellow-700 border border-yellow-700'
      case 'danger':
        return 'bg-transparent text-red-700 border border-red-700'
      default:
        return 'bg-transparent text-gray-700 border border-gray-700'
    }
  } else {
    switch (props.type) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'danger':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }
})
</script>

<style scoped>
.badge {
  @apply inline-flex px-2 py-0.5 rounded text-xs font-medium;
}
</style> 