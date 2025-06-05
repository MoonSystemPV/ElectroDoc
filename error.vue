<template>
  <ErrorDisplay :errorMessage="error?.message || 'Error desconocido'"/>
</template>

<script setup>
import ErrorDisplay from '~/components/ui/ErrorDisplay.vue'

defineProps({
  error: Object
})
</script> 