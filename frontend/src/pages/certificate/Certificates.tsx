import React, { useEffect, useState } from "react";
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

const Certificates: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization from URL search params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const classification_search = searchParams.get("classification_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  // Component state for inputs
  const [searchInput, setSearchInput] = useState(name_search);
  const [classificationInput, setClassificationInput] = useState(classification_search);

  // Sync local state with URL search params on mount/change
  useEffect(() => {
    setSearchInput(name_search);
    setClassificationInput(classification_search);
  }, [name_search, classification_search]);

  // Helper to update search params
  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        currentParams.set(key, String(value));
      } else {
        currentParams.delete(key);
      }
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "certificates",
      page,
      rowsPerPage,
      name_search,
      classification_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const params: any = {
        sort_by,
        sort_order,
        skip: page * rowsPerPage,
        limit: rowsPerPage,
      };
      if (name_search) params.name_search = name_search;
      if (classification_search) params.classification_search = classification_search;

      const response = await api.get("/api/certificates", { params });
      return response.data; // Expecting { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름" },
    { id: "classification", label: "분류" },
    {
      id: "description",
      label: "설명",
      format: (value: string) => (
        <Typography variant="body2" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
          {value || ""}
        </Typography>
      ),
    },
  ];

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleClassificationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setClassificationInput(event.target.value);
  };

  const handleSearch = () => {
    const newParams: Record<string, any> = {
      name_search: searchInput,
      classification_search: classificationInput,
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setClassificationInput("");
    updateSearchParams({ page: 0 });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    updateSearchParams({ rowsPerPage: newRowsPerPage, page: 0 });
  };

  const handleSortChange = (columnId: string) => {
    const isAsc = sort_by === columnId && sort_order === "asc";
    updateSearchParams({
      sort_by: columnId,
      sort_order: isAsc ? "desc" : "asc",
      page: 0,
    });
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        추천장
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="추천장 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <TextField
          label="분류 검색"
          variant="outlined"
          value={classificationInput}
          onChange={handleClassificationChange}
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
        onSortChange={handleSortChange}
        onRowClick={(row) => navigate(`/추천장/${row.id}`)}
      />
    </Box>
  );
};

export default Certificates;
