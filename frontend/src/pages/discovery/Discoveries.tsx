import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography
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
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [type, setType] = React.useState('');
  const [search, setSearch] = React.useState('');

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
      console.log(response.data);
      return response.data;
    },
  });

  const handleTypeChange = (event: SelectChangeEvent) => {
    setType(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>발견물</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>종류</InputLabel>
          <Select value={type} onChange={handleTypeChange} label="종류">
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
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 200 }}
        />
      </Box>

      <DataTable
        columns={columns}
        data={data || []}
        loading={isLoading}
        total={data?.length || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/발견물/${row.id}`)}
      />
    </Box>
  );
};

export default Discoveries;