import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";
import { renderObjectsToChips } from "../../common/render";

interface Skill {
  id: number;
  name: string;
  value: number;
}

const classificationOptions = [
  "장신구",
  "머리",
  "몸",
  "도구",
  "다리",
  "팔",
];

const weaponOptions = [
  "검",
  "창",
  "던지는 나이프",
  "곤봉 지팡이",
  "총",
  "도끼",
  "활",
  "권총",
  "크로스보우",
];

const Equipments: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State initialization from URL search params
  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order = (searchParams.get("sort_order") as 'asc' | 'desc') || "desc";
  const classification = searchParams.get("classification")?.split(",") || [];

  // Component state for inputs
  const [searchInput, setSearchInput] = React.useState(name_search);
  const [classificationFilter, setClassificationFilter] =
    React.useState<string[]>(classification);

  // Sync local state with URL search params on mount/change
  useEffect(() => {
    setSearchInput(name_search);
    setClassificationFilter(classification);
  }, [name_search, searchParams]);

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
      classification,
    ],
    queryFn: async () => {
      const response = await api.get("/api/equipment", {
        params: {
          name_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
          classification: classification.join(","),
        },
      });
      return response.data; // Expecting { items: [], total: 0 }
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "classification", label: "분류" },
    { id: "attack_power", label: "공격력" },
    { id: "defense_power", label: "방어력" },
    { id: "durability", label: "내구도" },
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

  const handleClassificationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = event.target;
    setClassificationFilter((prev) =>
      checked ? [...prev, name] : prev.filter((item) => item !== name)
    );
  };

  const handleWeaponChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (name === "무기") {
      if (checked) {
        setClassificationFilter((prev) => [
          ...prev.filter((item) => !weaponOptions.includes(item)),
          ...weaponOptions,
        ]);
      } else {
        setClassificationFilter((prev) =>
          prev.filter((item) => !weaponOptions.includes(item))
        );
      }
    } else {
      setClassificationFilter((prev) =>
        checked ? [...prev, name] : prev.filter((item) => item !== name)
      );
    }
  };

  const handleSearch = () => {
    updateSearchParams({
      name_search: searchInput,
      page: 0,
      classification: classificationFilter.join(","),
    });
  };

  const resetFilters = () => {
    setSearchInput("");
    setClassificationFilter([]);
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

  const selectedWeaponsCount = classificationFilter.filter((c) =>
    weaponOptions.includes(c)
  ).length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mb: 2,
        flexWrap: "wrap",
      }}
    >
      <Typography variant="h4" gutterBottom>
        장비품
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          label="장비품 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <FormControl component="fieldset">
          <FormLabel component="legend">분류</FormLabel>
          <FormGroup row>
            <FormControl component="fieldset">
              <FormControlLabel
                label="무기"
                control={
                  <Checkbox
                    checked={selectedWeaponsCount === weaponOptions.length}
                    indeterminate={
                      selectedWeaponsCount > 0 &&
                      selectedWeaponsCount < weaponOptions.length
                    }
                    onChange={handleWeaponChange}
                    name="무기"
                  />
                }
              />
              <Box sx={{ display: "flex", flexDirection: "row", ml: 3 }}>
                {weaponOptions.map((option) => (
                  <FormControlLabel
                    key={option}
                    control={
                      <Checkbox
                        checked={classificationFilter.includes(option)}
                        onChange={handleWeaponChange}
                        name={option}
                      />
                    }
                    label={option}
                  />
                ))}
              </Box>
            </FormControl>
            {classificationOptions.map((option) => (
              <FormControlLabel
                key={option}
                control={
                  <Checkbox
                    checked={classificationFilter.includes(option)}
                    onChange={handleClassificationChange}
                    name={option}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
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

