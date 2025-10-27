import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip } from "../../common/render";

interface LegacyClue {
  id: number;
  name: string;
  description: string | null;
  theme: { id: number; name: string } | null;
  acquisition_method: string | null;
  acquisition_method_detail: string | null;
}

export default function LegacyClueDetail({ data }: { data?: LegacyClue }) {
  const { id } = useParams<{ id: string }>();
  const [legacyClue, setLegacyClue] = useState<LegacyClue | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLegacyClue = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/legacyclues/${id}`);
        setLegacyClue(response.data);
      } catch (err) {
        setError("Failed to load Legacy Clue details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchLegacyClue();
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

  if (!legacyClue) {
    return <Typography sx={{ p: 3 }}>Legacy Clue not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {legacyClue.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={legacyClue.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <DetailItem
                label="테마"
                value={legacyClue.theme ? renderObjectChip(legacyClue.theme, navigate) : null}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DetailItem label="획득 방법" value={legacyClue.acquisition_method} />
            </Grid>
            <Grid item xs={12}>
              <DetailItem
                label="획득 방법 상세"
                value={
                  legacyClue.acquisition_method_detail ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: legacyClue.acquisition_method_detail,
                      }}
                    />
                  ) : null
                }
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}