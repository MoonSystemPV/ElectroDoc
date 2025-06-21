export interface Tarea {
    id: string
    nombre: string
    descripcion?: string
    estado: 'pendiente' | 'completada' | 'atrasada'
    proyectoId: string
    tecnicosAsignados: string[]
    fechaVencimiento?: Date | null
    createdAt: Date
    updatedAt: Date
} 