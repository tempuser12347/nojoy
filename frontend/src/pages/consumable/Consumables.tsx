import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import DataTable from "../../components/DataTable";
import api from "../../api";

// 카테고리 필터 리스트
const CATEGORY_FILTERS = [
  "기타",
  "음식",
  "아이템 획득",
  "교역",
  "항해",
  "스킬",
  "꾸미기",
  "전투 (해상 전투)",
  "전투 (육상 전투)",
  "강화",
  "부관",
  "생산",
  "애완동물",
  "이벤트",
];

export default function Consumables() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL param → state
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "25", 10);
  const name_search = searchParams.get("name_search") || "";
  const category_filter = (searchParams.get("category") || "")
    .split(",")
    .filter(Boolean);
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  // Local state for UI inputs (not immediately triggering API)
  const [searchInput, setSearchInput] = useState(name_search);
  const [selectedCategories, setSelectedCategories] =
    useState<string[]>(category_filter);

  // Keep local inputs in sync with URL params when they change
  useEffect(() => {
    setSearchInput(name_search);
    setSelectedCategories(category_filter);
  }, [name_search, category_filter.join(",")]);

  // Update URL params (→ triggers query)
  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "consumables",
      page,
      rowsPerPage,
      name_search,
      category_filter,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/consumables", {
        params: {
          name_search,
          category: category_filter.join(","),
          skip: page * rowsPerPage,
          limit: rowsPerPage,
          sort_by,
          sort_order,
        },
      });
      console.log(response.data);
      return response.data; // { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름" },
    { id: "category", label: "카테고리" },
    {
      id: "features",
      label: "특징",
    },
  ];

  // --- handlers ---
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    updateSearchParams({
      name_search: searchInput,
      category: selectedCategories.join(","),
      page: 0,
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    setSelectedCategories([]);
    setSearchParams({ rowsPerPage: searchParams.get("rowsPerPage") || "25" });
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

  // 카테고리 체크박스 (only updates local state)
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        소비품
      </Typography>

      {/* 검색/초기화 */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="이름검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          sx={{ minWidth: 200 }}
        />
        <Button variant="contained" onClick={handleSearch}>
          검색
        </Button>
        <Button variant="outlined" onClick={resetFilters}>
          초기화
        </Button>
      </Box>

      {/* 카테고리 필터 (only local state until 검색) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <FormGroup row>
          {CATEGORY_FILTERS.map((cat) => (
            <FormControlLabel
              key={cat}
              control={
                <Checkbox
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                />
              }
              label={cat}
            />
          ))}
        </FormGroup>
      </Box>

      {/* 데이터 테이블 */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        onRowClick={(row) => navigate(`/소비품/${row.id}`)}
        page={page}
        rowsPerPage={rowsPerPage}
        total={data?.total || 0}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        sortColumn={sort_by}
        sortDirection={sort_order}
        onSortChange={handleSortChange}
      />
    </Box>
  );
}
