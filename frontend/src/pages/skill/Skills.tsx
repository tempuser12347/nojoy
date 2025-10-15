import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, TextField, Typography, Button } from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";

const Skills: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

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
    queryKey: ["skills", page, rowsPerPage, name_search, sort_by, sort_order],
    queryFn: async () => {
      const response = await api.get("/api/skills", {
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
        if (
          item.acquire_requirement &&
          typeof item.acquire_requirement === "string"
        ) {
          try {
            item.acquire_requirement = JSON.parse(item.acquire_requirement);
          } catch (e) {
            console.error("Error parsing acquire_requirement:", e);
            item.acquire_requirement = [];
          }
        }
        return item;
      });
      return { ...response.data, items: processedItems };
    },
  });

  const columns = [
    { id: "name", label: "이름" },
    { id: "type", label: "타입" },
    { id: "action_point", label: "행동력" },
    { id: "apply_range", label: "적용 범위" },
  ];

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    updateSearchParams({ name_search: searchInput, page: 0 });
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
        스킬
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="스킬 이름"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
        <Button variant="outlined" onClick={resetFilters}>
          Reset
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

export default Skills;
