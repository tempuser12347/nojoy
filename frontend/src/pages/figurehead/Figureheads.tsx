import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";

const Figureheads: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  const [searchInput, setSearchInput] = React.useState(name_search);

  const { data, isLoading } = useQuery({
    queryKey: [
      "figureheads",
      page,
      rowsPerPage,
      name_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/figureheads", {
        params: {
          name_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      return response.data;
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "durability", label: "내구도", minWidth: 100 },
    { id: "disaster_protection", label: "재해 방지", minWidth: 100 },
    { id: "fatigue_reduction", label: "피로 감소", minWidth: 100 },
    { id: "crew_control", label: "선원 통제", minWidth: 100 },
    { id: "shell_evasion", label: "포탄 회피", minWidth: 100 },
    { id: "use_effect", label: "사용 효과", minWidth: 170 },
  ];

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    setSearchParams({ name_search: searchInput, page: "0", rowsPerPage: rowsPerPage.toString(), sort_by, sort_order });
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchParams({ page: "0", rowsPerPage: rowsPerPage.toString(), sort_by, sort_order });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ page: newPage.toString(), rowsPerPage: rowsPerPage.toString(), name_search, sort_by, sort_order });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setSearchParams({ page: "0", rowsPerPage: newRowsPerPage.toString(), name_search, sort_by, sort_order });
  };

  const handleSortChange = (columnId: string) => {
    const newSortOrder = sort_by === columnId && sort_order === "asc" ? "desc" : "asc";
    setSearchParams({ page: page.toString(), rowsPerPage: rowsPerPage.toString(), name_search, sort_by: columnId, sort_order: newSortOrder });
  };

  return (
    <Box sx={{ width: "100%", p: 3, height: "calc(100vh - 100px)" }}>
      <Typography variant="h4" gutterBottom>
        선수상
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          검색
        </Button>
        <Button variant="outlined" onClick={resetFilters}>
          초기화
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        total={data?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sortColumn={sort_by}
        sortDirection={sort_order}
        onSortChange={handleSortChange}
        onRowClick={(row) => navigate(`/obj/${row.id}`)}
      />
    </Box>
  );
};

export default Figureheads;
