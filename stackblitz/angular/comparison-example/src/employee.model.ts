/**
 * Describes the employee records used as the FeatureCell's array state. The
 * filter and reducer pipeline use the identifier and name to process records.
 */
export interface Employee {
  /** Identifies the employee and determines whether the filter keeps it. */
  id: number;

  /** Supplies the employee name used by the sorting reducer. */
  name: string;
}
