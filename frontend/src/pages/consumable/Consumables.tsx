import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import api from "../../api";

export default function Consumables() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["consumables", page, rowsPerPage, search],
    queryFn: async () => {
      const response = await api.get("/api/consumables", {
        params: {
          search,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });

      console.log(response.data);
      return response.data; // Expecting { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름" },
    { id: "category", label: "카테고리" },
    {
      id: "features",
      label: "특징",
      format: (value: string[]) => value.join(", "),
    },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, height: "calc(100vh - 100px)" }}>
      <Typography variant="h4" gutterBottom>
        소비품
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="이름검색"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 200 }}
        />
      </Box>
      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        onRowClick={(row) => navigate(`/소비품/${row.id}`)}
        page={page}
        rowsPerPage={rowsPerPage}
        total={data?.length || 0}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
      />
    </Box>
  );
}
