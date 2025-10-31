import React, { useState, useEffect } from 'react';
import { UserWarning } from './UserWarning';
import { USER_ID, getTodos } from './api/todos';
import { client } from './utils/fetchClient';
import { Todo } from './types/Todo';
import { TodoList } from './components/TodoList';
import { Footer } from './components/Footer';
import { ErrorNotification } from './components/ErrorNotification';
import { NewTodo } from './components/NewTodo';
import { FilterStatus } from './types/FilterStatus';
import { updateTodo } from './api/todos';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<FilterStatus>(FilterStatus.All);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [deletingIds, setDeletingIds] = useState<number[]>([]);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  useEffect(() => {
    if (!USER_ID) {
      return;
    }

    getTodos()
      .then(setTodos)
      .catch(() => setErrorMessage('Unable to load todos'));
  }, []);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    const t = setTimeout(() => setErrorMessage(''), 3000);

    return () => clearTimeout(t);
  }, [errorMessage]);

  const closeError = () => setErrorMessage('');

  const handleAddTodo = async (title: string) => {
    const trimmed = title.trim();

    if (!trimmed) {
      setErrorMessage('Title should not be empty');

      return;
    }

    setIsAdding(true);
    setTempTodo({ id: 0, userId: USER_ID, title: trimmed, completed: false });

    try {
      const created = await client.post<Todo>('/todos', {
        title: trimmed,
        userId: USER_ID,
        completed: false,
      });

      setTodos(cur => [...cur, created]);
    } catch {
      setErrorMessage('Unable to add a todo');
    } finally {
      setIsAdding(false);
      setTempTodo(null);
    }
  };

  /* ----------------------- DELETE ----------------------- */
  const handleDeleteTodo = async (todoId: number) => {
    setDeletingIds(prev => [...prev, todoId]);

    try {
      await client.delete(`/todos/${todoId}`);
      setTodos(prev => prev.filter(t => t.id !== todoId));
    } catch {
      setErrorMessage('Unable to delete a todo');
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== todoId));
    }
  };

  const handleToggle = async (todo: Todo) => {
    if (updatingIds.includes(todo.id)) {
      return;
    }

    setUpdatingIds(prev => [...prev, todo.id]);

    try {
      const updated = await updateTodo({ ...todo, completed: !todo.completed });

      setTodos(prev => prev.map(t => (t.id === todo.id ? updated : t)));
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== todo.id));
    }
  };

  const handleRename = async (todo: Todo, newTitle: string) => {
    if (updatingIds.includes(todo.id)) {
      return;
    }

    setUpdatingIds(prev => [...prev, todo.id]);

    try {
      const updated = await updateTodo({ ...todo, title: newTitle });

      setTodos(prev => prev.map(t => (t.id === todo.id ? updated : t)));
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setUpdatingIds(prev => prev.filter(id => id !== todo.id));
    }
  };

  const handleToggleAll = async (completed: boolean) => {
    const toUpdate = todos.filter(t => t.completed !== completed);

    if (!toUpdate.length) {
      return;
    }

    const ids = toUpdate.map(t => t.id);

    setUpdatingIds(prev => [...prev, ...ids]);

    const promises = toUpdate.map(t =>
      updateTodo({ ...t, completed })
        .then(() => ({ success: true, id: t.id }))
        .catch(() => ({ success: false, id: t.id })),
    );

    const results = await Promise.all(promises);
    const okIds = results.filter(r => r.success).map(r => r.id);

    if (okIds.length) {
      setTodos(prev =>
        prev.map(t => (okIds.includes(t.id) ? { ...t, completed } : t)),
      );
    }

    const hasError = results.some(r => !r.success);

    if (hasError) {
      setErrorMessage('Unable to update a todo');
    }

    setUpdatingIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const handleClearCompleted = async () => {
    const completed = todos.filter(t => t.completed);

    setDeletingIds(completed.map(t => t.id));

    const promises = completed.map(t =>
      client
        .delete(`/todos/${t.id}`)
        .then(() => ({ ok: true, id: t.id }))
        .catch(() => ({ ok: false, id: t.id })),
    );

    const results = await Promise.all(promises);
    const okIds = results.filter(r => r.ok).map(r => r.id);

    if (okIds.length) {
      setTodos(prev => prev.filter(t => !okIds.includes(t.id)));
    }

    const hasError = results.some(r => !r.ok);

    if (hasError) {
      setErrorMessage('Unable to delete a todo');
    }

    setDeletingIds([]);
  };

  const getFilteredTodos = (): Todo[] => {
    switch (filter) {
      case FilterStatus.Active:
        return todos.filter(t => !t.completed);
      case FilterStatus.Completed:
        return todos.filter(t => t.completed);
      default:
        return todos;
    }
  };

  const filteredTodos = getFilteredTodos();
  const activeCount = todos.filter(t => !t.completed).length;
  const hasCompleted = todos.some(t => t.completed);
  const hasTodos = todos.length > 0;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <NewTodo
          onAdd={handleAddTodo}
          disabled={isAdding}
          todos={todos}
          onToggleAll={handleToggleAll}
        />

        {(hasTodos || tempTodo) && (
          <TodoList
            todos={filteredTodos}
            tempTodo={tempTodo}
            onDelete={handleDeleteTodo}
            deletingIds={deletingIds}
            onToggle={handleToggle}
            onRename={handleRename}
          />
        )}

        {hasTodos && (
          <Footer
            activeTodosCount={activeCount}
            currentFilter={filter}
            onFilterChange={setFilter}
            onClearCompleted={handleClearCompleted}
            hasCompletedTodos={hasCompleted}
          />
        )}
      </div>

      <ErrorNotification message={errorMessage} onClose={closeError} />
    </div>
  );
};
