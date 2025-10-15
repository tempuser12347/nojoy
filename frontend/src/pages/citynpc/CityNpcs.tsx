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
  { id: 'id', label: 'ID', minWidth: 50 },
  { id: 'name', label: '이름', minWidth: 170 },
  { id: 'extraname', label: '부가명칭', minWidth: 170 },
  { id: 'city', label: '도시', minWidth: 100, format: (value: any) => value && value.name },
  { id: 'skills', label: '스킬', minWidth: 200, format: (value: any) => value && value.map((skill: any) => skill.name).join(', ') },
];

const CityNpcs: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const name_search = searchParams.get('name_search') || '';

  const [searchInput, setSearchInput] = React.useState(name_search);

  useEffect(() => {
    setSearchInput(name_search);
  }, [name_search]);

  const updateSearchParams = (newParams: Record<string, any>) => {
    const currentParams = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      value ? currentParams.set(key, value) : currentParams.delete(key);
    });
    setSearchParams(currentParams);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['citynpcs', page, rowsPerPage, name_search],
    queryFn: async () => {
      const response = await api.get('/api/citynpcs', {
        params: {
          name_search,
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

  return (
    <Box sx={{ width: '100%', p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>도시 NPC</Typography>
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
        onRowClick={(row) => navigate(`/obj/${row.id}`)}
      />
    </Box>
  );
};

export default CityNpcs;
