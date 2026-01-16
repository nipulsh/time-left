import { useState, useEffect } from 'react';
import Modal from './Modal';
import TaskForm from './TaskForm';
import type { CreateTaskData, Task, TaskGroup } from '../api/tasks';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskData) => Promise<void>;
  task?: Task | null;
  groups?: TaskGroup[];
  mode?: 'create' | 'edit';
}

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  task,
  groups = [],
  mode = 'create',
}: TaskModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: CreateTaskData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Error submitting task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const initialData = task
    ? {
        title: task.title,
        description: task.description || undefined,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        priority: task.priority as 'low' | 'normal' | 'high',
        groupId: task.groupId || undefined,
        reminderEnabled: task.reminderEnabled,
        reminderDate: task.reminderDate ? new Date(task.reminderDate) : undefined,
        repeatEnabled: task.repeatEnabled,
        repeatType: task.repeatType as 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined,
        repeatInterval: task.repeatInterval || undefined,
        repeatEndDate: task.repeatEndDate ? new Date(task.repeatEndDate) : undefined,
      }
    : undefined;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
      size="large"
    >
      <TaskForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        initialData={initialData}
        groups={groups}
      />
      {isSubmitting && (
        <div className="modal-loading">
          <div className="loading-spinner" />
          <span>Saving task...</span>
        </div>
      )}
    </Modal>
  );
}

