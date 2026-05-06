// Todo list component.
// Showcases JSX, fragments, conditional rendering, list keys,
// event handlers, prop spreading, and inline helper functions.

const FILTERS = /** @type {const} */ ({
  all: () => true,
  active: (todo) => !todo.done,
  done: (todo) => todo.done,
});

const SAMPLE_TODOS = [
  { id: "t1", text: "Tune comment contrast", done: false, priority: "high" },
  { id: "t2", text: "Check JSX attribute color", done: true, priority: "normal" },
  { id: "t3", text: "Review markdown callouts", done: false, priority: "low" },
];

const cx = (...tokens) => tokens.filter(Boolean).join(" ");

function TodoRow({ todo, onToggle, onRemove }) {
  return (
    <li className={cx("todo__item", todo.done && "is-done", `priority-${todo.priority}`)}>
      <label>
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
        />
        <span>{todo.text}</span>
      </label>
      <button
        type="button"
        aria-label={`Remove ${todo.text}`}
        onClick={() => onRemove(todo.id)}
      >
        ×
      </button>
    </li>
  );
}

function FilterToolbar({ active, counts }) {
  return (
    <>
      {Object.keys(FILTERS).map((name, index) => (
        <span key={name}>
          {index > 0 && " · "}
          <button
            type="button"
            className={cx("link", active === name && "is-active")}
            aria-pressed={active === name}
            onClick={() => console.log(`filter:${name}`)}
          >
            {name} ({counts[name]})
          </button>
        </span>
      ))}
    </>
  );
}

export default function TodoApp({
  initial = SAMPLE_TODOS,
  title = "Today",
  filter = "all",
  className,
  ...rest
}) {
  const activeFilter = FILTERS[filter] ? filter : "all";
  const visible = initial.filter(FILTERS[activeFilter]);
  const remaining = initial.filter(FILTERS.active).length;
  const counts = {
    all: initial.length,
    active: remaining,
    done: initial.filter(FILTERS.done).length,
  };

  const handleToggle = (id) => console.log(`toggle:${id}`);
  const handleRemove = (id) => console.log(`remove:${id}`);

  return (
    <section className={cx("todo", className)} data-filter={activeFilter} {...rest}>
      <header>
        <h1>{title}</h1>
        <p aria-live="polite">
          {remaining === 0 ? (
            <em>All caught up.</em>
          ) : (
            <>
              <strong>{remaining}</strong> item{remaining !== 1 && "s"} remaining
            </>
          )}
        </p>
      </header>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const text = event.currentTarget.elements.text.value.trim();
          if (text) console.log(`add:${text}`);
        }}
      >
        <label htmlFor="todo-text" className="visually-hidden">New task</label>
        <input
          id="todo-text"
          name="text"
          type="text"
          placeholder="What needs doing?"
          autoComplete="off"
          defaultValue=""
          required
        />
        <button type="submit" className="button">Add</button>
      </form>

      {visible.length === 0 ? (
        <p className="todo__empty">No tasks match this filter.</p>
      ) : (
        <ul>
          {visible.map((todo) => (
            <TodoRow
              key={todo.id}
              todo={todo}
              onToggle={handleToggle}
              onRemove={handleRemove}
            />
          ))}
        </ul>
      )}

      <footer>
        <FilterToolbar active={activeFilter} counts={counts} />
        <button
          type="button"
          className="link"
          disabled={counts.done === 0}
          onClick={() => console.log("clear:completed")}
        >
          Clear completed
        </button>
      </footer>
    </section>
  );
}
