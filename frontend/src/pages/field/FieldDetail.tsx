import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
import { renderObjectChip } from "../../common/render";

interface Field {
  id: number;
  name: string;
  description: string;
  coordinates: string | null;
  region: { id: number; name: string } | null;
  sea: { id: number; name: string } | null;
  entrance: { id: number; name: string } | null;
  flag_quest: { id: number; name: string } | null;
  survey: {
    단계: number;
    필수: string | null;
    종류: string;
    "조사 항목": string | null;
    횟수: number;
    "획득 완성도": string;
    "완성도 제한": string;
  }[];
  resurvey_reward: { id: number; name: string; value: number }[];
  gatherable: {
    method: string;
    item: { id: number; name: string }[];
    type: string;
    rank?: number;
  }[];
}

export default function FieldDetail({ data }: { data?: Field }) {
  const { id } = useParams<{ id: string }>();
  const [field, setField] = useState<Field | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchField = async () => {
      try {
        const response = await api.get(`/api/field/${id}`);
        setField(response.data);
      } catch (err) {
        setError("Failed to load field details");
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

  if (!field) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Field not found.</Typography>
      </Box>
    );
  }

  const surveyRows = field.survey?.reduce((acc, item) => {
    const existing = acc.find((i) => i.단계 === item.단계);
    if (existing) {
      existing.rows.push(item);
    } else {
      acc.push({ 단계: item.단계, rows: [item] });
    }
    return acc;
  }, [] as { 단계: number; rows: typeof field.survey }[]);

  const gatherableRows = field.gatherable?.reduce((acc, item) => {
    let methodGroup = acc.find((g) => g.method === item.method);
    if (!methodGroup) {
      methodGroup = { method: item.method, ranks: [] };
      acc.push(methodGroup);
    }

    let rankGroup = methodGroup.ranks.find((r) => r.rank === (item.rank ?? 0));
    if (!rankGroup) {
      rankGroup = { rank: item.rank ?? 0, rows: [] };
      methodGroup.ranks.push(rankGroup);
    }

    rankGroup.rows.push(item);
    return acc;
  }, [] as { method: string; ranks: { rank: number; rows: typeof field.gatherable }[] }[]);

  const renderBasicInfoTable = (field: Field | null) => {
    if (field == null) {
      return null;
    }
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {field.coordinates && (<TableCell>좌표</TableCell>)}
              {field.sea && (<TableCell>해역</TableCell>)}
              {field.region && (<TableCell>해역</TableCell>)}
              {field.entrance && (<TableCell>입구</TableCell>)}
              {field.flag_quest && (<TableCell>선행퀘스트</TableCell>)}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {field.coordinates && (<TableCell>{field.coordinates}</TableCell>)}
              {field.sea && (<TableCell>{renderObjectChip(field.sea, navigate)}</TableCell>)}
              {field.region && (<TableCell>{renderObjectChip(field.region, navigate)}</TableCell>)}
              {field.entrance && (<TableCell>{renderObjectChip(field.entrance, navigate)}</TableCell>)}
              {field.flag_quest && (<TableCell>{renderObjectChip(field.flag_quest, navigate)}</TableCell>)}
            </TableRow>
          </TableBody>
      </Table>
      </TableContainer>

    )
  }

  return (
    <Grid container spacing={2}>
      {field.description && (
        <Grid size={{ xs: 12 }}>
          <Typography variant="body1" gutterBottom>
            {field.description}
          </Typography>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        {renderBasicInfoTable(field)}
      </Grid>

      {data?.survey ? (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            필드 조사
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>단계</TableCell>
                  <TableCell>필수</TableCell>
                  <TableCell>종류</TableCell>
                  <TableCell>조사 항목</TableCell>
                  <TableCell>횟수</TableCell>
                  <TableCell>획득 완성도</TableCell>
                  <TableCell>완성도 제한</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveyRows?.map((group, groupIndex) =>
                  group.rows.map((row, rowIndex) => (
                    <TableRow key={`${groupIndex}-${rowIndex}`}>
                      {rowIndex === 0 && (
                        <TableCell rowSpan={group.rows.length}>
                          {group.단계}
                        </TableCell>
                      )}
                      <TableCell>{row["필수"]}</TableCell>
                      <TableCell>{row["종류"]}</TableCell>
                      <TableCell>{row["조사 항목"]}</TableCell>
                      <TableCell>{row["횟수"]}</TableCell>
                      <TableCell>{row["획득 완성도"]}</TableCell>
                      <TableCell>{row["완성도 제한"]}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ) : null}

      {data?.resurvey_reward ? (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            재조사 보상
          </Typography>
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>아이템</TableCell>
                  <TableCell>수량</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {field.resurvey_reward?.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{renderObjectChip(r, navigate)}</TableCell>
                    <TableCell>{r.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ) : null}

      {data?.gatherable ? (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            채집물
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>방법</TableCell>
                  <TableCell>랭크</TableCell>
                  <TableCell>종류</TableCell>
                  <TableCell>아이템</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gatherableRows?.map((methodGroup, methodIndex) => {
                  let methodRowSpan = methodGroup.ranks.reduce(
                    (acc, rankGroup) => acc + rankGroup.rows.length,
                    0
                  );
                  return methodGroup.ranks.map((rankGroup, rankIndex) => {
                    let rankRowSpan = rankGroup.rows.length;
                    return rankGroup.rows.map((row, rowIndex) => (
                      <TableRow key={`${methodIndex}-${rankIndex}-${rowIndex}`}>
                        {rankIndex === 0 && rowIndex === 0 && (
                          <TableCell rowSpan={methodRowSpan}>
                            {methodGroup.method}
                          </TableCell>
                        )}
                        {rowIndex === 0 && (
                          <TableCell rowSpan={rankRowSpan}>
                            {rankGroup.rank === 0 ? "" : rankGroup.rank}
                          </TableCell>
                        )}
                        <TableCell>{row.type}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}
                          >
                            {row.item.map((item) =>
                              renderObjectChip(item, navigate)
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ));
                  });
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      ) : null}
    </Grid>
  );
}
