import React, { useEffect } from "react";
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

const DebateCombos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  const [searchInput, setSearchInput] = React.useState(name_search);

  useEffect(() => {
    setSearchInput(name_search);
  }, [name_search]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "debatecombos",
      page,
      rowsPerPage,
      name_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/debatecombos", {
        params: {
          name_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data);
      const processedItems = response.data.items.map((item: any) => {
        return {
          ...item,
          category: item.category_info ? item.category_info.category : "",
          bonus: item.category_info ? item.category_info.bonus : "",
        };
      });
      return { ...response.data, items: processedItems };
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "category", label: "카테고리", minWidth: 100 },
    { id: "bonus", label: "보너스", minWidth: 100 },
    { id: "total_points", label: "총 포인트", minWidth: 100 },
  ];

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    const newParams: Record<string, any> = {
      name_search: searchInput,
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchParams({ rowsPerPage: searchParams.get("rowsPerPage") || "10" });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    updateSearchParams({ rowsPerPage: newRowsPerPage, page: 0 });
  };

  const handleSortChange = (columnId: string) => {
    let newSortOrder: "asc" | "desc" = "desc";
    if (sort_by === columnId) {
      newSortOrder = sort_order === "asc" ? "desc" : "asc";
    }
    updateSearchParams({
      sort_by: columnId,
      sort_order: newSortOrder,
      page: 0,
    });
  };

  return (
    <Box
      sx={{
        width: "100%",
        p: 3,
        height: "calc(100vh - 100px)",
        maxWidth: "100%",
      }}
    >
      <Typography variant="h4" gutterBottom>
        논전 콤보
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
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
        onRowClick={(row) => navigate(`/obj/${row.id}`)}
      />
    </Box>
  );
};

export default DebateCombos;