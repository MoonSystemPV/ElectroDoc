<template>
  <MainLayout v-if="isAuthenticated && !isAuthRoute">
    <slot />
  </MainLayout>
  <div v-else>
    <slot />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// Check if current route is an auth route (login, register, etc.)
const isAuthRoute = computed(() => {
  return route.path.startsWith('/login') || 
         route.path.startsWith('/register') || 
         route.path.startsWith('/forgot-password') ||
         route.path === '/'
})

// In a real app, this would be from the auth store
// For now, we'll simulate being authenticated if not on an auth route
const isAuthenticated = computed(() => {
  return !isAuthRoute.value
})
</script> 