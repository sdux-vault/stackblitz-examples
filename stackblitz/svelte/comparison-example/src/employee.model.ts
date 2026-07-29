/**
 * Describes the employee records stored in the FeatureCell array. The pipeline
 * uses the identifier for filtering and the name for alphabetical sorting.
 */
export interface Employee {
  /** Identifies the employee and determines whether the filter keeps it. */
  id: number;

  /** Supplies the employee name used by the sorting reducer. */
  name: string;
}
