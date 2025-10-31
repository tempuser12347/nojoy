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

interface Ship {
  id: number;
  name: string;
  extraname: string | null;
  description: string | null;
  required_levels: { adventure: number; trade: number; battle: number } | null;
  base_material: { id: number; name: string } | null;
  upgrade_count: { total: number; base: number; rebuild: number } | null;
  build_info: {
    days: number;
    development?: string;
    investment?: number;
  } | null;
  base_performance: {
    durability: number;
    vertical_sail: number;
    horizontal_sail: number;
    rowing_power: number;
    maneuverability: number;
    wave_resistance: number;
    armor: number;
  } | null;
  capacity: {
    cabin: number;
    required_crew: number;
    gunport: number;
    cargo: number;
  } | null;
  improvement_limit: {
    durability: number;
    vertical_sail: number;
    horizontal_sail: number;
    rowing_power: number;
    maneuverability: number;
    wave_resistance: number;
    armor: number;
    cabin: number;
    gunport: number;
    cargo: number;
  } | null;
  ship_parts: {
    studdingsail?: number;
    figurehead?: number;
    crest?: number;
    special_equipment?: number;
    extra_armor?: number;
    side_cannon?: number;
    bow_cannon?: number;
    stern_cannon?: number;
  } | null;
  ship_skills:
  | {
    skill: { id: number; name: string };
    sail: { id: number; name: string } | null;
    gunport: { id: number; name: string } | null;
    material1: { id: number; name: string } | null;
    material2: { id: number; name: string } | null;
  }[]
  | null;
  ship_deco: { [key: string]: boolean } | null;
  special_build_cities:
  | {
    hull: { id: number; name: string };
    rank: number;
    material: { id: number; name: string };
    region: string;
    city: { id: number; name: string }[];
  }[]
  | null;
  standard_build_cities:
  | { region: string; cities: { id: number; name: string }[] }[]
  | null;
  category: { purpose: string; size: string; propulsion: string } | null;
}

