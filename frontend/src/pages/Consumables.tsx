import { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import api from '../api';

interface Consumable {
  id: number;
  name: string;
  category: string;
  type: string;
  features: string;
}

export default function Consumables() {
  const [consumables, setConsumables] = useState<Consumable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsumables = async () => {
      try {
        const response = await api.get('/api/consumables', {
          params: {
            search,
            skip: page * rowsPerPage,
            limit: rowsPerPage,
          },
        });
        setConsumables(response.data);
      } catch (err) {
        setError('Failed to load consumables');
        console.error('Error fetching consumables:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConsumables();
  }, [search, page, rowsPerPage]);

  const columns = [
    { id: 'name', label: '이름' },
    { id: 'category', label: '카테고리' },
    { id: 'type', label: '타입' },
    { id: 'features', label: '특징' },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>소비품</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField label="이름검색" variant="outlined" value={search} onChange={handleSearchChange} sx={{ minWidth: 200 }} />
      </Box>
      <DataTable columns={columns} data={consumables} loading={loading} onRowClick={(row) => navigate(`/소비품/${row.id}`)} page={page} rowsPerPage={rowsPerPage} total={consumables.length} onPageChange={setPage} onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }} />
    </Box>
  );
}