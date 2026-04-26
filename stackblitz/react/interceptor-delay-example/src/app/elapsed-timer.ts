/**
 * Framework-agnostic elapsed timer used to visualize the delay
 * interceptor's hold window in the StackBlitz example UI.
 *
 * This class has no dependency on Angular, React, Vue, or Svelte.
 * It accepts an onChange callback so each framework can wire it
 * to its own reactive primitive (Angular signal, React setState,
 * Vue ref, or Svelte store). To port this timer, instantiate it
 * with the target framework's state setter and call start/reset
 * from event handlers.
 */
export class ElapsedTimer {
  /** Timestamp (via performance.now) when the timer was last started. */
  #startTime = 0;

  /** Accumulated elapsed milliseconds since the last start. */
  #elapsed = 0;

  /** Whether the timer is currently running. */
  #running = false;

  /** Active requestAnimationFrame handle for cancellation. */
  #frameId = 0;

  /** Callback invoked on every animation frame with the current elapsed ms. */
  #onChange: (ms: number) => void;

  /**
   * Creates a new ElapsedTimer bound to the given change callback.
   *
   * @param onChange - Invoked on each animation frame with the elapsed
   *   milliseconds. Use this to push the value into the framework's
   *   reactive layer.
   */
  constructor(onChange: (ms: number) => void) {
    this.#onChange = onChange;
  }

  /**
   * Current elapsed time in milliseconds.
   *
   * @returns The accumulated elapsed milliseconds.
   */
  get elapsed(): number {
    return this.#elapsed;
  }

  /**
   * Whether the timer is actively counting.
   *
   * @returns True if the timer is running.
   */
  get running(): boolean {
    return this.#running;
  }

  /**
   * Starts the timer. If already running, the call is ignored.
   * Resumes from the current elapsed value, allowing pause/resume
   * semantics if needed.
   *
   * @returns Void.
   */
  start(): void {
    if (this.#running) return;
    this.#running = true;
    this.#startTime = performance.now() - this.#elapsed;
    this.#tick();
  }

  /**
   * Stops the timer and resets elapsed time to zero. Fires the
   * onChange callback with 0 so the UI reflects the reset immediately.
   *
   * @returns Void.
   */
  reset(): void {
    this.#running = false;
    cancelAnimationFrame(this.#frameId);
    this.#elapsed = 0;
    this.#onChange(0);
  }

  /**
   * Stops the timer without resetting elapsed time. Use this in
   * component teardown (e.g., Angular DestroyRef, React useEffect
   * cleanup, or Svelte onDestroy) to prevent orphaned animation frames.
   *
   * @returns Void.
   */
  destroy(): void {
    this.#running = false;
    cancelAnimationFrame(this.#frameId);
  }

  /**
   * Internal animation loop that recalculates elapsed time and
   * notifies the consumer on each frame.
   *
   * @returns Void.
   */
  #tick(): void {
    if (!this.#running) return;
    this.#elapsed = performance.now() - this.#startTime;
    this.#onChange(this.#elapsed);
    this.#frameId = requestAnimationFrame(() => this.#tick());
  }

  /**
   * Formats a millisecond value as a human-readable seconds string
   * with three-digit millisecond precision (e.g. "3.142").
   *
   * @param ms - The elapsed time in milliseconds.
   * @returns A formatted string in "s.mmm" format.
   */
  static format(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const millis = Math.floor(ms % 1000)
      .toString()
      .padStart(3, '0');
    return `${seconds}.${millis}`;
  }
}
