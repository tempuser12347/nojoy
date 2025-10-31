import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import api from "../../api";
import DetailItem from "../../components/DetailItem";

interface Shipwreck {
  id: number;
  name: string;
  explanation: string;
  difficulty: string;
  sea_area: string;
  destination: string;
  discovery_coordinates: string;
  skill: string;
  characteristics: string;
  discovery: string;
  consumables: string;
  trade_goods: string;
  equipment: string;
  recipebook: string;
  aux_sail: string;
  ship_material: string;
  cannon: string;
  special_equipment: string;
  additional_armor: string;
  figurehead: string;
  emblem: string;
  ship_decoration: string;
}

export default function ShipwreckDetail({ data }: { data?: Shipwreck }) {
  const { id } = useParams<{ id: string }>();
  const [shipwreck, setShipwreck] = useState<Shipwreck | null>(data || null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShipwreck = async () => {
      try {
        const response = await api.get(`/api/shipwrecks/${id}`);
        console.log(response.data);
        setShipwreck(response.data);
      } catch (err) {
        setError("Failed to load shipwreck details");
        console.error("Error fetching shipwreck:", err);
      }
    };

    if (!data && id) {
      fetchShipwreck();
    }
  }, [id, data]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!shipwreck) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label='난이도' value={shipwreck.difficulty} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label='해역' value={shipwreck.sea_area} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label='목적지' value={shipwreck.destination} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label='발견좌표' value={shipwreck.discovery_coordinates} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label='필요스킬' value={shipwreck.skill} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label='설명' value={shipwreck.explanation} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label='특징' value={shipwreck.characteristics} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label='발견물' value={shipwreck.discovery} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" color="text.secondary">획득 아이템</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>종류</TableCell>
                <TableCell>아이템</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {shipwreck.consumables && (<TableRow>
                <TableCell>소비품</TableCell>
                <TableCell>{shipwreck.consumables}</TableCell>
              </TableRow>)}
              {shipwreck.equipment && (
                <TableRow>
                  <TableCell>장비품</TableCell>
                  <TableCell>{shipwreck.equipment}</TableCell>
                </TableRow>
              )}
              {shipwreck.trade_goods && (
                <TableRow>
                  <TableCell>장비품</TableCell>
                  <TableCell>{shipwreck.trade_goods}</TableCell>
                </TableRow>
              )}
              {shipwreck.recipebook && (
                <TableRow>
                  <TableCell>레시피북</TableCell>
                  <TableCell>{shipwreck.recipebook}</TableCell>
                </TableRow>
              )}
              {
                shipwreck.aux_sail && (
                  <TableRow>
                    <TableCell>보조돛</TableCell>
                    <TableCell>{shipwreck.aux_sail}</TableCell>
                  </TableRow>
                )
              }
              {shipwreck.ship_material && (
                <TableRow>
                  <TableCell>선체재료</TableCell>
                  <TableCell>{shipwreck.ship_material}</TableCell>
                </TableRow>

              )}
              {shipwreck.cannon && (
                <TableRow>
                  <TableCell>대포</TableCell>
                  <TableCell>{shipwreck.cannon}</TableCell>
                </TableRow>

              )}
              {shipwreck.special_equipment && (
                <TableRow>
                  <TableCell>특수장비</TableCell>
                  <TableCell>{shipwreck.special_equipment}</TableCell>
                </TableRow>

              )}
              {shipwreck.additional_armor && (

                <TableRow>
                  <TableCell>추가장갑</TableCell>
                  <TableCell>{shipwreck.additional_armor}</TableCell>
                </TableRow>
              )}
              {shipwreck.figurehead && (

                <TableRow>
                  <TableCell>선수상</TableCell>
                  <TableCell>{shipwreck.figurehead}</TableCell>
                </TableRow>
              )}
              {shipwreck.emblem && (
                <TableRow>
                  <TableCell>문장</TableCell>
                  <TableCell>{shipwreck.emblem}</TableCell>
                </TableRow>

              )}
              {shipwreck.ship_decoration && (

                <TableRow>
                  <TableCell>선박데코</TableCell>
                  <TableCell>{shipwreck.ship_decoration}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

    </Grid>
  );
}
