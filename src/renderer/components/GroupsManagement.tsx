import { useState, useEffect } from 'react';
import Modal from './Modal';
import type { TaskGroup, CreateTaskGroupData } from '../api/tasks';
import * as taskAPI from '../api/tasks';

interface GroupsManagementProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupsUpdated: () => void;
}

export default function GroupsManagement({
  isOpen,
  onClose,
  onGroupsUpdated,
}: GroupsManagementProps) {
  const [groups, setGroups] = useState<TaskGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingGroup, setEditingGroup] = useState<TaskGroup | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingColor, setEditingColor] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<TaskGroup | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedGroups = await taskAPI.fetchTaskGroups();
      setGroups(fetchedGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (group: TaskGroup) => {
    setEditingGroup(group);
    setEditingName(group.name);
    setEditingColor(group.color || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup || !editingName.trim()) return;

    try {
      await taskAPI.updateTaskGroup(editingGroup.id, {
        name: editingName.trim(),
        color: editingColor || undefined,
      });
      setEditingGroup(null);
      setEditingName('');
      setEditingColor('');
      await fetchGroups();
      onGroupsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    }
  };

  const handleDeleteClick = (group: TaskGroup) => {
    setDeletingGroup(group);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGroup) return;

    try {
      await taskAPI.deleteTaskGroup(deletingGroup.id);
      setShowDeleteConfirm(false);
      setDeletingGroup(null);
      await fetchGroups();
      onGroupsUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete group');
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditingName('');
    setEditingColor('');
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Groups" size="medium">
      <div style={{ padding: '8px 0' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div className="loading-spinner" />
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Loading groups...
            </div>
          </div>
        ) : error ? (
          <div style={{ padding: '16px', background: 'var(--countdown-bg)', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ color: 'var(--text-danger, #ef4444)', fontSize: '12px', marginBottom: '8px' }}>
              {error}
            </div>
            <button
              type="button"
              onClick={fetchGroups}
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
              Retry
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              No groups yet
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Create groups from the main tasks panel
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {groups.map((group) => (
              <div
                key={group.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                }}
              >
                {editingGroup?.id === group.id ? (
                  <form
                    onSubmit={handleSaveEdit}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      {group.color && (
                        <div
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            background: editingColor || group.color,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 10px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          background: 'var(--bg-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                        }}
                        autoFocus
                        required
                      />
                      <input
                        type="color"
                        value={editingColor || group.color || '#6366f1'}
                        onChange={(e) => setEditingColor(e.target.value)}
                        style={{
                          width: '30px',
                          height: '30px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                        title="Group color"
                      />
                    </div>
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
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
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
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      {group.color && (
                        <div
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: group.color,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {group.name}
                        </div>
                        {group._count && group._count.tasks > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {group._count.tasks} task{group._count.tasks !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleEdit(group)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--countdown-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(group)}
                        style={{
                          padding: '6px 12px',
                          background: 'transparent',
                          border: '1px solid var(--text-danger, #ef4444)',
                          borderRadius: '6px',
                          color: 'var(--text-danger, #ef4444)',
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingGroup && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeletingGroup(null);
          }}
          title="Delete Group"
          size="small"
        >
          <div style={{ padding: '8px 0' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Are you sure you want to delete "{deletingGroup.name}"? All tasks in this group will be moved to "No Group". This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingGroup(null);
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
                type="button"
                onClick={handleDeleteConfirm}
                style={{
                  padding: '8px 16px',
                  background: 'var(--text-danger, #ef4444)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
}


