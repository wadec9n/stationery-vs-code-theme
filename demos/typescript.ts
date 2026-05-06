/**
 * Task queue with priority scheduling.
 * Showcases generics, decorators, mapped types, and async iteration.
 */

import { EventEmitter } from "node:events";

type Priority = "low" | "normal" | "high" | "critical";

interface Task<T = unknown> {
  readonly id: string;
  readonly priority: Priority;
  readonly payload: T;
  retries?: number;
}

type TaskHandler<T, R> = (task: Task<T>) => Promise<R>;

const PRIORITY_WEIGHT: Readonly<Record<Priority, number>> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function logCalls<This, Args extends unknown[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext<This>,
) {
  return function (this: This, ...args: Args): Return {
    console.debug(`→ ${String(context.name)}(${args.length} args)`);
    return target.apply(this, args);
  };
}

export class TaskQueue<T> extends EventEmitter {
  #items: Task<T>[] = [];
  readonly #maxRetries: number;

  constructor({ maxRetries = 3 }: { maxRetries?: number } = {}) {
    super();
    this.#maxRetries = maxRetries;
  }

  get size(): number {
    return this.#items.length;
  }

  @logCalls
  enqueue(task: Task<T>): void {
    const index = this.#items.findIndex(
      (t) => PRIORITY_WEIGHT[t.priority] > PRIORITY_WEIGHT[task.priority],
    );
    index === -1 ? this.#items.push(task) : this.#items.splice(index, 0, task);
    this.emit("enqueued", task);
  }

  async *drain<R>(handler: TaskHandler<T, R>): AsyncGenerator<R, void> {
    while (this.#items.length > 0) {
      const task = this.#items.shift()!;
      try {
        yield await handler(task);
      } catch (err) {
        const retries = (task.retries ?? 0) + 1;
        if (retries <= this.#maxRetries) {
          this.enqueue({ ...task, retries });
        } else {
          this.emit("failed", task, err);
        }
      }
    }
  }
}

const queue = new TaskQueue<{ url: string }>();
queue.enqueue({ id: "a1", priority: "high", payload: { url: "/index" } });
queue.enqueue({ id: "b2", priority: "low", payload: { url: "/about" } });

(async () => {
  for await (const result of queue.drain(async ({ payload }) => {
    const res = await fetch(`https://example.com${payload.url}`);
    return { status: res.status, ok: res.ok };
  })) {
    console.log(`fetched: ${JSON.stringify(result)}`);
  }
})();
