import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  Chip,
  Autocomplete,
} from "@mui/material";
import DataTable from "../components/DataTable";
import api from "../api";
import { renderObjectsToChips } from "../common/render";
import {
  QUEST_FILTER_LOCATION_ARRAY,
  QUEST_FILTER_SKILL_ARRAY,
} from "../constants/listvalues";

interface Skill {
  id: number;
  name: string;
  value: number;
}

interface City {
  id: number;
  name: string;
}

const sampleCities: City[] = QUEST_FILTER_LOCATION_ARRAY.map((city) => ({
  id: city.id,
  name: city.name,
}));

const sampleSkills: Skill[] = QUEST_FILTER_SKILL_ARRAY.map((skill, index) => ({
  id: skill.id,
  name: skill.name,
  value: 0,
}));

const Quests: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization from URL search params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const location_search_names = (searchParams.get("location_search") || "")
    .split(",")
    .filter(Boolean);
  const destination_search_id = searchParams.get("destination_search") || null;
  const skills_search_ids = (searchParams.get("skills_search") || "")
    .split(",")
    .filter(Boolean)
    .map(Number);

  // Component state for inputs
  const [searchInput, setSearchInput] = React.useState("");

  // Derived state for Autocomplete components
  const locationSearch = sampleCities.filter((c) =>
    location_search_names.includes(c.name)
  );
  const destinationSearch =
    sampleCities.find((c) => c.id === Number(destination_search_id)) || null;
  const skillsSearch = sampleSkills.filter((s) =>
    skills_search_ids.includes(s.id)
  );

  // Sync search input with name_search from URL on mount/change
  useEffect(() => {
    setSearchInput(name_search);
  }, [name_search]);

  // Helper to update search params
  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "quests",
      page,
      rowsPerPage,
      name_search,
      location_search_names,
      destination_search_id,
      skills_search_ids,
    ],
    queryFn: async () => {
      const response = await api.get("/api/quests", {
        params: {
          name_search,
          location_search: location_search_names.join(","),
          destination_search: destination_search_id,
          skills_search: skills_search_ids.join(","),
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });

      console.log(response.data);
      return response.data; // Expecting { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "type", label: "종류", minWidth: 100 },
    { id: "difficulty", label: "난이도", minWidth: 100 },
    { id: "location", label: "의뢰장소", minWidth: 170 },
    {
      id: "destination",
      label: "목적지",
      minWidth: 170,
      format: (value: any) => (
        <Typography>{value ? value.name : ""}</Typography>
      ),
    },
    {
      id: "skills",
      label: "필요스킬",
      minWidth: 200,
      format: (value: Skill[]) => renderObjectsToChips(value, navigate),
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
    setSearchParams({});
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    updateSearchParams({ rowsPerPage: newRowsPerPage, page: 0 });
  };

  const handleLocationChange = (_: any, newValue: City[]) => {
    const names = newValue.map((l) => l.name).join(",");
    updateSearchParams({ location_search: names, page: 0 });
  };

  const handleDestinationChange = (_: any, newValue: City | null) => {
    updateSearchParams({ destination_search: newValue?.id, page: 0 });
  };

  const handleSkillsChange = (_: any, newValue: Skill[]) => {
    const ids = newValue.map((s) => s.id).join(",");
    updateSearchParams({ skills_search: ids, page: 0 });
  };

  return (
    // <Box sx={{ width: "100%", p: 3, height: "calc(100vh - 100px)" }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}> 
      <Typography variant="h4" gutterBottom>
        퀘스트
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="퀘스트 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      {/* </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}> */}
        <Autocomplete
          multiple
          id="location-filter"
          options={sampleCities}
          getOptionLabel={(option) => option.name}
          value={locationSearch}
          onChange={handleLocationChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="의뢰장소"
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
        <Autocomplete
          id="destination-filter"
          options={sampleCities}
          getOptionLabel={(option) => option.name}
          value={destinationSearch}
          onChange={handleDestinationChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="목적지"
              sx={{ minWidth: 200 }}
            />
          )}
        />
        <Autocomplete
          multiple
          id="skills-filter"
          options={sampleSkills}
          getOptionLabel={(option) => option.name}
          value={skillsSearch}
          onChange={handleSkillsChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="필요스킬"
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
        onRowClick={(row) => navigate(`/퀘스트/${row.id}`)}
      />
    </Box>
  );
};

export default Quests;
