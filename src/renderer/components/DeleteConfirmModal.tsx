import Modal from './Modal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message,
  itemName,
}: DeleteConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const defaultMessage = itemName
    ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
    : 'Are you sure you want to delete this item? This action cannot be undone.';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
      <div className="delete-confirm-content">
        <p className="delete-confirm-message">
          {message || defaultMessage}
        </p>
        <div className="delete-confirm-actions">
          <button
            type="button"
            className="delete-confirm-button cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="delete-confirm-button confirm"
            onClick={handleConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

