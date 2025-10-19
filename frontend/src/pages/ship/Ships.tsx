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
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";
import {
  SHIP_PURPOSE_ARRAY,
  SHIP_SIZE_ARRAY,
  SHIP_PROPULSION_ARRAY,
  SHIP_SKILL_OPTION_ARRAY,
} from "../../constants/listvalues";

const Ships: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization from URL search params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const purpose_search_names = (searchParams.get("purpose_search") || "")
    .split(",")
    .filter(Boolean);
  const size_search_names = (searchParams.get("size_search") || "")
    .split(",")
    .filter(Boolean);
  const propulsion_search_names = (searchParams.get("propulsion_search") || "")
    .split(",")
    .filter(Boolean);
  const ship_skill_search_names = (searchParams.get("ship_skill_search") || "")
    .split(",")
    .filter(Boolean);
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  // Component state for inputs
  const [searchInput, setSearchInput] = React.useState(name_search);
  const [purposeSearch, setPurposeSearch] = React.useState(
    SHIP_PURPOSE_ARRAY.filter((p) => purpose_search_names.includes(p.name))
  );
  const [sizeSearch, setSizeSearch] = React.useState(
    SHIP_SIZE_ARRAY.filter((s) => size_search_names.includes(s.name))
  );
  const [propulsionSearch, setPropulsionSearch] = React.useState(
    SHIP_PROPULSION_ARRAY.filter((p) =>
      propulsion_search_names.includes(p.name)
    )
  );
  const [shipSkillSearch, setShipSkillSearch] = React.useState(
    SHIP_SKILL_OPTION_ARRAY.filter((s) => ship_skill_search_names.includes(s))
  );

  // Sync local state with URL search params on mount/change
  useEffect(() => {
    setSearchInput(name_search);
    setPurposeSearch(
      SHIP_PURPOSE_ARRAY.filter((p) => purpose_search_names.includes(p.name))
    );
    setSizeSearch(
      SHIP_SIZE_ARRAY.filter((s) => size_search_names.includes(s.name))
    );
    setPropulsionSearch(
      SHIP_PROPULSION_ARRAY.filter((p) =>
        propulsion_search_names.includes(p.name)
      )
    );
    setShipSkillSearch(
      SHIP_SKILL_OPTION_ARRAY.filter((s) => ship_skill_search_names.includes(s))
    );
  }, [
    name_search,
    purpose_search_names.join(","),
    size_search_names.join(","),
    propulsion_search_names.join(","),
    ship_skill_search_names.join(","),
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
      "ships",
      page,
      rowsPerPage,
      name_search,
      purpose_search_names,
      size_search_names,
      propulsion_search_names,
      ship_skill_search_names,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/ships", {
        params: {
          name_search,
          purpose_search: purpose_search_names.join(","),
          size_search: size_search_names.join(","),
          propulsion_search: propulsion_search_names.join(","),
          ship_skill_search: ship_skill_search_names.join(","),
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data);
      const processedItems = response.data.items.map((item: any) => {
        if (item.extraname) {
          return { ...item, name: `${item.name} ${item.extraname}` };
        }
        return item;
      });
      return { ...response.data, items: processedItems };
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    {
      id: "category_purpose",
      label: "용도",
      minWidth: 100,
    },
    {
      id: "category_size",
      label: "크기",
      minWidth: 100,
    },
    {
      id: "category_propulsion",
      label: "추진",
      minWidth: 100,
    },
    {
      id: "required_levels_adventure",
      label: "모험 Lv",
      minWidth: 80,
    },
    {
      id: "required_levels_trade",
      label: "교역 Lv",
      minWidth: 80,
    },
    {
      id: "required_levels_battle",
      label: "전투 Lv",
      minWidth: 80,
    },
    {
      id: "capacity_cabin",
      label: "선실",
      minWidth: 80,
    },
    {
      id: "capacity_required_crew",
      label: "필요 선원",
      minWidth: 80,
    },
    {
      id: "capacity_gunport",
      label: "포실",
      minWidth: 80,
    },
    {
      id: "capacity_cargo",
      label: "창고",
      minWidth: 80,
    },
    {
      id: "base_performance_durability",
      label: "기본 내구도",
      minWidth: 80,
    },
    {
      id: "base_performance_vertical_sail",
      label: "기본 세로돛",
      minWidth: 80,
    },
    {
      id: "base_performance_horizontal_sail",
      label: "기본 가로돛",
      minWidth: 80,
    },
    {
      id: "base_performance_rowing_power",
      label: "기본 조력",
      minWidth: 80,
    },
    {
      id: "base_performance_maneuverability",
      label: "기본 선회",
      minWidth: 80,
    },
    {
      id: "base_performance_wave_resistance",
      label: "기본 내파",
      minWidth: 80,
    },
    {
      id: "base_performance_armor",
      label: "기본 장갑",
      minWidth: 80,
    },
    {
      id: "max_durability",
      label: "최대 내구도",
      minWidth: 80,
    },
    {
      id: "max_vertical_sail",
      label: "최대 세로돛",
      minWidth: 80,
    },
    {
      id: "max_horizontal_sail",
      label: "최대 가로돛",
      minWidth: 80,
    },
    {
      id: "max_rowing_power",
      label: "최대 조력",
      minWidth: 80,
    },
    {
      id: "max_maneuverability",
      label: "최대 선회",
      minWidth: 80,
    },
    {
      id: "max_wave_resistance",
      label: "최대 내파",
      minWidth: 80,
    },
    {
      id: "max_armor",
      label: "최대 장갑",
      minWidth: 80,
    },
    {
      id: "max_cabin",
      label: "최대 선실",
      minWidth: 80,
    },
    {
      id: "max_gunport",
      label: "최대 포실",
      minWidth: 80,
    },
    {
      id: "max_cargo",
      label: "최대 창고",
      minWidth: 80,
    },
    {
      id: "max_sum_sail",
      label: "최대 돛수치 합",
      minWidth: 80,
    },
    {
      id: "max_sum_sail_row_power",
      label: "최대 돛+조력",
      // minWidth: 80,
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
      purpose_search: purposeSearch.map((p) => p.name).join(","),
      size_search: sizeSearch.map((s) => s.name).join(","),
      propulsion_search: propulsionSearch.map((p) => p.name).join(","),
      ship_skill_search : shipSkillSearch.join(","),
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setPurposeSearch([]);
    setSizeSearch([]);
    setPropulsionSearch([]);
    setShipSkillSearch([]);
    setSearchParams({ rowsPerPage: searchParams.get("rowsPerPage") || "10" });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    updateSearchParams({ rowsPerPage: newRowsPerPage, page: 0 });
  };

  const handleSortChange = (columnId: string) => {
    let newSortOrder: "asc" | "desc" = "desc"; // Default to descending for first click
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
        선박
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <TextField
          label="선박 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Autocomplete
          multiple
          id="purpose-filter"
          options={SHIP_PURPOSE_ARRAY}
          getOptionLabel={(option) => option.name}
          value={purposeSearch}
          onChange={(_, newValue) => setPurposeSearch(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="용도"
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
        <Autocomplete
          multiple
          id="size-filter"
          options={SHIP_SIZE_ARRAY}
          getOptionLabel={(option) => option.name}
          value={sizeSearch}
          onChange={(_, newValue) => setSizeSearch(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="크기"
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
        <Autocomplete
          multiple
          id="propulsion-filter"
          options={SHIP_PROPULSION_ARRAY}
          getOptionLabel={(option) => option.name}
          value={propulsionSearch}
          onChange={(_, newValue) => setPropulsionSearch(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="추진"
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
        <Autocomplete
          multiple
          id="shipskill-filter"
          options={SHIP_SKILL_OPTION_ARRAY}
          value={shipSkillSearch}
          onChange={(_, newValue) => setShipSkillSearch(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="선박스킬"
              sx={{ minWidth: 200 }}
            />
          )}
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

export default Ships;
