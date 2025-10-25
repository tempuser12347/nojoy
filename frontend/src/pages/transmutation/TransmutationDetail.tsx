import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip, renderObjectsToChips } from "../../common/render";

interface Transmutation {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  base_material: { id: number, name: string };
  policy: string | null;
  requirements: any[];
  products: any[];
}

export default function TransmutationDetail({ data }: { data?: Transmutation }) {
  const { id } = useParams<{ id: string }>();
  const [transmutation, setTransmutation] = useState<Transmutation | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransmutation = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/transmutations/${id}`);
        setTransmutation(response.data);
      } catch (err) {
        setError("Failed to load Transmutation details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchTransmutation();
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

  if (!transmutation) {
    return <Typography sx={{ p: 3 }}>Transmutation not found.</Typography>;
  }

  const renderRequirements = (requirements: any[]) => {
    return <TableContainer component={Paper} sx={{ mt: 1 }}>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>종류</TableCell>
            <TableCell>내용</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requirements.map(x => {
            if (x.type == '소피아') {
              return <TableRow>
                <TableCell>소피아</TableCell>
                <TableCell>{x.content}</TableCell>
              </TableRow>
            }
            else if (x.type == '스킬') {
              return <TableRow>
                <TableCell>스킬</TableCell>
                <TableCell>{renderObjectsToChips(x.content, navigate)}</TableCell>
              </TableRow>
            }
            else if (x.type == '재료') {
              return <TableRow>
                <TableCell>재료</TableCell>
                <TableCell>{renderObjectsToChips(x.content, navigate, x => 'x' + x)}</TableCell>
              </TableRow>
            }
            else {
              return <TableRow>
                <TableCell>{x.type}</TableCell>
                <TableCell>{JSON.stringify(x.content)}</TableCell>
              </TableRow>

            }
          })}
        </TableBody>
      </Table>
    </TableContainer>
  };

  const renderProducts = (products: any[]) => {
    return (
      <TableContainer component={Paper} sx={{ mt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>결과</TableCell>
              <TableCell>생성물</TableCell>
              <TableCell>수량</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((prod: any, prodIndex: number) => (
              <TableRow key={prodIndex}>
                <TableCell>{prod.result}</TableCell>
                <TableCell>{renderObjectChip(prod.product, navigate)}</TableCell>
                <TableCell>{prod.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {transmutation.name}
      </Typography>
      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <DetailItem label="설명" value={transmutation.description} />
          </Box>
          <Grid container spacing={2}>
            {transmutation.base_material ?

              <Grid size={{ xs: 12, sm: 6 }}>
                <DetailItem label="기본 재료" value={renderObjectChip(transmutation.base_material, navigate)} />
              </Grid> : null
            }
            {transmutation.policy ?

              <Grid size={{ xs: 12, sm: 6 }} >
                <DetailItem label="정책" value={transmutation.policy} />
              </Grid> : null
            }
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                요구 사항
              </Typography>
              {transmutation.requirements && renderRequirements(transmutation.requirements)}
            </Grid>
            {
              transmutation.products ?

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    생성물
                  </Typography>
                  {renderProducts(transmutation.products)}
                </Grid> : null
            }
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}