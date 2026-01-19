import { useState, useEffect, useCallback } from 'react';
import './App.css';
import * as taskAPI from './api/tasks';
import type { Task, CreateTaskData, TaskGroup } from './api/tasks';
import TaskModal from './components/TaskModal';
import TaskDetailModal from './components/TaskDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import Modal from './components/Modal';
import GroupsManagement from './components/GroupsManagement';

// Icons
const SunIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const CalendarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    width="10"
    height="10"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ChecklistIcon = () => (
  <svg
    className="empty-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
  >
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

// Countdown Component
function Countdown() {
  const calculateTimeLeft = () => {
    const difference = +new Date('2030-07-27T00:00:00') - +new Date();
    let timeLeft: { [key: string]: number } = {};

    if (difference > 0) {
      timeLeft = {
        years: Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25)),
        months: Math.floor((difference / (1000 * 60 * 60 * 24 * 30.44)) % 12),
        days: Math.floor((difference / (1000 * 60 * 60 * 24)) % 30.44),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const padNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="countdown-section">
      <div className="countdown-label">27 July 2030</div>
      <div className="countdown-grid">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="countdown-item">
            <span className="countdown-value">{padNumber(value)}</span>
            <span className="countdown-unit">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tasks Panel Component
function TasksPanel({
  expanded,
  tasks,
  taskGroups,
  selectedGroupId,
  loading,
  error,
  onRetry,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onTaskClick,
  showAddTask,
  onShowAddTask,
  onSelectGroup,
  showAddGroup,
  onShowAddGroup,
  newGroupName,
  onNewGroupNameChange,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onShowGroupsManagement,
}: {
  expanded: boolean;
  tasks: Task[];
  taskGroups: TaskGroup[];
  selectedGroupId?: string;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onAddTask: (data: CreateTaskData) => Promise<void>;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onTaskClick: (task: Task) => void;
  showAddTask: boolean;
  onShowAddTask: (show: boolean) => void;
  onSelectGroup: (groupId: string | undefined) => void;
  showAddGroup: boolean;
  onShowAddGroup: (show: boolean) => void;
  newGroupName: string;
  onNewGroupNameChange: (value: string) => void;
  onAddGroup: (e: React.FormEvent) => void;
  onEditGroup: (group: TaskGroup) => void;
  onDeleteGroup: (group: TaskGroup) => void;
  onShowGroupsManagement: (show: boolean) => void;
}) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const allTasksCount = incompleteTasks.length;

  const formatDbDueDate = (dueDate: Date | null) => {
    if (!dueDate) return null;
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isOverdue =
      date < today && date.toDateString() !== today.toDateString();
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    let label = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (isToday) label = 'Today';
    if (isTomorrow) label = 'Tomorrow';

    return { label, isOverdue };
  };

  return (
    <div className={`tasks-panel ${expanded ? 'expanded' : ''}`}>
      <div className="tasks-header">
        <span className="tasks-title">My Tasks</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {allTasksCount > 0 && (
            <span className="tasks-count">{allTasksCount} tasks</span>
          )}
          <button
            type="button"
            onClick={() => onShowAddTask(!showAddTask)}
            style={{
              padding: '4px 8px',
              background: 'var(--accent-primary)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            + Add
          </button>
          <button
            type="button"
            onClick={() => onShowGroupsManagement(true)}
            style={{
              padding: '4px 8px',
              background: 'var(--countdown-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
            title="Manage Groups"
          >
            Edit Groups
          </button>
        </div>
      </div>

      {/* Task Groups */}
      <div className="task-groups">
        <div className="task-groups-list">
          <button
            type="button"
            className={`task-group-chip ${!selectedGroupId ? 'active' : ''}`}
            onClick={() => onSelectGroup(undefined)}
          >
            All
          </button>
          {taskGroups.map((group) => (
            <div
              key={group.id}
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                const menu = e.currentTarget.querySelector('.group-menu');
                if (menu) (menu as HTMLElement).style.display = 'flex';
              }}
              onMouseLeave={(e) => {
                const menu = e.currentTarget.querySelector('.group-menu');
                if (menu) (menu as HTMLElement).style.display = 'none';
              }}
            >
              <button
                type="button"
                className={`task-group-chip ${
                  selectedGroupId === group.id ? 'active' : ''
                }`}
                onClick={() => onSelectGroup(group.id)}
              >
                {group.color && (
                  <span
                    className="task-group-color"
                    style={{ background: group.color }}
                  />
                )}
                {group.name}
                {group._count && group._count.tasks > 0 && (
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>
                    ({group._count.tasks})
                  </span>
                )}
              </button>
              <div
                className="group-menu"
                style={{
                  display: 'none',
                  position: 'absolute',
                  right: '0',
                  top: '100%',
                  marginTop: '4px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '4px',
                  zIndex: 10,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditGroup(group);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--countdown-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteGroup(group);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-danger, #ef4444)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--countdown-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="task-group-add"
            onClick={() => onShowAddGroup(!showAddGroup)}
          >
            + Group
          </button>
        </div>
        {showAddGroup && (
          <form
            onSubmit={onAddGroup}
            style={{ marginTop: '8px', display: 'flex', gap: '6px' }}
          >
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => onNewGroupNameChange(e.target.value)}
              placeholder="Group name"
              style={{
                flex: 1,
                padding: '6px 10px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '11px',
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                background: 'var(--accent-primary)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                onShowAddGroup(false);
                onNewGroupNameChange('');
              }}
              style={{
                padding: '6px 12px',
                background: 'var(--countdown-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </form>
        )}
      </div>


      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <div className="loading-text">Loading tasks...</div>
        </div>
      ) : error ? (
        <div className="error-state">
          <div className="error-text">{error}</div>
          <button type="button" className="retry-button" onClick={onRetry}>
            Try again
          </button>
        </div>
      ) : allTasksCount === 0 ? (
        <div className="empty-state">
          <ChecklistIcon />
          <div className="empty-title">All caught up!</div>
          <div className="empty-description">No pending tasks</div>
        </div>
      ) : (
        <div className="tasks-list">
          {/* Database Tasks */}
          {incompleteTasks.map((task) => {
            const due = formatDbDueDate(task.dueDate);
            return (
              <div
                key={task.id}
                className="task-item"
                style={{ cursor: 'pointer' }}
              >
                <div
                  className={`task-checkbox ${
                    task.completed ? 'completed' : ''
                  }`}
                  onClick={() => onToggleTask(task.id)}
                />
                <div
                  className="task-content"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div
                      style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        marginTop: '2px',
                      }}
                    >
                      {task.description}
                    </div>
                  )}
                  <div className="task-meta">
                    {due && (
                      <span
                        className={`task-due ${due.isOverdue ? 'overdue' : ''}`}
                      >
                        <CalendarIcon />
                        {due.label}
                      </span>
                    )}
                    {task.priority && task.priority !== 'normal' && (
                      <span className={`task-badge priority-${task.priority}`}>
                        {task.priority}
                      </span>
                    )}
                    {task.reminderEnabled && (
                      <span className="task-badge reminder">Reminder</span>
                    )}
                    {task.repeatEnabled && (
                      <span className="task-badge repeat">Repeat</span>
                    )}
                    {task.group && (
                      <span
                        className="task-list-name"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {task.group.color && (
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: task.group.color,
                            }}
                          />
                        )}
                        {task.group.name}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    opacity: 0.6,
                  }}
                  title="Delete task"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Main App Component
export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'dark';
  });

  const [expanded, setExpanded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showEditGroup, setShowEditGroup] = useState(false);
  const [showDeleteGroupConfirm, setShowDeleteGroupConfirm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<TaskGroup | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');
  const [showGroupsManagement, setShowGroupsManagement] = useState(false);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Handle window resize based on expansion
  useEffect(() => {
    const height = expanded ? 500 : 200;
    window.electron?.ipcRenderer.sendMessage('resize-window', [height]);
  }, [expanded]);

  // Fetch task groups
  const fetchTaskGroups = useCallback(async () => {
    try {
      const groups = await taskAPI.fetchTaskGroups();
      setTaskGroups(groups);
    } catch (err) {
      console.error('Error fetching task groups:', err);
    }
  }, []);

  // Fetch tasks from database
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedTasks = await taskAPI.fetchTasks(false, selectedGroupId);
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId]);

  // Load tasks and groups when expanded
  useEffect(() => {
    if (expanded) {
      fetchTaskGroups();
      fetchTasks();
    }
  }, [expanded, fetchTasks, fetchTaskGroups]);

  // Add new task
  const handleAddTask = async (data: CreateTaskData) => {
    try {
      await taskAPI.createTask(data);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  // Edit task
  const handleEditTask = async (data: CreateTaskData) => {
    if (!selectedTask) return;
    try {
      await taskAPI.updateTask(selectedTask.id, data);
      await fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  // Add new task group
  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      await taskAPI.createTaskGroup({
        name: newGroupName.trim(),
        color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      });
      setNewGroupName('');
      setShowAddGroup(false);
      await fetchTaskGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  // Edit task group
  const handleEditGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !editingGroupName.trim()) return;

    try {
      await taskAPI.updateTaskGroup(selectedGroup.id, {
        name: editingGroupName.trim(),
      });
      setEditingGroupName('');
      setShowEditGroup(false);
      setSelectedGroup(null);
      await fetchTaskGroups();
      // Always refresh tasks to update group names in task list
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  // Delete task group
  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    try {
      await taskAPI.deleteTaskGroup(selectedGroup.id);
      setShowDeleteGroupConfirm(false);
      setSelectedGroup(null);
      // If we were viewing this group, switch to "All"
      if (selectedGroupId === selectedGroup.id) {
        setSelectedGroupId(undefined);
      }
      await fetchTaskGroups();
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  // Open edit group modal
  const handleEditGroupClick = (group: TaskGroup) => {
    setSelectedGroup(group);
    setEditingGroupName(group.name);
    setShowEditGroup(true);
  };

  // Open delete group confirmation
  const handleDeleteGroupClick = (group: TaskGroup) => {
    setSelectedGroup(group);
    setShowDeleteGroupConfirm(true);
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    try {
      await taskAPI.deleteTask(selectedTask.id);
      await fetchTasks();
      setSelectedTask(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Open task detail modal
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskDetail(true);
  };

  // Open edit modal from detail modal
  const handleEditFromDetail = () => {
    setShowTaskDetail(false);
    setShowEditTask(true);
  };

  // Open delete confirm from detail modal
  const handleDeleteFromDetail = () => {
    setShowTaskDetail(false);
    setShowDeleteConfirm(true);
  };

  // Toggle task completion
  const handleToggleTask = async (id: string) => {
    try {
      await taskAPI.toggleTask(id);
      await fetchTasks();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-container">
      <div className="header">
        <span className="header-title">Time Left</span>
        <div className="header-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>

      <Countdown />

      <div className="expand-section">
        <button
          type="button"
          className={`expand-button ${expanded ? 'expanded' : ''}`}
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? 'Hide Tasks' : 'Show Tasks'}</span>
          <ChevronDownIcon />
        </button>
      </div>

      <TasksPanel
        expanded={expanded}
        tasks={tasks}
        taskGroups={taskGroups}
        selectedGroupId={selectedGroupId}
        loading={loading}
        error={error}
        onRetry={fetchTasks}
        onAddTask={handleAddTask}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onTaskClick={handleTaskClick}
        showAddTask={showAddTask}
        onShowAddTask={setShowAddTask}
        onSelectGroup={setSelectedGroupId}
        showAddGroup={showAddGroup}
        onShowAddGroup={setShowAddGroup}
        newGroupName={newGroupName}
        onNewGroupNameChange={setNewGroupName}
        onAddGroup={handleAddGroup}
        onEditGroup={handleEditGroupClick}
        onDeleteGroup={handleDeleteGroupClick}
        onShowGroupsManagement={setShowGroupsManagement}
      />

      {/* Modals */}
      <TaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onSubmit={handleAddTask}
        groups={taskGroups}
        mode="create"
      />

      <TaskModal
        isOpen={showEditTask}
        onClose={() => {
          setShowEditTask(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
        task={selectedTask}
        groups={taskGroups}
        mode="edit"
      />

      <TaskDetailModal
        isOpen={showTaskDetail}
        onClose={() => {
          setShowTaskDetail(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        itemName={selectedTask?.title}
      />

      {/* Edit Group Modal */}
      {showEditGroup && selectedGroup && (
        <Modal
          isOpen={showEditGroup}
          onClose={() => {
            setShowEditGroup(false);
            setSelectedGroup(null);
            setEditingGroupName('');
          }}
          title="Edit Group"
          size="small"
        >
          <form
            onSubmit={handleEditGroup}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}
              >
                Group Name
              </label>
              <input
                type="text"
                value={editingGroupName}
                onChange={(e) => setEditingGroupName(e.target.value)}
                placeholder="Group name"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                }}
                autoFocus
              />
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setShowEditGroup(false);
                  setSelectedGroup(null);
                  setEditingGroupName('');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'var(--countdown-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  background: 'var(--accent-primary)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Group Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteGroupConfirm}
        onClose={() => {
          setShowDeleteGroupConfirm(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleDeleteGroup}
        title="Delete Group"
        itemName={selectedGroup?.name}
        message="All tasks in this group will be moved to 'No Group'. This action cannot be undone."
      />

      {/* Groups Management Modal */}
      <GroupsManagement
        isOpen={showGroupsManagement}
        onClose={() => setShowGroupsManagement(false)}
        onGroupsUpdated={async () => {
          await fetchTaskGroups();
          await fetchTasks();
        }}
      />
    </div>
  );
}
