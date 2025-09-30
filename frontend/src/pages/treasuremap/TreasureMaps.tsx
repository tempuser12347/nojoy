import { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/DataTable';
import api from '../../api';

interface TreasureMap {
  id: number;
  name: string;
  category: string;
  required_skill: string;
  academic_field: string;
  library: string,
  destination: string,
  discovery: string
}

export default function TreasureMaps() {
  const [treasureMaps, setTreasureMaps] = useState<TreasureMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreasureMaps = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/treasuremaps', {
          params: {
            search,
            skip: page * rowsPerPage,
            limit: rowsPerPage,
          },
        });
        setTreasureMaps(response.data);
      } catch (err) {
        setError('Failed to load treasure maps');
        console.error('Error fetching treasure maps:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTreasureMaps();
  }, [search, page, rowsPerPage]);

  const columns = [
    { id: 'name', label: '이름' },
    { id: 'category', label: '분류' },
    { id: 'required_skill', label: '필요스킬' },
    { id: 'academic_field', label: '학문' },
    { id: 'library', label: '서고' },
    { id: 'destination', label: '목적지' },
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
      <Typography variant="h4" gutterBottom>보물 지도</Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          label="이름 검색"
          variant="outlined"
          value={search}
          onChange={handleSearchChange}
          sx={{ minWidth: 200 }}
        />
      </Box>
      <DataTable
        columns={columns}
        data={treasureMaps}
        loading={loading}
        onRowClick={(row) => navigate(`/보물지도/${row.id}`)}
        page={page}
        rowsPerPage={rowsPerPage}
        total={treasureMaps.length} // Note: This might need adjustment for server-side pagination total count
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
      />
    </Box>
  );
}