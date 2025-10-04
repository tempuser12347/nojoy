
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
import { renderObjectsToChips } from "../../common/render";
import { QUEST_FILTER_LOCATION_ARRAY } from "../../constants/listvalues";

interface City {
  id: number;
  name: string;
}

const sampleCities: City[] = QUEST_FILTER_LOCATION_ARRAY.map((city) => ({
  id: city.id,
  name: city.name,
}));

const NpcSales: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "0", 10);
  const rowsPerPage = parseInt(searchParams.get("rowsPerPage") || "10", 10);
  const npc_search = searchParams.get("npc_search") || "";
  const location_search_id = searchParams.get("location_search");
  const item_search = searchParams.get("item_search") || "";
  const sort_by = searchParams.get("sort_by") || "id";
  const sort_order =
    (searchParams.get("sort_order") as "asc" | "desc") || "desc";

  const [npcSearchInput, setNpcSearchInput] = React.useState(npc_search);
  const [locationSearch, setLocationSearch] = React.useState<City | null>(
    sampleCities.find((c) => c.id === Number(location_search_id)) || null
  );
  const [itemSearchInput, setItemSearchInput] = React.useState(item_search);

  useEffect(() => {
    setNpcSearchInput(npc_search);
    setLocationSearch(
      sampleCities.find((c) => c.id === Number(location_search_id)) || null
    );
    setItemSearchInput(item_search);
  }, [npc_search, location_search_id, item_search]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value
        ? currentParams.set(key, String(value))
        : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: [
      "npcsale",
      page,
      rowsPerPage,
      npc_search,
      location_search_id,
      item_search,
      sort_by,
      sort_order,
    ],
    queryFn: async () => {
      const response = await api.get("/api/npcsale", {
        params: {
          npc_search,
          location_search: location_search_id,
          item_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data)
      return response.data;
    },
  });

  const columns = [
    { id: "npc", label: "NPC" },
    {
      id: "location",
      label: "판매장소",
      format: (value: City) => (
        <Chip
          key={value?.id}
          label={value?.name || ""}
          onClick={() => navigate(`/city/${value.id}`)}
        />
      ),
    },
    {
      id: "items",
      label: "판매 아이템",
      format: (value: any[]) => renderObjectsToChips(value, navigate),
    },
  ];

  const handleSearch = () => {
    updateSearchParams({
      npc_search: npcSearchInput,
      location_search: locationSearch?.id,
      item_search: itemSearchInput,
      page: 0,
    });
  };

  const resetFilters = () => {
    setNpcSearchInput("");
    setLocationSearch(null);
    setItemSearchInput("");
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
        NPC 판매
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <TextField
          label="NPC 검색"
          variant="outlined"
          value={npcSearchInput}
          onChange={(e) => setNpcSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Autocomplete
          id="location-filter"
          options={sampleCities}
          getOptionLabel={(option) => option.name}
          value={locationSearch}
          onChange={(_, newValue) => setLocationSearch(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              label="판매장소"
              sx={{ minWidth: 200 }}
            />
          )}
        />
        <TextField
          label="아이템 검색"
          variant="outlined"
          value={itemSearchInput}
          onChange={(e) => setItemSearchInput(e.target.value)}
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

export default NpcSales;
