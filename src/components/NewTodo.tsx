import React, { useState } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  onAdd: (title: string) => void;
  disabled?: boolean;
  todos: Todo[];
  onToggleAll: (completed: boolean) => Promise<void>;
};

export const NewTodo: React.FC<Props> = ({
  onAdd,
  disabled = false,
  todos,
  onToggleAll,
}) => {
  const [title, setTitle] = useState('');
  const [isTogglingAll, setIsTogglingAll] = useState(false);

  const allCompleted = todos.length > 0 && todos.every(t => t.completed);

  const handleToggleAll = async () => {
    setIsTogglingAll(true);
    await onToggleAll(!allCompleted);
    setIsTogglingAll(false);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = title.trim();

    if (trimmed) {
      onAdd(trimmed);
      setTitle('');
    }
  };

  return (
    <header className="todoapp__header">
      <button
        type="button"
        className={classNames('todoapp__toggle-all', {
          active: allCompleted,
        })}
        data-cy="ToggleAllButton"
        onClick={handleToggleAll}
        disabled={disabled || isTogglingAll}
      />

      <form onSubmit={handleSubmit}>
        <input
          data-cy="NewTodoField"
          type="text"
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={disabled || isTogglingAll}
          autoFocus
        />
      </form>
    </header>
  );
};
