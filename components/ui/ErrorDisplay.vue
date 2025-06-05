<template>
  <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
    <div class="flex">
      <div class="flex-shrink-0">
        <span class="material-icons text-red-400">error</span>
      </div>
      <div class="ml-3">
        <p class="text-sm text-red-700 dark:text-red-200">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  error: {
    type: String,
    default: ''
  }
})
</script> 