import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent } from '@mui/material';
import api from '../../api';

interface Consumable {
  id: number;
  name: string;
  additional_Name: string;
  description: string;
  category: string;
  type: string;
  usage_Effect: any;
  features: string;
  Item: string;
  Duplicate: string;
}

export default function ConsumableDetail() {
  const { id } = useParams<{ id: string }>();
  const [consumable, setConsumable] = useState<Consumable | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConsumable = async () => {
      try {
        const response = await api.get(`/api/consumables/${id}`);
        setConsumable(response.data);
      } catch (err) {
        setError('Failed to load consumable details');
        console.error('Error fetching consumable:', err);
      }
    };

    if (id) {
      fetchConsumable();
    }
  }, [id]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!consumable) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{consumable.name}</Typography>
      {consumable.additional_Name && (
        <Typography variant="h6" color="text.secondary" gutterBottom>{consumable.additional_Name}</Typography>
      )}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">카테고리</Typography>
              <Typography variant="body1">{consumable.category}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">타입</Typography>
              <Typography variant="body1">{consumable.type}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography variant="subtitle1" color="text.secondary">설명</Typography>
              <Typography variant="body1">{consumable.description}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
              <Typography variant="subtitle1" color="text.secondary">특징</Typography>
              <Typography variant="body1">{consumable.features}</Typography>
            </Box>
            {consumable.usage_Effect && (
              <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
                <Typography variant="subtitle1" color="text.secondary">사용효과</Typography>
                <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                  {typeof consumable.usage_Effect === 'object'
                    ? JSON.stringify(consumable.usage_Effect, null, 2)
                    : consumable.usage_Effect}
                </Typography>
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" color="text.secondary">아이템</Typography>
              <Typography variant="body1">{consumable.Item || '-'}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">중복</Typography>
              <Typography variant="body1">{consumable.Duplicate || '-'}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}