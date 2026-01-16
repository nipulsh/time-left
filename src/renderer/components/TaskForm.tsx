import { useState, useEffect } from 'react';
import type { CreateTaskData, TaskGroup } from '../api/tasks';
import * as taskAPI from '../api/tasks';

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<CreateTaskData>;
  groups?: TaskGroup[];
}

export default function TaskForm({
  onSubmit,
  onCancel,
  initialData,
  groups = [],
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(
    initialData?.dueDate
      ? typeof initialData.dueDate === 'string'
        ? initialData.dueDate.split('T')[0]
        : new Date(initialData.dueDate).toISOString().split('T')[0]
      : ''
  );
  const [priority, setPriority] = useState<'low' | 'normal' | 'high'>(
    initialData?.priority || 'normal'
  );
  const [groupId, setGroupId] = useState(initialData?.groupId || '');

  // Reminder fields
  const [reminderEnabled, setReminderEnabled] = useState(
    initialData?.reminderEnabled || false
  );
  const [reminderDate, setReminderDate] = useState(
    initialData?.reminderDate
      ? typeof initialData.reminderDate === 'string'
        ? initialData.reminderDate.split('T')[0]
        : new Date(initialData.reminderDate).toISOString().split('T')[0]
      : ''
  );
  const [reminderTime, setReminderTime] = useState(
    initialData?.reminderDate
      ? typeof initialData.reminderDate === 'string'
        ? initialData.reminderDate.split('T')[1]?.substring(0, 5) || ''
        : new Date(initialData.reminderDate).toTimeString().substring(0, 5)
      : '09:00'
  );

  // Repeat fields
  const [repeatEnabled, setRepeatEnabled] = useState(
    initialData?.repeatEnabled || false
  );
  const [repeatType, setRepeatType] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >((initialData?.repeatType as any) || 'daily');
  const [repeatInterval, setRepeatInterval] = useState(
    initialData?.repeatInterval || 1
  );
  const [repeatEndDate, setRepeatEndDate] = useState(
    initialData?.repeatEndDate
      ? typeof initialData.repeatEndDate === 'string'
        ? initialData.repeatEndDate.split('T')[0]
        : new Date(initialData.repeatEndDate).toISOString().split('T')[0]
      : ''
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData: CreateTaskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined,
      priority,
      groupId: groupId || undefined,
      reminderEnabled,
      reminderDate:
        reminderEnabled && reminderDate && reminderTime
          ? `${reminderDate}T${reminderTime}:00`
          : undefined,
      repeatEnabled,
      repeatType: repeatEnabled ? repeatType : undefined,
      repeatInterval: repeatEnabled ? repeatInterval : undefined,
      repeatEndDate: repeatEnabled && repeatEndDate ? repeatEndDate : undefined,
    };

    await onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="task-form-section">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title *"
          required
          className="task-form-input"
          autoFocus
        />
      </div>

      <div className="task-form-section">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={3}
          className="task-form-textarea"
        />
      </div>

      <div className="task-form-row">
        <div className="task-form-field">
          <label className="task-form-label">Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="task-form-input"
          />
        </div>

        <div className="task-form-field">
          <label className="task-form-label">Priority</label>
          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as 'low' | 'normal' | 'high')
            }
            className="task-form-select"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="task-form-section">
        <label className="task-form-label">Group</label>
        <select
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          className="task-form-select"
        >
          <option value="">No Group</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      <div className="task-form-section">
        <label className="task-form-checkbox-label">
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
            className="task-form-checkbox"
          />
          <span>Set Reminder</span>
        </label>
        {reminderEnabled && (
          <div className="task-form-row" style={{ marginTop: '8px' }}>
            <input
              type="date"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              className="task-form-input"
              style={{ flex: 1 }}
            />
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="task-form-input"
              style={{ width: '100px' }}
            />
          </div>
        )}
      </div>

      <div className="task-form-section">
        <label className="task-form-checkbox-label">
          <input
            type="checkbox"
            checked={repeatEnabled}
            onChange={(e) => setRepeatEnabled(e.target.checked)}
            className="task-form-checkbox"
          />
          <span>Repeat Task</span>
        </label>
        {repeatEnabled && (
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="task-form-row">
              <select
                value={repeatType}
                onChange={(e) =>
                  setRepeatType(
                    e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                  )
                }
                className="task-form-select"
                style={{ flex: 1 }}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <input
                type="number"
                min="1"
                value={repeatInterval}
                onChange={(e) => setRepeatInterval(parseInt(e.target.value) || 1)}
                className="task-form-input"
                style={{ width: '80px' }}
                placeholder="Every"
              />
            </div>
            <div>
              <label className="task-form-label">End Date (optional)</label>
              <input
                type="date"
                value={repeatEndDate}
                onChange={(e) => setRepeatEndDate(e.target.value)}
                className="task-form-input"
              />
            </div>
          </div>
        )}
      </div>

      <div className="task-form-actions">
        <button type="button" onClick={onCancel} className="task-form-button-cancel">
          Cancel
        </button>
        <button type="submit" className="task-form-button-submit">
          Save Task
        </button>
      </div>
    </form>
  );
}

