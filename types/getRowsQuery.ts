/**
 * Query structure for filtering and sorting rows.
 * - Use column names as `col_id` values - they will be automatically resolved to UUIDs.
 */
export type GetRowsQuery = {
  where?: Array<
    // Row-level filters
    | {
        kind: "row";
        field: "last_run_status" | "last_run_time";
        op:
          | "eq"
          | "neq"
          | "lt"
          | "lte"
          | "gt"
          | "gte"
          | "between"
          | "in"
          | "is_empty"
          | "is_not_empty";
        value?: string | string[] | number;
        value2?: string | number;
      }
    // Cell-level filters
    | {
        kind: "cell";
        col_id: string; // Use column name
        type: "text" | "number" | "timestamp" | "boolean";
        op:
          | "eq"
          | "neq"
          | "lt"
          | "lte"
          | "gt"
          | "gte"
          | "between"
          | "in"
          | "contains"
          | "starts_with"
          | "ends_with"
          | "is_empty"
          | "is_not_empty";
        value?: string | number | boolean | string[] | number[];
        value2?: string | number;
      }
  >;
  orderBy?: Array<
    | {
        kind: "row";
        field: "last_run_status" | "last_run_time";
        dir?: "asc" | "desc";
        empty?: "first" | "last";
      }
    | {
        kind: "cell";
        col_id: string; // Use column name
        type: "text" | "number" | "timestamp" | "boolean";
        dir?: "asc" | "desc";
        empty?: "first" | "last";
      }
  >;
};

/**
 * Row-level filter for filtering by row metadata.
 */
export type RowFilter = {
  kind: "row";
  field: "last_run_status" | "last_run_time";
  op:
    | "eq"
    | "neq"
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "between"
    | "in"
    | "is_empty"
    | "is_not_empty";
  value?: string | string[] | number;
  value2?: string | number;
};

/**
 * Cell-level filter for filtering by cell values.
 */
export type CellFilter = {
  kind: "cell";
  col_id: string; // Use column name - will be resolved to UUID
  type: "text" | "number" | "timestamp" | "boolean";
  op:
    | "eq"
    | "neq"
    | "lt"
    | "lte"
    | "gt"
    | "gte"
    | "between"
    | "in"
    | "contains"
    | "starts_with"
    | "ends_with"
    | "is_empty"
    | "is_not_empty";
  value?: string | number | boolean | string[] | number[];
  value2?: string | number;
};

/**
 * Row-level ordering for sorting by row metadata.
 */
export type RowOrderBy = {
  kind: "row";
  field: "last_run_status" | "last_run_time";
  dir?: "asc" | "desc";
  empty?: "first" | "last";
};

/**
 * Cell-level ordering for sorting by cell values.
 */
export type CellOrderBy = {
  kind: "cell";
  col_id: string; // Use column name - will be resolved to UUID
  type: "text" | "number" | "timestamp" | "boolean";
  dir?: "asc" | "desc";
  empty?: "first" | "last";
};
