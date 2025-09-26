import { useEffect, useState } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import api from '../api';
import { renderObjectsToChips } from '../common/render';

interface Recipe {
  id: number;
  name: string;
  description: string;
  required_Skill: Array<{ref: string; name: string; value: number;}>;
  ingredients: Array<{ref: string; name: string; value: number;}>;
  sophia: number;
  era: string;
  central_city: string;
  Investment_cost: number;
}

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await api.get('/api/recipes', {
          params: {
            search,
            skip: page * rowsPerPage,
            limit: rowsPerPage,
          },
        });
        setRecipes(response.data);
      } catch (err) {
        setError('Failed to load recipes');
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [search, page, rowsPerPage]);

  const columns = [
    { id: 'name', label: '이름' },
    { 
      id: 'required_Skill', 
      label: '필요스킬',
      format: (value: Recipe['required_Skill']) => renderObjectsToChips(value, navigate)
    },
    { 
      id: 'ingredients', 
      label: '재료',
      format: (value: Recipe['ingredients']) => renderObjectsToChips(value, navigate)
    },
    { id: 'sophia', label: '소피아' },
    { id: 'era', label: '시대' },
    { id: 'central_city', label: '중앙도시' },
    { id: 'Investment_cost', label: '투자비용' },
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
      <Typography variant="h4" gutterBottom>레시피</Typography>
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
        data={recipes}
        loading={loading}
        onRowClick={(row) => navigate(`/레시피/${row.id}`)}
        page={page}
        rowsPerPage={rowsPerPage}
        total={recipes.length}
        onPageChange={setPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setPage(0);
          setRowsPerPage(newRowsPerPage);
        }}
      />
    </Box>
  );
}