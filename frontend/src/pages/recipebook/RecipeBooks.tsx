import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  TextField,
  Typography,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";

interface SkillOption {
  id: string;
  name: string;
}

const skillOptions: SkillOption[] = [
  { id: "조리", name: "조리" },
  { id: "주조", name: "주조" },
  { id: "공예", name: "공예" },
  { id: "봉제", name: "봉제" },
  { id: "연금술", name: "연금술" },
  { id: "보관", name: "보관" },
  { id: "언어학", name: "언어학" },
  { id: "통합", name: "통합" },
];

const Recipebooks: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Params from URL ---
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "desc";
  const skills_search_ids = (searchParams.get("skills_search") || "")
    .split(",")
    .filter(Boolean);

  // --- Local states ---
  const [searchInput, setSearchInput] = React.useState(name_search);
  const [skillsSearch, setSkillsSearch] = React.useState<SkillOption[]>(
    skillOptions.filter((s) => skills_search_ids.includes(s.id))
  );

  // Sync with params
  useEffect(() => {
    setSearchInput(name_search);
    setSkillsSearch(
      skillOptions.filter((s) => skills_search_ids.includes(s.id))
    );
  }, [name_search, searchParams]);

  // Helper to update params
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

  // --- Query ---
  const { data, isLoading } = useQuery({
    queryKey: [
      "recipebooks",
      page,
      rowsPerPage,
      name_search,
      sort_by,
      sort_order,
      skills_search_ids,
    ],
    queryFn: async () => {
      const response = await api.get("/api/recipebooks", {
        params: {
          name_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
          skills_search: skills_search_ids.join(","),
        },
      });
      console.log(response.data);
      return response.data; // { items: [], total: number }
    },
  });

  // --- Table Columns ---
  const columns = [
    { id: "name", label: "이름", minWidth: 150 },
    // { id: "additionalname", label: "추가 이름", minWidth: 120 },
    { id: "skill", label: "스킬", minWidth: 100 },
    { id: "productionNPC", label: "생산 NPC", minWidth: 120 },
    { id: "era", label: "시대", minWidth: 100 },
  ];

  // --- Handlers ---
  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSkillsChange = (_: any, newValue: SkillOption[]) => {
    setSkillsSearch(newValue);
  };

  const handleSearch = () => {
    updateSearchParams({
      name_search: searchInput,
      page: 0,
      skills_search: skillsSearch.map((s) => s.id).join(","),
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    setSkillsSearch([]);
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
        레시피북
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="레시피 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <Autocomplete
          multiple
          id="skills-filter"
          options={skillOptions}
          getOptionLabel={(option) => option.name}
          value={skillsSearch}
          onChange={handleSkillsChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="스킬"
              sx={{ minWidth: 200 }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option.name}
                {...getTagProps({ index })}
              />
            ))
          }
        />
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={handleSearch}>
            검색
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            초기화
          </Button>
        </Box>
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

export default Recipebooks;
