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
import DataTable from "../../components/DataTable";
import api from "../../api";
import {
  TREASUREMAP_CATEGORY_ARRAY,
  TREASUREMAP_ACADEMIC_FIELD_ARRAY,
  TREASUREMAP_LIBRARY_ARRAY,
} from "../../constants/listvalues";

const sampleCategories: string[] = TREASUREMAP_CATEGORY_ARRAY;

const sampleAcademicFields: string[] = TREASUREMAP_ACADEMIC_FIELD_ARRAY;

const sampleLibraries: string[] = TREASUREMAP_LIBRARY_ARRAY;

const TreasureMaps: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization from URL search params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const category_search = searchParams.get("category_search") || "";
  const academic_field_search = searchParams.get("academic_field_search") || "";
  const library_search_names = (searchParams.get("library_search") || "")
    .split(",")
    .filter(Boolean);
  const destination_search = searchParams.get("destination_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  // Component state for inputs
  const [searchInput, setSearchInput] = React.useState(name_search);
  const [categorySearch, setCategorySearch] = React.useState<string | null>(
    sampleCategories.find((c) => c === category_search) || null
  );
  const [academicFieldSearch, setAcademicFieldSearch] = React.useState<
    string | null
  >(sampleAcademicFields.find((af) => af === academic_field_search) || null);
  const [librarySearch, setLibrarySearch] = React.useState<string[]>(
    sampleLibraries.filter((l) => library_search_names.includes(l))
  );
  const [destinationInput, setDestinationInput] =
    React.useState(destination_search);

  // Sync local state with URL search params on mount/change
  useEffect(() => {
    setSearchInput(name_search);
    setCategorySearch(
      sampleCategories.find((c) => c === category_search) || null
    );
    setAcademicFieldSearch(
      sampleAcademicFields.find((af) => af === academic_field_search) || null
    );
    setLibrarySearch(
      sampleLibraries.filter((l) => library_search_names.includes(l))
    );
    setDestinationInput(destination_search);
  }, [
    name_search,
    category_search,
    academic_field_search,
    library_search_names.join(","),
    destination_search,
  ]);

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
      "treasuremaps",
      page,
      rowsPerPage,
      name_search,
      category_search,
      academic_field_search,
      library_search_names,
      destination_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/treasuremaps", {
        params: {
          name_search,
          category_search,
          academic_field_search,
          library_search: library_search_names.join(","),
          destination_search,
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
    { id: "name", label: "이름" },
    { id: "category", label: "분류" },
    { id: "required_skill", label: "필요스킬" },
    { id: "academic_field", label: "학문" },
    { id: "library", label: "서고" },
    {
      id: "destination",
      label: "목적지",
      format: (value: { id: number; name: string } | null) =>
        value ? value.name : null,
    },
  ];

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    const newParams: Record<string, any> = {
      name_search: searchInput,
      category_search: categorySearch || "",
      academic_field_search: academicFieldSearch || "",
      library_search: librarySearch.join(","),
      destination_search: destinationInput,
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setCategorySearch(null);
    setAcademicFieldSearch(null);
    setLibrarySearch([]);
    setDestinationInput("");
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

  const handleCategoryChange = (_: any, newValue: string | null) => {
    setCategorySearch(newValue);
  };

  const handleAcademicFieldChange = (_: any, newValue: string | null) => {
    setAcademicFieldSearch(newValue);
  };

  const handleLibraryChange = (_: any, newValue: string[]) => {
    setLibrarySearch(newValue);
  };

  const handleDestinationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDestinationInput(event.target.value);
  };

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        보물 지도
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="지도 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Autocomplete
          id="category-filter"
          options={sampleCategories}
          // getOptionLabel={(option) => option.name}
          value={categorySearch}
          onChange={handleCategoryChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="분류"
              sx={{ minWidth: 200 }}
            />
          )}
        />
        <Autocomplete
          id="academic-field-filter"
          options={sampleAcademicFields}
          // getOptionLabel={(option) => option.name}
          value={academicFieldSearch}
          onChange={handleAcademicFieldChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="학문"
              sx={{ minWidth: 200 }}
            />
          )}
        />
        <Autocomplete
          multiple
          id="library-filter"
          options={sampleLibraries}
          // getOptionLabel={(option) => option.name}
          value={librarySearch}
          onChange={handleLibraryChange}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="서고"
              sx={{ minWidth: 300 }}
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
        />
        <TextField
          label="목적지"
          variant="outlined"
          value={destinationInput}
          onChange={handleDestinationChange}
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
        onRowClick={(row) => navigate(`/obj/${row.id}`)}
      />
    </Box>
  );
};

export default TreasureMaps;
