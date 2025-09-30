import { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import api from '../../api';

interface Ship {
  id: number;
  name: string;
  type: string;
  size: string;
  category: string;
  lv_adventure: number;
  lv_trade: number;
  lv_battle: number;
}

export default function Ships() {
  const [ships, setShips] = useState<Ship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShips = async () => {
      try {
        const response = await api.get('/api/ships', {
          params: {
            search,
            skip: page * rowsPerPage,
            limit: rowsPerPage,
          },
        });
        setShips(response.data);
      } catch (err) {
        setError('Failed to load ships');
        console.error('Error fetching ships:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShips();
  }, [search, page, rowsPerPage]);

  const columns = [
    { id: 'name', label: '이름' },
    { id: 'type', label: '종류' },
    { id: 'size', label: '크기' },
    { id: 'category', label: '분류' },
    { id: 'lv_adventure', label: '모험' },
    { id: 'lv_trade', label: '교역' },
    { id: 'lv_battle', label: '전투' },
  ];

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>선박</Typography>
      <TextField label="이름검색" variant="outlined" value={search} onChange={handleSearchChange} sx={{ mb: 2, minWidth: 200 }} />
      <DataTable
        columns={columns}
        data={ships}
        loading={loading}
        onRowClick={(row) => navigate(`/선박/${row.id}`)}
        page={page}
        rowsPerPage={rowsPerPage}
        total={ships.length} // Note: This should be updated to use a total count from the API for proper pagination.
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
      />
    </Box>
  );
}