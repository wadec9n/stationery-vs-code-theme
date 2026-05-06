// Generic data table component.
// Showcases TSX-specific syntax: generic components, conditional types,
// template-literal types, discriminated unions, and JSX with type arguments.

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

type Renderable = JSX.Element | string | number | boolean | null | undefined;
type SortDirection = "asc" | "desc";
type ValueOf<T> = T[keyof T];
type EmptyState = () => JSX.Element;

interface Column<Row> {
  readonly key: keyof Row;
  readonly header: Renderable;
  readonly width?: `${number}${"px" | "fr" | "%"}`;
  readonly sortable?: boolean;
  readonly render?: (value: ValueOf<Row>, row: Row) => Renderable;
}

interface DataTableProps<Row extends Record<string, unknown>> {
  readonly rows: readonly Row[];
  readonly columns: ReadonlyArray<Column<Row>>;
  readonly defaultSort?: { key: keyof Row; dir: SortDirection } | null;
  readonly emptyState?: EmptyState;
  readonly onRowClick?: (row: Row) => void;
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) return 0;
  if (typeof left === "number" && typeof right === "number") {
    return left > right ? 1 : -1;
  }
  return String(left) > String(right) ? 1 : -1;
}

export function DataTable<Row extends Record<string, unknown>>({
  rows,
  columns,
  defaultSort = null,
  emptyState: Empty,
  onRowClick,
}: DataTableProps<Row>) {
  const sort = defaultSort;
  const sortedRows = !sort
    ? [...rows]
    : [...rows].sort((a, b) => compareValues(a[sort.key], b[sort.key]) * (sort.dir === "asc" ? 1 : -1));

  if (sortedRows.length === 0) {
    return Empty ? <Empty /> : <p className="data-table__empty">No data.</p>;
  }

  const gridTemplate = columns.map((column) => column.width ?? "minmax(0, 1fr)").join(" ");

  return (
    <table className="data-table" role="grid" style={{ "--cols": gridTemplate }}>
      <thead>
        <tr>
          {columns.map((col) => {
            const active = sort?.key === col.key;
            return (
              <th
                key={String(col.key)}
                aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
              >
                {col.header}
                {col.sortable && (
                  <span aria-hidden>{active ? (sort.dir === "asc" ? " ▲" : " ▼") : " ⇅"}</span>
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row, rowIndex) => (
          <tr key={rowIndex} onClick={() => onRowClick?.(row)}>
            {columns.map((col) => {
              const value = row[col.key] as ValueOf<Row>;
              return (
                <td key={String(col.key)}>
                  {col.render ? col.render(value, row) : String(value)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface User {
  id: number;
  name: string;
  joinedAt: Date;
  active: boolean;
}

const users: readonly User[] = [
  { id: 1, name: "Ada Lovelace", joinedAt: new Date("2025-12-01"), active: true },
  { id: 2, name: "Grace Hopper", joinedAt: new Date("2026-01-14"), active: false },
  { id: 3, name: "Margaret Hamilton", joinedAt: new Date("2026-03-22"), active: true },
];

export function UsersExample() {
  return (
    <DataTable<User>
      rows={users}
      defaultSort={{ key: "joinedAt", dir: "desc" }}
      columns={[
        { key: "name", header: "Name", sortable: true },
        {
          key: "joinedAt",
          header: "Joined",
          sortable: true,
          render: (value) => (value as Date).toLocaleDateString(),
        },
        {
          key: "active",
          header: "Status",
          render: (value) => <span>{value ? "active" : "inactive"}</span>,
        },
      ]}
      onRowClick={(user) => console.log(`clicked user #${user.id}`)}
    />
  );
}
