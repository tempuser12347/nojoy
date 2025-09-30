import { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import api from '../../api';

interface Shipwreck {
  id: number;
  type: string;
  name: string;
  difficulty: string;
  sea_area: string;
  destination: string;
  skill: string;
}

export default function Shipwrecks() {
  const [shipwrecks, setShipwrecks] = useState<Shipwreck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipwrecks = async () => {
      try {
        const response = await api.get('/api/shipwrecks', {
          params: {
            search,
            skip: page * rowsPerPage,
            limit: rowsPerPage,
          },
        });
        console.log(response.data);
        setShipwrecks(response.data);
      } catch (err) {
        setError('Failed to load shipwrecks');
        console.error('Error fetching shipwrecks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShipwrecks();
  }, [search, page, rowsPerPage]);

  const columns = [
    { id: 'name', label: '이름' },
    { id: 'difficulty', label: '난이도' },
    { id: 'sea_area', label: '해역' },
    { id: 'destination', label: '목적지' },
    { id: 'skill', label: '필요스킬' },
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
      <Typography variant="h4" gutterBottom>침몰선</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="이름검색"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 200 }}
        />
      </Box>
      <DataTable
        columns={columns}
        data={shipwrecks}
        loading={loading}
        onRowClick={(row) => navigate(`/침몰선/${row.id}`)}
        page={page}
        rowsPerPage={rowsPerPage}
        total={shipwrecks.length}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
      />
    </Box>
  );
}