export default function ShipDetail({ data }: { data?: Ship }) {
  const { id } = useParams<{ id: string }>();
  const [ship, setShip] = useState<Ship | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShip = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/ships/${id}`);
        setShip(response.data);
      } catch (err) {
        setError("Failed to load ship details");
        console.error("Error fetching ship:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchShip();
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

  if (!ship) {
    return <Typography sx={{ p: 3 }}>Ship not found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {ship.name} {ship.extraname && `(${ship.extraname})`}
      </Typography>
      <Card>
        <CardContent>
          <Box>
          <DetailItem label="설명" value={ship.description} />
          </Box>
          <Grid container spacing={2}>
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={{ border: "1px solid #e0e0e0", p: 1}}
            >
              <Typography variant="h6" color="text.secondary">
                선박 분류
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">용도</TableCell>
                      <TableCell align="center">크기</TableCell>
                      <TableCell align="center">추진</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">
                        {ship.category?.purpose}
                      </TableCell>
                      <TableCell align="center">
                        {ship.category?.size}
                      </TableCell>
                      <TableCell align="center">
                        {ship.category?.propulsion}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}

              component="div"
              sx={{ border: "1px solid #e0e0e0", p: 1 }}
            >
              <Typography variant="h6" color="text.secondary">
                필요 레벨
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">모험</TableCell>
                      <TableCell align="center">교역</TableCell>
                      <TableCell align="center">전투</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">
                        {ship.required_levels?.adventure}
                      </TableCell>
                      <TableCell align="center">
                        {ship.required_levels?.trade}
                      </TableCell>
                      <TableCell align="center">
                        {ship.required_levels?.battle}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              component="div"
              sx={{ border: "1px solid #e0e0e0", p: 1 }}
            >
              <DetailItem
                label="기본 재질"
                value={
                  ship.base_material
                    ? renderObjectChip(ship.base_material, navigate)
                    : "-"
                }
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              component="div"
              sx={{ border: "1px solid #e0e0e0", p: 1 }}
            >
              <DetailItem
                label="강화 횟수"
                value={
                  ship.upgrade_count
                    ? `총 ${ship.upgrade_count.total} (기본 ${ship.upgrade_count.base}, 재강화 ${ship.upgrade_count.rebuild})`
                    : "-"
                }
              />
            </Grid>
            <Grid
              size={{ xs: 12, sm: 6, md: 4 }}
              component="div"
              sx={{ border: "1px solid #e0e0e0", p: 1 }}
            >
              <Typography variant="h6" color="text.secondary">
                건조 정보
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">건조일수</TableCell>
                      <TableCell align="center">개발 필요</TableCell>
                      <TableCell align="center">투자</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align="center">
                        {ship.build_info?.days || "-"}
                      </TableCell>
                      <TableCell align="center">
                        {ship.build_info?.development ? "✅" : "❌"}
                      </TableCell>
                      <TableCell align="center">
                        {ship.build_info?.investment || "-"}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          {(ship.base_performance || ship.improvement_limit) && (
            <Grid sx={{ xs: 12 , mt: 2}}>
              <Typography variant="h6" color="text.secondary">
                성능 및 강화 한계
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">구분</TableCell>
                      <TableCell align="center">내구도</TableCell>
                      <TableCell align="center">세로돛</TableCell>
                      <TableCell align="center">가로돛</TableCell>
                      <TableCell align="center">조력</TableCell>
                      <TableCell align="center">선회</TableCell>
                      <TableCell align="center">내파</TableCell>
                      <TableCell align="center">장갑</TableCell>
                      <TableCell align="center">선실</TableCell>
                      <TableCell align="center">필요 선원</TableCell>
                      <TableCell align="center">포실</TableCell>
                      <TableCell align="center">창고</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ship.base_performance && (
                      <TableRow>
                        <TableCell align="center">기본 성능</TableCell>
                        <TableCell align="center">
                          {ship.base_performance.durability}
                        </TableCell>
                        <TableCell align="center">
                          {ship.base_performance.vertical_sail}
                        </TableCell>
                        <TableCell align="center">
                          {ship.base_performance.horizontal_sail}
                        </TableCell>
                        <TableCell align="center">
                          {ship.base_performance.rowing_power}
                        </TableCell>
                        <TableCell align="center">
                          {ship.base_performance.maneuverability}
                        </TableCell>
                        <TableCell align="center">
                          {ship.base_performance.wave_resistance}
                        </TableCell>
                        <TableCell align="center">
                          {ship.base_performance.armor}
                        </TableCell>
                        <TableCell align="center">
                          {ship.capacity?.cabin}
                        </TableCell>
                        <TableCell align="center">
                          {ship.capacity?.required_crew}
                        </TableCell>
                        <TableCell align="center">
                          {ship.capacity?.gunport}
                        </TableCell>
                        <TableCell align="center">
                          {ship.capacity?.cargo}
                        </TableCell>
                      </TableRow>
                    )}
                    {ship.improvement_limit && (
                      <TableRow>
                        <TableCell align="center">강화 한계</TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.durability}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.vertical_sail}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.horizontal_sail}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.rowing_power}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.maneuverability}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.wave_resistance}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.armor}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.cabin}
                        </TableCell>
                        <TableCell align="center"></TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.gunport}
                        </TableCell>
                        <TableCell align="center">
                          {ship.improvement_limit.cargo}
                        </TableCell>
                      </TableRow>
                    )}
                    {(ship.base_performance || ship.improvement_limit) && (
                      <TableRow sx={{ td: { fontWeight: "bold" } }}>
                        <TableCell align="center">최대</TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.durability || 0) +
                            (ship.improvement_limit?.durability || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.vertical_sail || 0) +
                            (ship.improvement_limit?.vertical_sail || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.horizontal_sail || 0) +
                            (ship.improvement_limit?.horizontal_sail || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.rowing_power || 0) +
                            (ship.improvement_limit?.rowing_power || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.maneuverability || 0) +
                            (ship.improvement_limit?.maneuverability || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.wave_resistance || 0) +
                            (ship.improvement_limit?.wave_resistance || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.base_performance?.armor || 0) +
                            (ship.improvement_limit?.armor || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.capacity?.cabin || 0) +
                            (ship.improvement_limit?.cabin || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {ship.capacity?.required_crew || 0}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.capacity?.gunport || 0) +
                            (ship.improvement_limit?.gunport || 0)}
                        </TableCell>
                        <TableCell align="center">
                          {(ship.capacity?.cargo || 0) +
                            (ship.improvement_limit?.cargo || 0)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {ship.ship_parts && Object.keys(ship.ship_parts).length > 0 && (
            <Grid size={{xs:12}} sx={{mt: 2}}>
              <Typography variant="h6" color="text.secondary">
                선박 부품
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(ship.ship_parts).map((key) => (
                        <TableCell key={key} align="center">
                          {key === "studdingsail"
                            ? "보조돛"
                            : key === "figurehead"
                              ? "선수상"
                              : key === "crest"
                                ? "문장"
                                : key === "special_equipment"
                                  ? "특수장비"
                                  : key === "extra_armor"
                                    ? "추가장갑"
                                    : key === "side_cannon"
                                      ? "선측포"
                                      : key === "bow_cannon"
                                        ? "선수포"
                                        : key === "stern_cannon"
                                          ? "선미포"
                                          : key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {Object.values(ship.ship_parts).map((value, index) => (
                        <TableCell key={index} align="center">
                          {value}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {ship.ship_skills && ship.ship_skills.length > 0 && (
            <Grid size={{xs: 12}} sx={{mt: 2}}>
              <Typography variant="h6" color="text.secondary">
                선박 스킬
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">스킬</TableCell>
                      <TableCell align="center">돛</TableCell>
                      <TableCell align="center">포문</TableCell>
                      <TableCell align="center">재료 1</TableCell>
                      <TableCell align="center">재료 2</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ship.ship_skills.map((s, index) => (
                      <TableRow key={index}>
                        <TableCell align="center">
                          {renderObjectChip(s.skill, navigate)}
                        </TableCell>
                        <TableCell align="center">
                          {s.sail ? renderObjectChip(s.sail, navigate) : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {s.gunport
                            ? renderObjectChip(s.gunport, navigate)
                            : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {s.material1
                            ? renderObjectChip(s.material1, navigate)
                            : "-"}
                        </TableCell>
                        <TableCell align="center">
                          {s.material2
                            ? renderObjectChip(s.material2, navigate)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {ship.ship_deco && Object.keys(ship.ship_deco).length > 0 && (
            <Grid size={{xs:12}} sx={{mt: 2}}>
              <Typography variant="h6" color="text.secondary">
                선박 장식
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(ship.ship_deco).map((key) => (
                        <TableCell key={key} align="center">
                          {key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      {Object.values(ship.ship_deco).map((value, index) => (
                        <TableCell key={index} align="center">
                          {value ? "✅" : "❌"}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}

          {ship.special_build_cities &&
            ship.special_build_cities.length > 0 && (
              <Grid size={{xs: 12}} sx={{mt: 2}}>
                <Typography variant="h6" color="text.secondary">
                  특수 건조 도시
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">선체</TableCell>
                        <TableCell align="center">랭크</TableCell>
                        <TableCell align="center">재료</TableCell>
                        <TableCell align="center">지역</TableCell>
                        <TableCell align="center">도시</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ship.special_build_cities.map((sbc, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">
                            {renderObjectChip(sbc.hull, navigate)}
                          </TableCell>
                          <TableCell align="center">
                            {sbc.rank ? sbc.rank : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {sbc.material
                              ? renderObjectChip(sbc.material, navigate)
                              : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {sbc.region ? sbc.region : "-"}
                          </TableCell>
                          <TableCell align="center">
                            {renderObjectsToChips(sbc.city, navigate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>{" "}
              </Grid>
            )}

          {ship.standard_build_cities &&
            ship.standard_build_cities.length > 0 && (
              <Grid size={{xs: 12}} sx={{mt: 2}}>
                <Typography variant="h6" color="text.secondary">
                  일반 건조 도시
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell align="center">지역</TableCell>
                        <TableCell align="center">도시</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ship.standard_build_cities.map((regionData, index) => (
                        <TableRow key={index}>
                          <TableCell align="center">
                            {regionData.region}
                          </TableCell>
                          <TableCell>
                            {renderObjectsToChips(regionData.cities, navigate)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            )}
        </CardContent>
      </Card>
    </Box>
  );
}
