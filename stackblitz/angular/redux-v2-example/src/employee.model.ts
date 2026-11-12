/** Describes the employee records held by the NgRx SignalStore. */
export interface Employee {
  /** Identifies the employee and determines whether the filter keeps it. */
  id: number;

  /** Supplies the employee name used by the sorting transformation. */
  name: string;
}
