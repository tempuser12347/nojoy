import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
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
import { renderObjectChip } from "../../common/render";

interface ResearchAction {
  id: number;
  name: string;
  pages: number;
}

interface RewardContent {
  id?: number;
  name?: string;
  type?: string;
  content?: any;
}

interface Reward {
  type: string;
  content: RewardContent;
}

interface Research {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  building_level: number | null;
  major: { id: number; name: string } | null;
  job: { id: number; name: string } | null;
  required_pages: number | null;
  research_actions: ResearchAction[] | null;
  rewards: Reward[] | null;
}

const ResearchActionsTable: React.FC<{ data: ResearchAction[] }> = ({
  data,
}) => {
  if (!data || data.length === 0) return null;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>행동</TableCell>
            <TableCell>페이지</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((action, index) => (
            <TableRow key={index}>
              <TableCell>{action.name}</TableCell>
              <TableCell>{action.pages}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const RewardsTable: React.FC<{ data: Reward[] }> = ({ data }) => {
  const navigate = useNavigate();
  if (!data || data.length === 0) return null;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>타입</TableCell>
            <TableCell>내용</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((reward, index) => (
            <TableRow key={index}>
              <TableCell>{reward.type}</TableCell>
              <TableCell>
                {reward.content.id && reward.content.name
                  ? renderObjectChip(
                      reward.content as { id: number; name: string },
                      navigate
                    )
                  : String(reward.content)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function ResearchDetail({ data }: { data?: Research }) {
  const { id } = useParams<{ id: string }>();
  const [research, setResearch] = useState<Research | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResearch = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/api/researches/${id}`);
        setResearch(response.data);
      } catch (err) {
        setError("Failed to load Research details");
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchResearch();
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

  if (!research) {
    return <Typography sx={{ p: 3 }}>Research not found.</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={research.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="카테고리" value={research.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="건물 레벨" value={research.building_level} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="전공"
          value={
            research.major
              ? renderObjectChip(research.major, navigate)
              : null
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="직업"
          value={
            research.job ? renderObjectChip(research.job, navigate) : null
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="필요 페이지" value={research.required_pages} />
      </Grid>
      {research.research_actions && research.research_actions.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            연구 행동
          </Typography>
          <ResearchActionsTable data={research.research_actions} />
        </Grid>
      )}
      {research.rewards && research.rewards.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            보상
          </Typography>
          <RewardsTable data={research.rewards} />
        </Grid>
      )}
    </Grid>
  );
}
