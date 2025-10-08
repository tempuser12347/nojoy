import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Typography, Card, CardContent } from "@mui/material";
import api from "../../api";

interface Field {
  id: number;
  name: string;
}

export default function FieldDetail({ data }: { data: Field }) {
  const { id } = useParams<{ id: string }>();
  const [field, setField] = useState<Field>(data);
  const [loading, setLoading] = useState(!data);

  useEffect(() => {
    const fetchField = async () => {
      try {
        const response = await api.get(`/api/field/${id}`);
        console.log(response.data)
        setField(response.data);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchField();
    }
  }, [id, data]);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {field.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                이름
              </Typography>
              <Typography variant="body1">{field.name}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
