import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
} from '@mui/material';
import DataTable from '../../components/DataTable';
import api from '../../api';

const columns = [
  { id: 'name', label: '필드명', minWidth: 170 },
];

const Fields: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['fields', page, rowsPerPage, search],
    queryFn: async () => {
      const response = await api.get('/api/field', {
        params: {
          search,
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      console.log(response.data)
      return response.data;
    },
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>필드</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
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
        data={data.items || []}
        loading={isLoading}
        total={data.total || 0}
        page={page}
        rowsPerPage={setRowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/obj/${row.id}`)}
      />
    </Box>
  );
};

export default Fields;
