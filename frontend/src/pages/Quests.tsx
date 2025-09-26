import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
} from '@mui/material';
import DataTable from '../components/DataTable';
import api from '../api';
import { renderObjectsToChips } from '../common/render';

interface Skill {
  ref: string;
  name: string;
  value: number;
}

const Quests: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['quests', page, rowsPerPage, search],
    queryFn: async () => {
      const response = await api.get('/api/quests', {
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

  const columns = [
    { id: 'name', label: '이름', minWidth: 170 },
    { id: 'type', label: '종류', minWidth: 100 },
    { id: 'difficulty', label: '난이도', minWidth: 100 },
    { id: 'location', label: '의뢰장소', minWidth: 170 },
    { id: 'destination', label: '목적지', minWidth: 170, format: (value: any) => <Typography>{value ? value.name : ''}</Typography> },
    { id: 'skills', label: '필요스킬', minWidth: 200, format: (value: Skill[]) => renderObjectsToChips(value, navigate) },
  ];


  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>퀘스트</Typography>
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
        data={data || []}
        loading={isLoading}
        total={data?.length || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/퀘스트/${row.id}`)}
      />
    </Box>
  );
};

export default Quests;