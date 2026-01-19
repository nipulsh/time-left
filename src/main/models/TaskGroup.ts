import mongoose, { Schema, Document, Model } from 'mongoose';

// TaskGroup Interface
export interface ITaskGroup extends Document {
  name: string;
  color?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual properties
  taskCount: number;
}

// TaskGroup Schema
const TaskGroupSchema = new Schema<ITaskGroup>(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
      minlength: [1, 'Group name must be at least 1 character'],
      maxlength: [100, 'Group name cannot exceed 100 characters'],
      unique: true,
    },
    color: {
      type: String,
      trim: true,
      validate: {
        validator: function (value: string) {
          if (!value) return true;
          // Validate hex color format
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
        },
        message: 'Color must be a valid hex color code (e.g., #FF5733)',
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for better query performance
TaskGroupSchema.index({ name: 1 });
TaskGroupSchema.index({ createdAt: -1 });

// Virtual: Get task count for this group
TaskGroupSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'groupId',
  count: true,
});

// Pre-save hook: Ensure color is set (generate random if not provided)
TaskGroupSchema.pre('save', async function () {
  if (!this.color) {
    // Generate a random color
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#ef4444',
      '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
});

// Instance method: Get all tasks in this group
TaskGroupSchema.methods.getTasks = async function (this: ITaskGroup) {
  const Task = mongoose.model('Task');
  return await Task.find({ groupId: this._id });
};

// Instance method: Get incomplete tasks in this group
TaskGroupSchema.methods.getIncompleteTasks = async function (this: ITaskGroup) {
  const Task = mongoose.model('Task');
  return await Task.find({ groupId: this._id, completed: false });
};

// Export TaskGroup Model type for static methods
export interface ITaskGroupModel extends Model<ITaskGroup> {
  findByName(name: string): mongoose.Query<ITaskGroup | null, ITaskGroup>;
}

// Add static method to the schema
TaskGroupSchema.statics.findByName = function (name: string) {
  return this.findOne({ name: new RegExp(`^${name}$`, 'i') });
};

// Export the model
export const TaskGroup = mongoose.model<ITaskGroup, ITaskGroupModel>('TaskGroup', TaskGroupSchema);
