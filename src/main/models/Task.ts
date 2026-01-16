import mongoose, { Schema, Document, Model } from 'mongoose';

// Task Interface
export interface ITask extends Document {
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: Date;
  priority: 'low' | 'normal' | 'high';
  listName?: string;
  groupId?: mongoose.Types.ObjectId;
  reminderEnabled: boolean;
  reminderDate?: Date;
  repeatEnabled: boolean;
  repeatType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  repeatInterval?: number;
  repeatEndDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  isOverdue: boolean;
  isDueToday: boolean;
  isDueTomorrow: boolean;
  
  // Instance methods
  markComplete(): Promise<ITask>;
  markIncomplete(): Promise<ITask>;
  toggleComplete(): Promise<ITask>;
}

// Task Schema
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [1, 'Task title must be at least 1 character'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (this: ITask, value: Date) {
          if (!value) return true;
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Invalid due date',
      },
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'normal', 'high'],
        message: 'Priority must be low, normal, or high',
      },
      default: 'normal',
    },
    listName: {
      type: String,
      trim: true,
      maxlength: [100, 'List name cannot exceed 100 characters'],
    },
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskGroup',
      validate: {
        validator: async function (this: ITask, value: mongoose.Types.ObjectId) {
          if (!value) return true;
          const TaskGroup = mongoose.model('TaskGroup');
          const group = await TaskGroup.findById(value);
          return !!group;
        },
        message: 'Invalid task group',
      },
    },
    reminderEnabled: {
      type: Boolean,
      default: false,
    },
    reminderDate: {
      type: Date,
      validate: {
        validator: function (this: ITask, value: Date) {
          if (!value) return true;
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Invalid reminder date',
      },
    },
    repeatEnabled: {
      type: Boolean,
      default: false,
    },
    repeatType: {
      type: String,
      enum: {
        values: ['daily', 'weekly', 'monthly', 'yearly'],
        message: 'Repeat type must be daily, weekly, monthly, or yearly',
      },
    },
    repeatInterval: {
      type: Number,
      min: [1, 'Repeat interval must be at least 1'],
      validate: {
        validator: function (this: ITask, value: number) {
          if (!this.repeatEnabled) return true;
          return value && value > 0;
        },
        message: 'Repeat interval is required when repeat is enabled',
      },
    },
    repeatEndDate: {
      type: Date,
      validate: {
        validator: function (this: ITask, value: Date) {
          if (!value) return true;
          if (!this.repeatEnabled) return true;
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: 'Invalid repeat end date',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
TaskSchema.index({ completed: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ groupId: 1 });
TaskSchema.index({ reminderDate: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ createdAt: -1 });
TaskSchema.index({ completed: 1, dueDate: 1 }); // Compound index for common queries

// Virtual: Check if task is overdue
TaskSchema.virtual('isOverdue').get(function (this: ITask) {
  if (!this.dueDate || this.completed) return false;
  const now = new Date();
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return due < now;
});

// Virtual: Check if task is due today
TaskSchema.virtual('isDueToday').get(function (this: ITask) {
  if (!this.dueDate) return false;
  const today = new Date();
  const due = new Date(this.dueDate);
  return (
    today.getFullYear() === due.getFullYear() &&
    today.getMonth() === due.getMonth() &&
    today.getDate() === due.getDate()
  );
});

// Virtual: Check if task is due tomorrow
TaskSchema.virtual('isDueTomorrow').get(function (this: ITask) {
  if (!this.dueDate) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const due = new Date(this.dueDate);
  return (
    tomorrow.getFullYear() === due.getFullYear() &&
    tomorrow.getMonth() === due.getMonth() &&
    tomorrow.getDate() === due.getDate()
  );
});

// Instance method: Mark task as complete
TaskSchema.methods.markComplete = async function (this: ITask): Promise<ITask> {
  this.completed = true;
  return await this.save();
};

// Instance method: Mark task as incomplete
TaskSchema.methods.markIncomplete = async function (this: ITask): Promise<ITask> {
  this.completed = false;
  return await this.save();
};

// Instance method: Toggle completion status
TaskSchema.methods.toggleComplete = async function (this: ITask): Promise<ITask> {
  this.completed = !this.completed;
  return await this.save();
};

// Export Task Model type for static methods
export interface ITaskModel extends Model<ITask> {
  findOverdue(): mongoose.Query<ITask[], ITask>;
  findDueToday(): mongoose.Query<ITask[], ITask>;
  findByPriority(priority: 'low' | 'normal' | 'high'): mongoose.Query<ITask[], ITask>;
}

// Add static methods to the schema
TaskSchema.statics.findOverdue = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return this.find({
    completed: false,
    dueDate: { $lt: today },
  });
};

TaskSchema.statics.findDueToday = function () {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);
  return this.find({
    completed: false,
    dueDate: { $gte: startOfDay, $lte: endOfDay },
  });
};

TaskSchema.statics.findByPriority = function (priority: 'low' | 'normal' | 'high') {
  return this.find({ priority, completed: false });
};

// Export the model
export const Task = mongoose.model<ITask, ITaskModel>('Task', TaskSchema);
