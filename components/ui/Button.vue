<template>
  <button
    :type="type"
    class="btn"
    :class="[sizeClass, variantClass, { 'opacity-50 cursor-not-allowed': disabled }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="flex items-center justify-center">
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4" :class="spinnerColorClass" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span v-if="loadingText">{{ loadingText }}</span>
    </span>
    <span v-else>
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'button'
  },
  variant: {
    type: String,
    default: 'primary',
    validator: (value: string) => {
      return ['primary', 'secondary', 'danger', 'success', 'warning', 'info'].includes(value)
    }
  },
  size: {
    type: String,
    default: 'md',
    validator: (value: string) => {
      return ['sm', 'md', 'lg'].includes(value)
    }
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2.5 py-1.5 text-xs'
    case 'lg':
      return 'px-6 py-3 text-base'
    default:
      return 'px-4 py-2 text-sm'
  }
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
    case 'secondary':
      return 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500'
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500'
    case 'success':
      return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
    case 'warning':
      return 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500'
    case 'info':
      return 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500'
    default:
      return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
  }
})

const spinnerColorClass = computed(() => {
  return ['primary', 'danger', 'success', 'warning', 'info'].includes(props.variant) 
    ? 'text-white' 
    : 'text-gray-800'
})
</script>

<style scoped>
.btn {
  @apply font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors inline-flex items-center justify-center;
}
</style> 