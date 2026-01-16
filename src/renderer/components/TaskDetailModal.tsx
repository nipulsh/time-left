import Modal from './Modal';
import type { Task } from '../api/tasks';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onEdit,
  onDelete,
}: TaskDetailModalProps) {
  if (!task) return null;

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return 'Not set';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Task Details" size="medium">
      <div className="task-detail-content">
        <div className="task-detail-header">
          <h3 className="task-detail-title">{task.title}</h3>
          <div className={`task-detail-status ${task.completed ? 'completed' : 'pending'}`}>
            {task.completed ? '✓ Completed' : '○ Pending'}
          </div>
        </div>

        {task.description && (
          <div className="task-detail-section">
            <label className="task-detail-label">Description</label>
            <p className="task-detail-value">{task.description}</p>
          </div>
        )}

        <div className="task-detail-grid">
          <div className="task-detail-section">
            <label className="task-detail-label">Due Date</label>
            <p className="task-detail-value">{formatDate(task.dueDate)}</p>
          </div>

          <div className="task-detail-section">
            <label className="task-detail-label">Priority</label>
            <p className={`task-detail-value priority-${task.priority}`}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </p>
          </div>

          {task.group && (
            <div className="task-detail-section">
              <label className="task-detail-label">Group</label>
              <p className="task-detail-value">
                {task.group.color && (
                  <span
                    className="task-group-color"
                    style={{ background: task.group.color }}
                  />
                )}
                {task.group.name}
              </p>
            </div>
          )}

          {task.reminderEnabled && (
            <div className="task-detail-section">
              <label className="task-detail-label">Reminder</label>
              <p className="task-detail-value">{formatDateTime(task.reminderDate)}</p>
            </div>
          )}

          {task.repeatEnabled && (
            <div className="task-detail-section">
              <label className="task-detail-label">Repeat</label>
              <p className="task-detail-value">
                Every {task.repeatInterval || 1} {task.repeatType}
                {task.repeatEndDate && ` until ${formatDate(task.repeatEndDate)}`}
              </p>
            </div>
          )}
        </div>

        <div className="task-detail-meta">
          <div className="task-detail-section">
            <label className="task-detail-label">Created</label>
            <p className="task-detail-value">{formatDateTime(task.createdAt)}</p>
          </div>
          <div className="task-detail-section">
            <label className="task-detail-label">Last Updated</label>
            <p className="task-detail-value">{formatDateTime(task.updatedAt)}</p>
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div className="task-detail-actions">
            {onEdit && (
              <button
                type="button"
                className="task-detail-button edit"
                onClick={onEdit}
              >
                Edit Task
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="task-detail-button delete"
                onClick={onDelete}
              >
                Delete Task
              </button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

