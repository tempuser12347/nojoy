import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import DataTable from '../../components/DataTable';
import api from '../../api';


const columns = [
  { id: 'name', label: '이름', minWidth: 170 },
  { id: 'durability', label: '내구도', minWidth: 100 },
  { id: 'vertical_sail', label: '세로돛', minWidth: 100 },
  { id: 'horizontal_sail', label: '가로돛', minWidth: 100 },
  { id: 'rowing_power', label: '노젓기', minWidth: 100 },
  { id: 'maneuverability', label: '선회', minWidth: 100 },
  { id: 'wave_resistance', label: '내파', minWidth: 100 },
  { id: 'armor', label: '장갑', minWidth: 100 },
  { id: 'cabin', label: '선실', minWidth: 100 },
  { id: 'gunport', label: '포문', minWidth: 100 },
  { id: 'cargo', label: '창고', minWidth: 100 },
];

const ShipMaterials: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const name_search = searchParams.get('name_search') || '';
  const sort_by = searchParams.get('sort_by') || 'id';
  const sort_order = (searchParams.get('sort_order') as 'asc' | 'desc') || 'desc';

  const [searchInput, setSearchInput] = React.useState(name_search);

  useEffect(() => {
    setSearchInput(name_search);
  }, [name_search, sort_by, sort_order]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['shipmaterials', page, rowsPerPage, name_search, sort_by, sort_order],
    queryFn: async () => {
      const response = await api.get('/api/shipmaterials', {
        params: {
          name_search,
          sort_by,
          sort_order,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      return response.data;
    },
  });

  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    updateSearchParams({ name_search: searchInput, page: 0 });
  };

  const resetFilters = () => {
    setSearchInput('');
    setSearchParams({ rowsPerPage: searchParams.get('rowsPerPage') || '10' });
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
    <Box sx={{ width: '100%', p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>선박 재료</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="이름검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

export default ShipMaterials;
