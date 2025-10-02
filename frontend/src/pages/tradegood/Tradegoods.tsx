import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";

const categories = [
  {
    name: "카테고리 1",
    classifications: ["식료품", "조미료", "가축", "의약품", "잡화"],
  },
  {
    name: "카테고리 2",
    classifications: ["주류", "염료", "광석", "공업품", "기호품"],
  },
  {
    name: "카테고리 3",
    classifications: ["섬유", "직물", "무기류", "총포류", "미술품", "공예품"],
  },
  { name: "카테고리 4", classifications: ["향신료", "귀금속", "향료", "보석"] },
];

const Tradegoods: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const classification_search = searchParams.get("classification_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "asc";

  const [searchInput, setSearchInput] = React.useState(name_search);
  const [selectedClassifications, setSelectedClassifications] = React.useState<
    string[]
  >(classification_search ? classification_search.split(",") : []);

  useEffect(() => {
    setSearchInput(name_search);
    setSelectedClassifications(
      classification_search ? classification_search.split(",") : []
    );
  }, [name_search, classification_search]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "tradegoods",
      page,
      rowsPerPage,
      name_search,
      classification_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/tradegoods", {
        params: {
          name_search,
          classification_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      return response.data;
    },
  });

  const columns = [
    { id: "name", label: "이름" },
    { id: "category", label: "카테고리" },
    { id: "classification", label: "분류" },
    { id: "description", label: "설명" },
  ];

  const handleSearch = () => {
    const newParams: Record<string, any> = {
      name_search: searchInput,
      classification_search: selectedClassifications.join(","),
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSelectedClassifications([]);
    setSearchParams({ rowsPerPage: searchParams.get("rowsPerPage") || "10" });
  };

  const handleClassificationChange = (
    classification: string,
    checked: boolean
  ) => {
    setSelectedClassifications((prev) =>
      checked
        ? [...prev, classification]
        : prev.filter((c) => c !== classification)
    );
  };

  const handleCategoryChange = (
    categoryClassifications: string[],
    checked: boolean
  ) => {
    setSelectedClassifications((prev) => {
      const otherClassifications = prev.filter(
        (c) => !categoryClassifications.includes(c)
      );
      return checked
        ? [...otherClassifications, ...categoryClassifications]
        : otherClassifications;
    });
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
        교역품
      </Typography>
      <Box sx={{ mb: 2, p: 2, border: "1px solid grey", borderRadius: 1 }}>
        {categories.map((category) => {
          const categoryClassifications = category.classifications;
          const selectedInCategory = categoryClassifications.filter((c) =>
            selectedClassifications.includes(c)
          ).length;
          const allSelected = selectedInCategory === categoryClassifications.length;
          const someSelected =
            selectedInCategory > 0 && !allSelected;

          return (
            <FormGroup key={category.name} row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={(e) =>
                      handleCategoryChange(
                        categoryClassifications,
                        e.target.checked
                      )
                    }
                  />
                }
                label={category.name}
                sx={{ fontWeight: "bold", minWidth: 120 }}
              />
              <Grid container>
                {category.classifications.map((classification) => (
                  <Grid item key={classification}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedClassifications.includes(
                            classification
                          )}
                          onChange={(e) =>
                            handleClassificationChange(
                              classification,
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={classification}
                    />
                  </Grid>
                ))}
              </Grid>
            </FormGroup>
          );
        })}
      </Box>
      <Box sx={{ display: "flex", gap: 1, mb: 2, alignItems: "center" }}>
        <TextField
          label="이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
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
        onRowClick={(row) => navigate(`/교역품/${row.id}`)}
      />
    </Box>
  );
};

export default Tradegoods;
