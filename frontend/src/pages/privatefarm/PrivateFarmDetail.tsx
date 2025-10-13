import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";
import { renderObjectChip } from "../../common/render";

interface PrivateFarm {
  id: number;
  name: string;
  description: string;
  region: { id: number; name: string } | null;
  sea_area: { id: number; name: string; coord: string } | null;
  facilities: any;
  products: any;
}

const FacilitiesTable: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return null;
    return (
        <TableContainer component={Paper}>
        <Table size="small">
            <TableHead>
            <TableRow>
                <TableCell>시설</TableCell>
                <TableCell>시설수</TableCell>
                <TableCell>개발도</TableCell>
            </TableRow>
            </TableHead>
            <TableBody>
            {Object.entries(data).map(([key, value]: [string, any]) => (
                <TableRow key={key}>
                <TableCell>{key}</TableCell>
                <TableCell>{value['시설수']}</TableCell>
                <TableCell>{value['개발도']}</TableCell>
                </TableRow>
            ))}
            </TableBody>
        </Table>
        </TableContainer>
    );
};

const ProductsTable: React.FC<{ data: any }> = ({ data }) => {
    const navigate = useNavigate();
    if (!data) return null;
    return (
        <Box>
        {Object.entries(data).map(([category, facilities]: [string, any]) => (
            <Box key={category} mb={3}>
            <Typography variant="h6">{category}</Typography>
            {facilities.map((facility: any) => (
                <Box key={facility.facility} mb={2}>
                <Typography variant="subtitle1">{facility.facility}</Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                    <TableHead>
                        <TableRow>
                        <TableCell>아이템</TableCell>
                        <TableCell>수량</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {facility.items.map((item: any) => (
                        <TableRow key={item.id}>
                            <TableCell>{renderObjectChip(item, navigate)}</TableCell>
                            <TableCell>{item.amount}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                    </Table>
                </TableContainer>
                </Box>
            ))}
            </Box>
        ))}
        </Box>
    );
};


export default function PrivateFarmDetail({ data }: { data?: PrivateFarm }) {
  const { id } = useParams<{ id: string }>();
  const [farm, setFarm] = useState<PrivateFarm | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const response = await api.get(`/api/privatefarms/${id}`);
        setFarm(response.data);
      } catch (err) {
        setError("Failed to load private farm details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchFarm();
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

  if (!farm) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Private farm not found.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {farm.name}
      </Typography>
      <Typography variant="body1" gutterBottom>
        {farm.description}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
                <DetailItem
                label="지역"
                value={
                    farm.region ? renderObjectChip(farm.region, navigate) : null
                }
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <DetailItem
                label="해역"
                value={
                    farm.sea_area ? renderObjectChip(farm.sea_area, navigate) : null
                }
                />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {farm.facilities && (
        <>
          <Typography variant="h5" gutterBottom>
            시설
          </Typography>
          <FacilitiesTable data={farm.facilities} />
        </>
      )}

      {farm.products && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom>
            생산품
          </Typography>
          <ProductsTable data={farm.products} />
        </Box>
      )}
    </Box>
  );
}
