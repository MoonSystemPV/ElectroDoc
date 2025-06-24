import { defineStore } from 'pinia'
import type { Tarea } from '~/types/tarea'

export const useTaskStore = defineStore('task', {
    state: () => ({
        tasks: [] as Tarea[],
        isLoading: false,
        error: null as string | null,
    }),
    actions: {
        setTasks(tasks: Tarea[]) {
            this.tasks = tasks
        },
        addTask(task: Tarea) {
            this.tasks.push(task)
        },
        updateTask(updatedTask: Partial<Tarea>) {
            const index = this.tasks.findIndex(task => task.id === updatedTask.id)
            if (index !== -1) {
                Object.assign(this.tasks[index], updatedTask)
            }
        },
        removeTask(id: string) {
            this.tasks = this.tasks.filter(task => task.id !== id)
        },
        setLoading(status: boolean) {
            this.isLoading = status
        },
        setError(message: string | null) {
            this.error = message
        },
    },
    getters: {
        getTaskById: (state) => (id: string) => {
            return state.tasks.find(task => task.id === id)
        },
    },
}) 