
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
  { id: 'category', label: '카테고리', minWidth: 100 },
  { id: 'difficulty', label: '난이도', minWidth: 100 },
  { id: 'discovery_method', label: '발견 방법', minWidth: 170 },
];

const Discoveries: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);
  const rowsPerPage = parseInt(searchParams.get('rowsPerPage') || '10', 10);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const [categoryInput, setCategoryInput] = React.useState(category);
  const [searchInput, setSearchInput] = React.useState(search);

  useEffect(() => {
    setCategoryInput(category);
    setSearchInput(search);
  }, [category, search]);

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
    queryKey: ['discoveries', page, rowsPerPage, category, search],
    queryFn: async () => {
      const response = await api.get('/api/discoveries', {
        params: {
          category,
          search,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      return response.data;
    },
  });

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategoryInput(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    updateSearchParams({
      category: categoryInput,
      search: searchInput,
      page: 0,
    });
  };

  const resetFilters = () => {
    setCategoryInput('');
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
          <InputLabel>카테고리</InputLabel>
          <Select value={categoryInput} onChange={handleCategoryChange} label="카테고리">
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="역사유물">역사유물</MenuItem>
            <MenuItem value="종교유물">종교유물</MenuItem>
            <MenuItem value="미술품">미술품</MenuItem>
            <MenuItem value="천문">천문</MenuItem>
            <MenuItem value="해양생물">해양생물</MenuItem>
            <MenuItem value="보물">보물</MenuItem>
            <MenuItem value="조류">조류</MenuItem>
            <MenuItem value="식물">식물</MenuItem>
            <MenuItem value="항구-마을">항구-마을</MenuItem>
            <MenuItem value="중형생물">중형생물</MenuItem>
            <MenuItem value="지리">지리</MenuItem>
            <MenuItem value="화석">화석</MenuItem>
            <MenuItem value="대형생물">대형생물</MenuItem>
            <MenuItem value="소형생물">소형생물</MenuItem>
            <MenuItem value="기상 현상">기상 현상</MenuItem>
            <MenuItem value="곤충">곤충</MenuItem>
            <MenuItem value="사적">사적</MenuItem>
            <MenuItem value="종교건축물">종교건축물</MenuItem>
            <MenuItem value="전승">전승</MenuItem>
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
