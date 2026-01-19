import mongoose from 'mongoose';
import { Task, ITask, TaskGroup, ITaskGroup } from './models';

// MongoDB connection singleton
let isConnected = false;

export async function connectMongoDB(): Promise<void> {
  if (isConnected) {
    return;
  }

  const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017/time-left';

  try {
    await mongoose.connect(mongoUrl);
    isConnected = true;
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    console.log('MongoDB disconnected');
  }
}

// Task operations
export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: Date;
  priority?: 'low' | 'normal' | 'high';
  listName?: string;
  groupId?: string;
  reminderEnabled?: boolean;
  reminderDate?: Date;
  repeatEnabled?: boolean;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval?: number;
  repeatEndDate?: Date;
}

export async function createTask(input: CreateTaskInput) {
  await connectMongoDB();
  const taskData: any = {
    title: input.title,
    description: input.description,
    dueDate: input.dueDate,
    priority: input.priority || 'normal',
    listName: input.listName,
    reminderEnabled: input.reminderEnabled || false,
    reminderDate: input.reminderDate,
    repeatEnabled: input.repeatEnabled || false,
    repeatType: input.repeatType,
    repeatInterval: input.repeatInterval,
    repeatEndDate: input.repeatEndDate,
  };

  if (input.groupId && typeof input.groupId === 'string' && input.groupId.trim() !== '') {
    taskData.groupId = new mongoose.Types.ObjectId(input.groupId);
  } else {
    taskData.groupId = null; // Explicitly set to null for no-group tasks
  }

  const task = await Task.create(taskData);
  return await Task.findById(task._id).populate('groupId').lean();
}

export async function getTasks(includeCompleted = false, groupId?: string) {
  await connectMongoDB();
  const query: any = {};
  
  if (!includeCompleted) {
    query.completed = false;
  }
  
  // Filter by group: if groupId is provided, filter by it; if undefined, show all
  if (groupId !== undefined && groupId !== null && groupId !== '') {
    query.groupId = new mongoose.Types.ObjectId(groupId);
  } else if (groupId === null || groupId === '') {
    // Explicitly show only tasks without groups
    query.groupId = null;
  }
  // If groupId is undefined, don't filter by group (show all tasks)

  const tasks = await Task.find(query)
    .populate('groupId')
    .sort({ dueDate: 1, createdAt: -1 })
    .lean();
  
  return tasks.map((task: any) => ({
    ...task,
    id: task._id.toString(),
    groupId: task.groupId ? (typeof task.groupId === 'object' ? task.groupId._id.toString() : task.groupId.toString()) : null,
    group: task.groupId && typeof task.groupId === 'object' ? {
      id: task.groupId._id.toString(),
      name: task.groupId.name,
      color: task.groupId.color,
      description: task.groupId.description,
      createdAt: task.groupId.createdAt,
      updatedAt: task.groupId.updatedAt,
    } : null,
  }));
}

export async function updateTask(id: string, data: Partial<CreateTaskInput & { completed?: boolean }>) {
  await connectMongoDB();
  const updateData: any = { ...data };
  
  if (data.groupId && typeof data.groupId === 'string' && data.groupId.trim() !== '') {
    updateData.groupId = new mongoose.Types.ObjectId(data.groupId);
  } else {
    updateData.groupId = null; // Explicitly set to null for no-group tasks
  }

  const task = await Task.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate('groupId').lean();

  if (!task) throw new Error('Task not found');

  return {
    ...task,
    id: task._id.toString(),
    groupId: task.groupId ? (typeof task.groupId === 'object' ? task.groupId._id.toString() : task.groupId.toString()) : null,
    group: task.groupId && typeof task.groupId === 'object' ? {
      id: task.groupId._id.toString(),
      name: task.groupId.name,
      color: task.groupId.color,
      description: task.groupId.description,
      createdAt: task.groupId.createdAt,
      updatedAt: task.groupId.updatedAt,
    } : null,
  };
}

export async function deleteTask(id: string) {
  await connectMongoDB();
  await Task.findByIdAndDelete(id);
}

export async function toggleTaskComplete(id: string) {
  await connectMongoDB();
  const task = await Task.findById(id);
  if (!task) throw new Error('Task not found');
  
  task.completed = !task.completed;
  await task.save();
  
  const updated = await Task.findById(id).populate('groupId').lean();
  return {
    ...updated,
    id: updated!._id.toString(),
    groupId: updated!.groupId ? (typeof updated!.groupId === 'object' ? updated!.groupId._id.toString() : updated!.groupId.toString()) : null,
    group: updated!.groupId && typeof updated!.groupId === 'object' ? {
      id: updated!.groupId._id.toString(),
      name: updated!.groupId.name,
      color: updated!.groupId.color,
      description: updated!.groupId.description,
      createdAt: updated!.groupId.createdAt,
      updatedAt: updated!.groupId.updatedAt,
    } : null,
  };
}

// Task Group operations
export interface CreateTaskGroupInput {
  name: string;
  color?: string;
  description?: string;
}

export async function createTaskGroup(input: CreateTaskGroupInput) {
  await connectMongoDB();
  const group = await TaskGroup.create(input);
  return group.toObject();
}

export async function getTaskGroups() {
  await connectMongoDB();
  const groups = await TaskGroup.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'groupId',
        as: 'tasks',
      },
    },
    {
      $addFields: {
        _count: {
          tasks: { $size: '$tasks' },
        },
      },
    },
    {
      $sort: { name: 1 },
    },
  ]);

  return groups.map((group: any) => ({
    id: group._id.toString(),
    name: group.name,
    color: group.color,
    description: group.description,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
    _count: group._count,
  }));
}

export async function updateTaskGroup(id: string, data: Partial<CreateTaskGroupInput>) {
  await connectMongoDB();
  const group = await TaskGroup.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  ).lean();

  if (!group) throw new Error('Task group not found');

  return {
    id: group._id.toString(),
    name: group.name,
    color: group.color,
    description: group.description,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

export async function deleteTaskGroup(id: string) {
  await connectMongoDB();
  // Set groupId to null for all tasks with this group
  await Task.updateMany(
    { groupId: new mongoose.Types.ObjectId(id) },
    { $set: { groupId: null } }
  );
  await TaskGroup.findByIdAndDelete(id);
}
