
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import DataTable from '../../components/DataTable';
import api from '../../api';

const columns = [
  { id: 'name', label: '이름', minWidth: 170 },
  { id: 'type', label: '종류', minWidth: 100 },
  { id: 'category', label: '분류', minWidth: 100 },
  { id: 'difficulty', label: '난이도', minWidth: 100 },
  { id: 'discovery_method', label: '발견 방법', minWidth: 170 },
];

const Discoveries: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const type = searchParams.get('type') || '';
  const search = searchParams.get('search') || '';

  const [typeInput, setTypeInput] = React.useState(type);
  const [searchInput, setSearchInput] = React.useState(search);

  useEffect(() => {
    setTypeInput(type);
    setSearchInput(search);
  }, [type, search]);

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
    queryKey: ['discoveries', page, rowsPerPage, type, search],
    queryFn: async () => {
      const response = await api.get('/api/discoveries', {
        params: {
          type,
          search,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      return response.data;
    },
  });

  const handleTypeChange = (event: SelectChangeEvent) => {
    setTypeInput(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    updateSearchParams({
      type: typeInput,
      search: searchInput,
      page: 0,
    });
  };

  const resetFilters = () => {
    setTypeInput('');
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
      <Typography variant="h4" gutterBottom>발견물</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>종류</InputLabel>
          <Select value={typeInput} onChange={handleTypeChange} label="종류">
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="발견물">발견물</MenuItem>
            <MenuItem value="퀘스트">퀘스트</MenuItem>
            <MenuItem value="보물지도">보물지도</MenuItem>
            <MenuItem value="침몰선">침몰선</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchChange}
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
        onRowClick={(row) => navigate(`/발견물/${row.id}`)}
      />
    </Box>
  );
};

export default Discoveries;
