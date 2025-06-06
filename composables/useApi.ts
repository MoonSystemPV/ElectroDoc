import { useRuntimeConfig } from '#app'

export function useApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  const createUser = async (userData: any) => {
    try {
      const response = await fetch(`${baseURL}/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })
      return await response.json()
    } catch (error) {
      console.error('Error al crear usuario:', error)
      throw error
    }
  }

  const deleteUser = async (uid: string) => {
    try {
      const response = await fetch(`${baseURL}/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid }),
      })
      return await response.json()
    } catch (error) {
      console.error('Error al eliminar usuario:', error)
      throw error
    }
  }

  return {
    createUser,
    deleteUser,
  }
} 