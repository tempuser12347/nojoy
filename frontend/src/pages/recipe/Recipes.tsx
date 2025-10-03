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
import { renderObjectsToChips } from "../../common/render";

interface Recipe {
  id: number;
  name: string;
  description: string;
  required_Skill: Array<{ ref: string; name: string; value: number }>;
  ingredients: Array<{ ref: string; name: string; value: number }>;
  sophia: number;
  era: string;
  central_city: string;
  Investment_cost: number;
  success: { id: number; name: string }[] | null;
}

const SKILL_FILTERS = [
  "주조",
  "공예",
  "보관",
  "조리",
  "연금술",
  "언어학",
  "봉제",
];

const Recipes: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // read params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "25", 10);
  const name_search = searchParams.get("name_search") || "";
  const skills_search = (searchParams.get("skills_search") || "")
    .split(",")
    .filter(Boolean);

  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  // local UI state
  const [searchInput, setSearchInput] = useState(name_search);
  const [skillFilters, setSkillFilters] = useState<string[]>(skills_search);

  // sync when params change
  useEffect(() => {
    setSearchInput(name_search);
    setSkillFilters(skills_search);
  }, [name_search, skills_search.join(",")]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const current = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value && value !== "" ? current.set(key, value) : current.delete(key);
    });
    setSearchParams(current);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "recipes",
      page,
      rowsPerPage,
      name_search,
      skills_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/recipes", {
        params: {
          search: name_search,
          required_skills: skills_search.join(","),
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data);
      return response.data; // Expect { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름" },
    {
      id: "required_Skill",
      label: "필요스킬",
      format: (value: Recipe["required_Skill"]) =>
        renderObjectsToChips(value, navigate),
    },
    {
      id: "ingredients",
      label: "재료",
      format: (value: Recipe["ingredients"]) =>
        renderObjectsToChips(value, navigate, (value) => "x " + value),
    },
    {
      id: "success",
      label: "성공",
      format: (value: Recipe["success"]) =>
        renderObjectsToChips(value, navigate, (value) => "x " + value),
    },
  ];

  // handlers
  const handleSkillChange = (skill: string) => {
    setSkillFilters((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSearch = () => {
    updateSearchParams({
      name_search: searchInput,
      skills_search: skillFilters.join(","),
      page: 0,
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    setSkillFilters([]);
    setSearchParams({ rowsPerPage: rowsPerPage.toString() });
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
    <Box sx={{ p: 3, height: "calc(100vh - 100px)" }}>
      <Typography variant="h4" gutterBottom>
        레시피
      </Typography>

      {/* Search & Filters */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="이름검색"
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: 200 }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </Box>

        <FormGroup row>
          {SKILL_FILTERS.map((skill) => (
            <FormControlLabel
              key={skill}
              control={
                <Checkbox
                  checked={skillFilters.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                />
              }
              label={skill}
            />
          ))}
        </FormGroup>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleSearch}>
            검색
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            초기화
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        onRowClick={(row) => navigate(`/레시피/${row.id}`)}
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
};

export default Recipes;
