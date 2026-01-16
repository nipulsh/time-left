// Task API - Clean interface for task operations
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: Date | null;
  priority: string;
  listName: string | null;
  groupId: string | null;
  group: TaskGroup | null;
  reminderEnabled: boolean;
  reminderDate: Date | null;
  repeatEnabled: boolean;
  repeatType: string | null;
  repeatInterval: number | null;
  repeatEndDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskGroup {
  id: string;
  name: string;
  color: string | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    tasks: number;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate?: Date | string;
  priority?: 'low' | 'normal' | 'high';
  listName?: string;
  groupId?: string;
  reminderEnabled?: boolean;
  reminderDate?: Date | string;
  repeatEnabled?: boolean;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval?: number;
  repeatEndDate?: Date | string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date | string | null;
  priority?: 'low' | 'normal' | 'high';
  listName?: string;
  groupId?: string | null;
  reminderEnabled?: boolean;
  reminderDate?: Date | string | null;
  repeatEnabled?: boolean;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
  repeatInterval?: number | null;
  repeatEndDate?: Date | string | null;
  completed?: boolean;
}

export interface CreateTaskGroupData {
  name: string;
  color?: string;
  description?: string;
}

// Fetch all tasks
export async function fetchTasks(includeCompleted = false, groupId?: string): Promise<Task[]> {
  try {
    const tasks = await window.electron?.ipcRenderer.invoke(
      'db:get-tasks',
      includeCompleted,
      groupId
    );
    return (tasks as Task[]) || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to fetch tasks');
  }
}

// Create a new task
export async function createTask(data: CreateTaskData): Promise<Task> {
  try {
    const taskData = {
      ...data,
      dueDate: data.dueDate
        ? typeof data.dueDate === 'string'
          ? new Date(data.dueDate)
          : data.dueDate
        : undefined,
      reminderDate: data.reminderDate
        ? typeof data.reminderDate === 'string'
          ? new Date(data.reminderDate)
          : data.reminderDate
        : undefined,
      repeatEndDate: data.repeatEndDate
        ? typeof data.repeatEndDate === 'string'
          ? new Date(data.repeatEndDate)
          : data.repeatEndDate
        : undefined,
    };

    const task = await window.electron?.ipcRenderer.invoke(
      'db:create-task',
      taskData
    );
    return task as Task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw new Error('Failed to create task');
  }
}

// Update an existing task
export async function updateTask(
  id: string,
  data: UpdateTaskData
): Promise<Task> {
  try {
    const updateData = {
      ...data,
      dueDate:
        data.dueDate !== undefined
          ? data.dueDate === null
            ? null
            : typeof data.dueDate === 'string'
            ? new Date(data.dueDate)
            : data.dueDate
          : undefined,
      reminderDate:
        data.reminderDate !== undefined
          ? data.reminderDate === null
            ? null
            : typeof data.reminderDate === 'string'
            ? new Date(data.reminderDate)
            : data.reminderDate
          : undefined,
      repeatEndDate:
        data.repeatEndDate !== undefined
          ? data.repeatEndDate === null
            ? null
            : typeof data.repeatEndDate === 'string'
            ? new Date(data.repeatEndDate)
            : data.repeatEndDate
          : undefined,
    };

    const task = await window.electron?.ipcRenderer.invoke(
      'db:update-task',
      id,
      updateData
    );
    return task as Task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
}

// Delete a task
export async function deleteTask(id: string): Promise<void> {
  try {
    await window.electron?.ipcRenderer.invoke('db:delete-task', id);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
}

// Toggle task completion status
export async function toggleTask(id: string): Promise<Task> {
  try {
    const task = await window.electron?.ipcRenderer.invoke('db:toggle-task', id);
    return task as Task;
  } catch (error) {
    console.error('Error toggling task:', error);
    throw new Error('Failed to toggle task');
  }
}

// Get a single task by ID
export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const tasks = await fetchTasks(true);
    return tasks.find((task) => task.id === id) || null;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw new Error('Failed to fetch task');
  }
}

// Task Group operations
export async function fetchTaskGroups(): Promise<TaskGroup[]> {
  try {
    const groups = await window.electron?.ipcRenderer.invoke('db:get-groups');
    return (groups as TaskGroup[]) || [];
  } catch (error) {
    console.error('Error fetching task groups:', error);
    throw new Error('Failed to fetch task groups');
  }
}

export async function createTaskGroup(data: CreateTaskGroupData): Promise<TaskGroup> {
  try {
    const group = await window.electron?.ipcRenderer.invoke('db:create-group', data);
    return group as TaskGroup;
  } catch (error) {
    console.error('Error creating task group:', error);
    throw new Error('Failed to create task group');
  }
}

export async function updateTaskGroup(
  id: string,
  data: Partial<CreateTaskGroupData>
): Promise<TaskGroup> {
  try {
    const group = await window.electron?.ipcRenderer.invoke('db:update-group', id, data);
    return group as TaskGroup;
  } catch (error) {
    console.error('Error updating task group:', error);
    throw new Error('Failed to update task group');
  }
}

export async function deleteTaskGroup(id: string): Promise<void> {
  try {
    await window.electron?.ipcRenderer.invoke('db:delete-group', id);
  } catch (error) {
    console.error('Error deleting task group:', error);
    throw new Error('Failed to delete task group');
  }
}
