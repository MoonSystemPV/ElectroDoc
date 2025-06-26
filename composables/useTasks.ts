import { ref } from 'vue'
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/utils/firebase'
import { useTaskStore } from '~/stores/tasks'
import type { Tarea } from '~/types/tarea'
import { storeToRefs } from 'pinia'

export const useTasks = () => {
    const taskStore = useTaskStore()
    const { tasks } = storeToRefs(taskStore)

    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const createTask = async (taskData: Partial<Tarea>) => {
        isLoading.value = true
        error.value = null

        try {
            const tasksRef = collection(db, 'tareas')
            const newTaskData = {
                ...taskData,
                estado: taskData.estado || 'pendiente',
                tecnicosAsignados: taskData.tecnicosAsignados || [],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }
            const docRef = await addDoc(tasksRef, newTaskData)

            const createdTask: Tarea = {
                id: docRef.id,
                nombre: taskData.nombre || '',
                descripcion: taskData.descripcion || '',
                estado: taskData.estado || 'pendiente',
                proyectoId: taskData.proyectoId || '',
                tecnicosAsignados: taskData.tecnicosAsignados || [],
                fechaVencimiento: taskData.fechaVencimiento || null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
            taskStore.addTask(createdTask)
            return docRef.id
        } catch (err) {
            console.error('Error creating task:', err)
            error.value = 'Error al crear la tarea'
            return null
        } finally {
            isLoading.value = false
        }
    }

    const getTasksByProjectId = async (projectId: string) => {
        isLoading.value = true
        error.value = null
        try {
            const tasksRef = collection(db, 'tareas')
            const q = query(tasksRef, where('proyectoId', '==', projectId))
            const querySnapshot = await getDocs(q)
            const tasksList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Tarea[]
            taskStore.setTasks(tasksList)
            return tasksList
        } catch (err) {
            console.error('Error fetching tasks:', err)
            error.value = 'Error al cargar las tareas'
            return []
        } finally {
            isLoading.value = false
        }
    }

    const updateTask = async (id: string, taskData: Partial<Tarea>) => {
        isLoading.value = true
        error.value = null
        try {
            const taskRef = doc(db, 'tareas', id)
            await updateDoc(taskRef, { ...taskData, updatedAt: serverTimestamp() })
            taskStore.updateTask({ id, ...taskData })
            return true
        } catch (err) {
            console.error('Error updating task:', err)
            error.value = 'Error al actualizar la tarea'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const deleteTask = async (id: string) => {
        isLoading.value = true
        error.value = null
        try {
            await deleteDoc(doc(db, 'tareas', id))
            taskStore.removeTask(id)
            return true
        } catch (err) {
            console.error('Error deleting task:', err)
            error.value = 'Error al eliminar la tarea'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const loadAllTasks = async () => {
        isLoading.value = true
        error.value = null
        try {
            const tasksRef = collection(db, 'tareas')
            const querySnapshot = await getDocs(tasksRef)
            const tasksList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Tarea[]
            taskStore.setTasks(tasksList)
            return tasksList
        } catch (err) {
            console.error('Error cargando todas las tareas:', err)
            error.value = 'Error al cargar las tareas'
            return []
        } finally {
            isLoading.value = false
        }
    }

    return {
        createTask,
        getTasksByProjectId,
        updateTask,
        deleteTask,
        isLoading,
        error,
        tasks,
        loadAllTasks,
    }
} 