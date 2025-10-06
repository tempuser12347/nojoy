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
import ObtainMethodTabs from "../../components/ObtainMethodTabs";

interface Recipebook {
  id: number;
  name: string;
  additionalname: string | null;
  description: string | null;
  productionNPC: string | null;
  era: string | null;
  skill: string | null; // or object if needed
  obtain_method: any[] | null;
}

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value ? (
    <Box>
      <Typography variant="h6" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
        {value}
      </Typography>
    </Box>
  ) : null;

export default function RecipebookDetail({ data }: { data?: Recipebook }) {
  const { id } = useParams<{ id: string }>();
  const [recipebook, setRecipebook] = useState<Recipebook | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  //   const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipebook = async () => {
      try {
        const response = await api.get(`/api/recipebooks/${id}`);
        console.log(response.data);
        setRecipebook(response.data);
      } catch (err) {
        setError("Failed to load recipebook details");
        console.error("Error fetching recipebook:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchRecipebook();
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
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!recipebook) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Recipebook not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {recipebook.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
              },
            }}
          >
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem label="부가명칭" value={recipebook.additionalname} />
            </Box>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem label="설명" value={recipebook.description} />
            </Box>
            <DetailItem label="제작 NPC" value={recipebook.productionNPC} />
            <DetailItem label="시대" value={recipebook.era} />
            <DetailItem label="스킬" value={recipebook.skill} />

            {recipebook.obtain_method ? (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <DetailItem
                  label="획득방법"
                  value={<ObtainMethodTabs data={recipebook.obtain_method} />}
                />
              </Box>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
