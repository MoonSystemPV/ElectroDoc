import { ref } from 'vue'

const toast = ref({
  message: '',
  type: 'success' as 'success' | 'error' | 'info',
  show: false
})

export function useToast() {
  function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
    toast.value = { message, type, show: true }
    setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }
  return { toast, showToast }
} 