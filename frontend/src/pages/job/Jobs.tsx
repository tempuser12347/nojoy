import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  Autocomplete,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";
import { renderObjectsToChips } from "../../common/render";
import { JOB_PREFERRED_SKILL_OPTION_ARRAY } from "../../constants/listvalues";

const JOB_CATEGORIES = ["모험", "교역", "전투"];
const JOB_SKILLS_ARRAY = JOB_PREFERRED_SKILL_OPTION_ARRAY.map((skill) => ({
  id: skill.id,
  name: skill.name,
  // value: 0,
}));

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const category_search = searchParams.get("category_search") || "";
  const skills_search_ids = (searchParams.get("preferred_skill_search") || "")
    .split(",")
    .filter(Boolean)
    .map(Number);
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order = (searchParams.get("sort_order") as 'asc' | 'desc') || "desc";

  const [searchInput, setSearchInput] = React.useState(name_search);
  const [categorySearch, setCategorySearch] = React.useState(category_search);
  const [skillsSearch, setSkillsSearch] = React.useState(
    JOB_SKILLS_ARRAY.filter((s) => skills_search_ids.includes(s.id))
  );

  useEffect(() => {
    setSearchInput(name_search);
    setCategorySearch(category_search);
    setSkillsSearch(
      JOB_SKILLS_ARRAY.filter((s) => skills_search_ids.includes(s.id))
    );
  }, [searchParams.toString()]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["jobs", searchParams.toString()],
    queryFn: async () => {
      const response = await api.get("/api/jobs", {
        params: {
          name_search,
          category_search,
          preferred_skill_search: skills_search_ids.join(","),
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data);
      return response.data;
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "category", label: "카테고리", minWidth: 100 },
    { id: "cost", label: "비용", minWidth: 100 },
    {
      id: "preferred_skills",
      label: "우대 스킬",
      minWidth: 200,
      format: (value: { id: number; name: string; value: number }[] | null) =>
        renderObjectsToChips(value),
    },
    // { id: "reference_letter", label: "추천서", minWidth: 200, format: (value: {id:number, name: string} | null) => value?.name },
  ];

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleCategoryChange = (event: any) => {
    setCategorySearch(event.target.value);
  };

  const handleSkillsChange = (_: any, newValue: any[]) => {
    setSkillsSearch(newValue);
  };

  const handleSearch = () => {
    const newParams: Record<string, any> = {
      name_search: searchInput,
      category_search: categorySearch,
      preferred_skill_search: skillsSearch.map((s) => s.id).join(","),
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setCategorySearch("");
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
    <Box sx={{ width: "100%", p: 3}}>
      <Typography variant="h4" gutterBottom>
        직업
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="직업 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>카테고리</InputLabel>
          <Select
            value={categorySearch}
            label="카테고리"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {JOB_CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Autocomplete
          multiple
          id="skills-filter"
          options={JOB_SKILLS_ARRAY}
          getOptionLabel={(option) => option.name}
          value={skillsSearch}
          onChange={handleSkillsChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="우대 스킬"
              sx={{ minWidth: 300 }}
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


export default Jobs;