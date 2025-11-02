import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CircularProgress,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
} from "@mui/material";
import api from "../../api";
import {
  renderObjectsToChips,
  renderItemsWithAmount,
  renderObjectChip,
} from "../../common/render";
import DetailItem from "../../components/DetailItem";

interface Quest {
  id: number;
  type: string;
  name: string;
  additional_name: string;
  description: string;
  series: string;
  difficulty: string;
  era: string;
  category: string;
  location: string;
  destination: { id: number; name: string } | null;
  destination_coordinates: string;
  discovery: { id: number; name: string } | null;
  preceding_discovery_quest: { id: number; name: string }[][] | null;
  deadline: string;
  required_items: { id: number; name: string; value: number }[] | null;
  guide: string;
  progress: string;
  previous_continuous_quest: { id: number; name: string } | null;
  episode: number;
  one_time_only: number;
  rare: number;
  association_required: number;
  skills: Array<{ id: number; name: string; value: number }>;
  additional_skills: string;
  association_skills: string;
  sophia_rank: number;
  sophia_points: number;
  nationality: string;
  occupation: string;
  port_permission: string;
  reputation: string;
  other: string;
  reward_money: number;
  advance_payment: number;
  report_experience: string;
  report_reputation: string;
  reward_items: { id: number; name: string; value: number }[];
  reward_immigrants: string;
  reward_techniques: string;
  reward_title: string;
}

const renderPrecedingDiscoveryQuest = (
  data: { id: number; name: string }[][] | null,
  navigate: any
) => {
  if (data == null) return null;
  return (
    <Card>
      {data.map((x, i) => (
        <>
          <Box key={i} sx={{ p: 1 }}>
            <Stack direction="row" spacing={1}>
              {x.map((y, j) => (
                <Chip
                  key={j}
                  label={y.name}
                  clickable
                  onClick={() => navigate(`/obj/${y.id}`)}
                />
              ))}
            </Stack>
          </Box>
          {i < data.length - 1 && <Divider />}
        </>
      ))}
    </Card>
  );
};


export default function QuestDetail({ data }: { data?: Quest }) {
  const { id } = useParams<{ id: string }>();
  const [quest, setQuest] = useState<Quest | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const response = await api.get(`/api/quests/${id}`);
        console.log(response.data);
        setQuest(response.data);
      } catch (err) {
        setError("Failed to load quest details");
        console.error("Error fetching quest:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchQuest();
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

  if (!quest) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Quest not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={quest.description} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          기본 정보
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>카테고리</TableCell>
                <TableCell>난이도</TableCell>
                <TableCell>시리즈</TableCell>
                <TableCell>1회 한정</TableCell>
                <TableCell>희귀</TableCell>
                <TableCell>조합 필요</TableCell>
                {quest.era ? <TableCell>시대</TableCell> : null}
                {quest.deadline ? <TableCell>마감일</TableCell> : null}
                {quest.episode ? <TableCell>에피소드</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{quest.category}</TableCell>
                <TableCell>{quest.difficulty}</TableCell>
                <TableCell>{quest.series}</TableCell>
                <TableCell>{quest.one_time_only ? "Yes" : "No"}</TableCell>
                <TableCell>{quest.rare ? "Yes" : "No"}</TableCell>
                <TableCell>{quest.association_required ? "Yes" : "No"}</TableCell>
                {quest.era ? <TableCell>{quest.era}</TableCell> : null}
                {quest.deadline ? <TableCell>{quest.deadline}</TableCell> : null}
                {quest.episode ? <TableCell>{quest.episode}</TableCell> : null}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          위치 및 발견물
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>의뢰 도시</TableCell>
                <TableCell>목적지</TableCell>
                <TableCell>발견물</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{quest.location}</TableCell>
                <TableCell>
                  {quest.destination ? (
                    <Tooltip title={'좌표:' + quest.destination_coordinates || ""} arrow>
                      {renderObjectChip(quest.destination, navigate)}
                    </Tooltip>
                  ) : null}
                </TableCell>
                <TableCell>{quest.discovery ? renderObjectChip(quest.discovery, navigate) : null}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          요구 사항
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>필요 스킬</TableCell>
                {(quest.required_items != null && quest.required_items.length != 0) ? <TableCell>필요 아이템</TableCell> : null}
                {quest.preceding_discovery_quest ? <TableCell>선행 발견 퀘스트</TableCell> : null}
                {quest.additional_skills && <TableCell>추가 스킬</TableCell>}
                {quest.association_skills && <TableCell>조합 스킬</TableCell>}
                {quest.nationality && <TableCell>국적</TableCell>}
                {quest.occupation && <TableCell>직업</TableCell>}
                {quest.port_permission && <TableCell>항구 허가</TableCell>}
                {quest.reputation && <TableCell>평판</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{renderObjectsToChips(quest.skills, navigate)}</TableCell>
                {(quest.required_items != null && quest.required_items.length != 0) ? <TableCell>{renderItemsWithAmount(quest.required_items, navigate)}</TableCell> : null}
                {quest.preceding_discovery_quest ? <TableCell>{renderPrecedingDiscoveryQuest(quest.preceding_discovery_quest, navigate)}</TableCell> : null}
                {quest.previous_continuous_quest ? <TableCell>이전 연속 퀘스트</TableCell> : null}
                {quest.additional_skills && <TableCell>{quest.additional_skills}</TableCell>}
                {quest.association_skills && <TableCell>{quest.association_skills}</TableCell>}
                {quest.nationality && <TableCell>{quest.nationality}</TableCell>}
                {quest.occupation && <TableCell>{quest.occupation}</TableCell>}
                {quest.port_permission && <TableCell>{quest.port_permission}</TableCell>}
                {quest.reputation && <TableCell>{quest.reputation}</TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom>
          보상 정보
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {quest.sophia_rank ? <TableCell>소피아 랭크</TableCell> : null}
                {quest.sophia_points ? <TableCell>소피아 포인트</TableCell> : null}
                {quest.reward_money ? <TableCell>보상 (돈)</TableCell> : null}
                {quest.advance_payment ? <TableCell>선금</TableCell> : null}
                {quest.report_experience ? <TableCell>보고 경험치</TableCell> : null}
                {quest.report_reputation ? <TableCell>보고 평판</TableCell> : null}
                {quest.reward_items != null && quest.reward_items.length > 0 ? <TableCell>보상 (아이템)</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {quest.sophia_rank ? <TableCell>{quest.sophia_rank}</TableCell> : null}
                {quest.sophia_points ? <TableCell>{quest.sophia_points}</TableCell> : null}
                {quest.reward_money ? <TableCell>{quest.reward_money}</TableCell> : null}
                {quest.advance_payment ? <TableCell>{quest.advance_payment}</TableCell> : null}
                {quest.report_experience ? <TableCell>{quest.report_experience}</TableCell> : null}
                {quest.report_reputation ? <TableCell>{quest.report_reputation}</TableCell> : null}
                {quest.reward_items != null && quest.reward_items.length > 0 ? <TableCell>{renderItemsWithAmount(quest.reward_items, navigate)}</TableCell> : null}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="공략" value={quest.guide} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="진행" value={quest.progress} />
      </Grid>
    </Grid>
  );
}
