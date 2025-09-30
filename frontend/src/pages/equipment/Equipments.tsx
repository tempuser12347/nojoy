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
import { renderObjectsToChips } from "../../common/render";

interface Skill {
  id: number;
  name: string;
  value: number;
}

const Equipments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization from URL search params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order = (searchParams.get("sort_order") as 'asc' | 'desc') || "desc";

  // Component state for inputs
  const [searchInput, setSearchInput] = React.useState(name_search);

  // Sync local state with URL search params on mount/change
  useEffect(() => {
    setSearchInput(name_search);
  }, [name_search]);

  // Helper to update search params
  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "equipments",
      page,
      rowsPerPage,
      name_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/equipment", {
        params: {
          name_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      return response.data; // Expecting { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "classification", label: "분류",  },
    { id: "attack_power", label: "공격력",  },
    { id: "defense_power", label: "방어력",  },
    { id: "durability", label: "내구도",  },
    { id: "attire", label: "복장예절", minWidth: 100 },
    { id: "disguise", label: "변장도", minWidth: 100 },
    {
      id: "use_effect",
      label: "사용효과",
      format: (value: { [key: string]: any } | null) => {
        if (!value) return "";
        return Object.entries(value)
          .map(([key, value]) => `${key} ${value}`)
          .join(", ");
      },
    },
    {
      id: "skills",
      label: "스킬",
      format: (value: Skill[]) => renderObjectsToChips(value, navigate),
    },
    {
      id: "equipped_effect",
      label: "장비효과",
      format: (value: { [key: string]: any } | null) => {
        if (!value) return "";
        return value?.name;
      },
    },
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
    const isAsc = sort_by === columnId && sort_order === 'asc';
    updateSearchParams({
      sort_by: columnId,
      sort_order: isAsc ? 'desc' : 'asc',
      page: 0,
    });
  };

  return (
      <Box sx={{ display: "flex", flexDirection: 'column', gap: 2, mb: 2, flexWrap: "wrap" }}>
      <Typography variant="h4" gutterBottom>
        장비품
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="장비품 이름 검색"
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
        onSortChange={handleSortChange}
        onRowClick={(row) => navigate(`/장비품/${row.id}`)}
      />
    </Box>
  );
};

export default Equipments;
