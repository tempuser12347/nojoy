import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  TextField,
  Typography,
  Button,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox, Grid
} from "@mui/material";
import DataTable from "../../components/DataTable";
import api from "../../api";

const MEMORIAL_ALBUM_CATEGORIES = [
  "장비품",
  "아이템",
  "교역품",
  "유적",
  "장식물",
  "낚시",
  "선박품",
  "음식",
  "지도",
  "답례품",
];

const MemorialAlbums: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const name_search = searchParams.get("name_search") || "";
  const category_search = searchParams.get("category_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order = (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  const [searchInput, setSearchInput] = React.useState(name_search);
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    category_search ? category_search.split(",") : []
  );

  useEffect(() => {
    setSearchInput(name_search);
    setSelectedCategories(category_search ? category_search.split(",") : []);
  }, [name_search, category_search]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "memorialalbums",
      page,
      rowsPerPage,
      name_search,
      category_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/memorialalbums", {
        params: {
          name_search,
          category_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data);
      const processedItems = response.data.items.map((item: any) => {
        return {
          ...item,
          reward_item_name: item.reward_item ? item.reward_item.name : "",
          reward_npc_name: item.reward_npc ? item.reward_npc.name : "",
        };
      });
      return { ...response.data, items: processedItems };
    },
  });

  const columns = [
    { id: "name", label: "이름", minWidth: 170 },
    { id: "category", label: "카테고리", minWidth: 100 },
    { id: "reward_item_name", label: "보상 아이템", minWidth: 100 },
    { id: "reward_npc_name", label: "보상 NPC", minWidth: 100 },
  ];

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSearchInput(event.target.value);
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.name;
    setSelectedCategories((prev) =>
      event.target.checked ? [...prev, value] : prev.filter((c) => c !== value)
    );
  };

  const handleSearch = () => {
    const newParams: Record<string, any> = {
      name_search: searchInput,
      category_search: selectedCategories.join(","),
      page: 0,
    };
    updateSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSelectedCategories([]);
    setSearchParams({ rowsPerPage: searchParams.get("rowsPerPage") || "10" });
  };

  const handlePageChange = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    updateSearchParams({ rowsPerPage: newRowsPerPage, page: 0 });
  };

  const handleSortChange = (columnId: string) => {
    let newSortOrder: "asc" | "desc" = "desc";
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
        메모리얼 앨범
      </Typography>
      <Grid container spacing={2} >
      <Grid size={{xs: 12, md: 4}} sx={{justifyContent: "center", alignItems: "center", display: "flex"}}>

        <TextField
          label="이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
      </Grid>
      <Grid size={{xs:12, md: 8}} sx={{justifyContent: "center", alignItems: "center", display: "flex", border: '1px solid #ccc', borderRadius: '4px', padding: '8px'}} >

        <FormControl component="fieldset" >
          <FormLabel component="legend">카테고리</FormLabel>
          <FormGroup row>
            {MEMORIAL_ALBUM_CATEGORIES.map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(category)}
                    onChange={handleCategoryChange}
                    name={category}
                  />
                }
                label={category}
              />
            ))}
          </FormGroup>
        </FormControl>
      </Grid>
      <Grid size={{xs: 12}} sx={{justifyContent: "center", alignItems: "center", display: "flex", gap: 1}} >
        <Button variant="contained" onClick={handleSearch}>
          검색
        </Button>
        <Button variant="outlined" onClick={resetFilters}>
          초기화
        </Button>
      </Grid>
      </Grid>
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
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

export default MemorialAlbums;