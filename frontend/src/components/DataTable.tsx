import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  TableSortLabel,
  LinearProgress,
} from "@mui/material";

interface Column {
  id: string;
  label: string;
  minWidth?: number;
  format?: (value: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  total?: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  onRowClick?: (row: any) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSortChange?: (columnId: string) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  total = 0,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onRowClick,
  sortColumn,
  sortDirection,
  onSortChange,
}) => {
  const handleChangePage = (_event: unknown, newPage: number) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  const createSortHandler = (property: string) => () => {
    if (onSortChange) {
      onSortChange(property);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2, maxWidth: "100%" }}>
        {loading && <LinearProgress />}
        <TableContainer
          sx={{
            width: "100%",
            overflowX: "scroll",
            maxWidth: "100%",
            display: "block",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column, index) => {
                  let isSticky = index === 0;
                  return (
                    <TableCell
                      key={column.id}
                      sortDirection={
                        sortColumn === column.id ? sortDirection : false
                      }
                      style={
                        isSticky
                          ? {
                              minWidth: column.minWidth,
                              wordBreak: "keep-all",
                              position: "sticky",
                              left: 0,
                              zIndex: 1,
                              backgroundColor: "white",
                            }
                          : { minWidth: column.minWidth, wordBreak: "keep-all" }
                      }
                    >
                      {onSortChange ? (
                        <TableSortLabel
                          active={sortColumn === column.id}
                          direction={
                            sortColumn === column.id ? sortDirection : "desc"
                          }
                          onClick={createSortHandler(column.id)}
                        >
                          {column.label}
                        </TableSortLabel>
                      ) : (
                        column.label
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow
                  hover
                  tabIndex={-1}
                  key={index}
                  onClick={() => onRowClick?.(row)}
                  sx={{ cursor: onRowClick ? "pointer" : "default" }}
                >
                  {columns.map((column, index) => {
                    const value = row[column.id];
                    let isSticky = index === 0;
                    return (
                      <TableCell
                        key={column.id}
                        style={
                          isSticky
                            ? {
                                position: "sticky",
                                left: 0,
                                backgroundColor: "white",
                                zIndex: 1,
                              }
                            : {}
                        }
                      >
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default DataTable;
