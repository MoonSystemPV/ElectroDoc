export interface User {
  id: string
  nombre: string
  email: string
  role: 'tecnico' | 'administrativo' | 'supervisor'
  createdAt?: Date
  lastLogin?: Date
  activo?: boolean
} 