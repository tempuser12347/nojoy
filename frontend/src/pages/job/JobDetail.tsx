import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Grid,
} from "@mui/material";
import api from "../../api";
import { renderObjectsToChips, renderObjectChip } from "../../common/render";

interface Job {
  id: number;
  name: string;
  description: string;
  category: string;
  reference_letter: { id: number; name: string } | null;
  cost: number | null;
  preferred_skills: { id: number; name: string }[] | null;
  requirements: any;
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

const RequirementsTable = ({ requirements }: { requirements: any }) => {
  if (
    !requirements ||
    typeof requirements !== "object" ||
    Object.keys(requirements).length === 0
  ) {
    return null;
  }

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="requirements table">
        <TableBody>
          {Object.entries(requirements).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              <TableCell>
                {typeof value === "string" ? value : JSON.stringify(value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default function JobDetail({ data }: { data?: Job }) {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await api.get(`/api/jobs/${id}`);
        console.log("Job detail response:", response.data);
        setJob(response.data);
      } catch (err) {
        setError("Failed to load job details");
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchJob();
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

  if (!job) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Job not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={job.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem label="카테고리" value={job.category} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem
          label="추천장"
          value={
            job.reference_letter
              ? renderObjectChip(job.reference_letter, navigate)
              : null
          }
        />
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <DetailItem label="비용" value={job.cost} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="우대 스킬"
          value={renderObjectsToChips(job.preferred_skills, navigate)}
        />
      </Grid>
      {job.requirements && Object.keys(job.requirements).length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Typography variant="h6" color="text.secondary">
            요구 사항
          </Typography>
          <RequirementsTable requirements={job.requirements} />
        </Grid>
      )}
    </Grid>
  );
}
