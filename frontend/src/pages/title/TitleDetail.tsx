import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface Title {
  id: number;
  name: string;
  description: string | null;
  requirements: any;
  effect: string | null;
}

export default function TitleDetail({ data }: { data?: Title }) {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState<Title | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTitle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/titles/${id}`);
        setTitle(response.data);
      } catch (err) {
        setError("Failed to load Title details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTitle();
    }
  }, [id, data]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 3 }}>
        {error}
      </Typography>
    );
  }

  if (!title) {
    return <Typography sx={{ p: 3 }}>Title not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {title.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={title.description} />
          </Box>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="요구 사항" value={title.requirements} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <DetailItem
              label="효과"
              value={
                <div dangerouslySetInnerHTML={{ __html: title.effect || "" }} />
              }
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
