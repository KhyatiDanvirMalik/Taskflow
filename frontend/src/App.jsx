import { useEffect, useMemo, useState, useCallback } from 'react';
import { api, ApiClientError } from './api/client.js';
import Column from './components/Column.jsx';
import TaskModal from './components/TaskModal.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import FilterBar from './components/FilterBar.jsx';
import ErrorBanner from './components/ErrorBanner.jsx';

const BOARD_ID = 1; // Single-board app — out of scope to support multiple boards (see README).

export default function App() {
  const [board, setBoard] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // loading | ready | error
  const [error, setError] = useState('');

  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [modal, setModal] = useState(null); // { mode: 'create'|'edit', columnId, task? }
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [draggingTaskId, setDraggingTaskId] = useState(null);

  const loadBoard = useCallback(async () => {
    try {
      const data = await api.getBoard(BOARD_ID);
      setBoard(data);
      setLoadState('ready');
    } catch (err) {
      setLoadState('error');
      setError(err instanceof ApiClientError ? err.message : 'Failed to load the board.');
    }
  }, []);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  function showError(err, fallback) {
    setError(err instanceof ApiClientError ? err.message : fallback);
  }

  async function handleCreateTask(columnId, values) {
    setIsSaving(true);
    try {
      await api.createTask({ column_id: columnId, ...values });
      setModal(null);
      await loadBoard();
    } catch (err) {
      showError(err, 'Could not create the task. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEditTask(taskId, values) {
    setIsSaving(true);
    try {
      await api.updateTask(taskId, values);
      setModal(null);
      await loadBoard();
    } catch (err) {
      showError(err, 'Could not save your changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleMove(taskId, columnId) {
    // Optimistic update so drag-and-drop feels instant; rolled back on failure.
    const previousBoard = board;
    setBoard((prev) => {
      if (!prev) return prev;
      const columns = prev.columns.map((col) => ({ ...col, tasks: [...col.tasks] }));
      let moved;
      for (const col of columns) {
        const idx = col.tasks.findIndex((t) => t.id === taskId);
        if (idx !== -1) {
          [moved] = col.tasks.splice(idx, 1);
          break;
        }
      }
      if (!moved) return prev;
      const target = columns.find((c) => c.id === columnId);
      if (target) target.tasks.unshift({ ...moved, column_id: columnId });
      return { ...prev, columns };
    });
    setDraggingTaskId(null);

    try {
      await api.moveTask(taskId, columnId);
      await loadBoard(); // refresh counts, ordering from the server
    } catch (err) {
      setBoard(previousBoard);
      showError(err, 'Could not move the task. Please try again.');
    }
  }

  async function handleDeleteConfirmed() {
    if (!pendingDelete) return;
    try {
      await api.deleteTask(pendingDelete.id);
      setPendingDelete(null);
      await loadBoard();
    } catch (err) {
      showError(err, 'Could not delete the task. Please try again.');
      setPendingDelete(null);
    }
  }

  const filteredColumns = useMemo(() => {
    if (!board) return [];
    const term = searchTerm.trim().toLowerCase();
    return board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => {
        const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
        const matchesSearch = term.length === 0 || t.title.toLowerCase().includes(term);
        return matchesPriority && matchesSearch;
      }),
    }));
  }, [board, priorityFilter, searchTerm]);

  if (loadState === 'loading') {
    return <CenteredMessage>Loading board…</CenteredMessage>;
  }

  if (loadState === 'error' && !board) {
    return (
      <CenteredMessage>
        <div style={{ maxWidth: '360px', textAlign: 'center' }}>
          <p style={{ fontWeight: 600, marginBottom: '6px' }}>Couldn't load the board</p>
          <p style={{ color: 'var(--color-ink-soft)', fontSize: '13.5px', marginBottom: '14px' }}>{error}</p>
          <button
            onClick={loadBoard}
            style={{
              background: 'var(--color-accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '7px',
              padding: '9px 16px',
              fontWeight: 600,
            }}
          >
            Retry
          </button>
        </div>
      </CenteredMessage>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--color-accent)',
                margin: '0 0 2px',
              }}
            >
              TaskFlow
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>
              {board.name}
            </h1>
          </div>
          <FilterBar
            value={priorityFilter}
            onChange={setPriorityFilter}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
      </header>

      <ErrorBanner message={error} onDismiss={() => setError('')} />

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px' }}>
        {filteredColumns.map((col) => (
          <Column
            key={col.id}
            column={col}
            tasks={col.tasks}
            allColumns={board.columns}
            draggingTaskId={draggingTaskId}
            onDragStart={setDraggingTaskId}
            onEdit={(task) => setModal({ mode: 'edit', columnId: col.id, task })}
            onDelete={(task) => setPendingDelete(task)}
            onMove={handleMove}
            onAddTask={(columnId) => setModal({ mode: 'create', columnId })}
          />
        ))}
      </div>

      {modal && (
        <TaskModal
          mode={modal.mode}
          initialTask={modal.task}
          columnName={board.columns.find((c) => c.id === modal.columnId)?.name}
          isSaving={isSaving}
          onClose={() => setModal(null)}
          onSave={(values) =>
            modal.mode === 'create'
              ? handleCreateTask(modal.columnId, values)
              : handleEditTask(modal.task.id, values)
          }
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this task?"
          message={`"${pendingDelete.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}

function CenteredMessage({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        color: 'var(--color-ink-soft)',
      }}
    >
      {children}
    </div>
  );
}
