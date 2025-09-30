import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import api from '../../api';
import { renderObjectsToChips, renderItemsWithAmount } from '../../common/render';

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
  discovery: {id: number, name: string}|null;
  preceding_discovery_quest: string;
  deadline: string;
  required_items: {id:number, name:string, value:number}[] | null;
  guide: string;
  progress: string;
  previous_continuous_quest_id: string;
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
  reward_items: {id:number, name:string, value:number}[];
  reward_immigrants: string;
  reward_techniques: string;
  reward_title: string;
}

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  value ? <Box><Typography variant="h6" color="text.secondary">{label}</Typography><Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{value}</Typography></Box> : null
);

export default function QuestDetail() {
  const { id } = useParams<{ id: string }>();
  const [quest, setQuest] = useState<Quest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuest = async () => {
      try {
        const response = await api.get(`/api/quests/${id}`);
        console.log(response.data)
        setQuest(response.data);
      } catch (err) {
        setError('Failed to load quest details');
        console.error('Error fetching quest:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuest();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress /></Box>
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{quest.name}{quest.additional_name && ` (${quest.additional_name})`}</Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' } }}>
            <Box sx={{ gridColumn: '1 / -1' }}><DetailItem label="설명" value={quest.description} /></Box>
            <DetailItem label="종류" value={quest.type} />
            <DetailItem label="카테고리" value={quest.category} />
            <DetailItem label="난이도" value={quest.difficulty} />
            <DetailItem label="시대" value={quest.era} />
            <DetailItem label="의뢰장소" value={quest.location} />
            <DetailItem label="목적지" value={quest.destination?.name} />
            <DetailItem label="시리즈" value={quest.series} />
            <DetailItem label="마감일" value={quest.deadline} />
            <DetailItem label="발견물" value={quest.discovery?.name} />
            <DetailItem label="선행 발견 퀘스트" value={quest.preceding_discovery_quest} />
            <DetailItem label="목적지 좌표" value={quest.destination_coordinates} />
            <DetailItem label="필요 아이템" value={renderItemsWithAmount(quest.required_items)} />
            <DetailItem label="이전 연속 퀘스트 ID" value={quest.previous_continuous_quest_id} />
            <DetailItem label="에피소드" value={quest.episode} />
            <DetailItem label="1회 한정" value={quest.one_time_only ? 'Yes' : 'No'} />
            <DetailItem label="희귀" value={quest.rare ? 'Yes' : 'No'} />
            <DetailItem label="조합 필요" value={quest.association_required ? 'Yes' : 'No'} />
            <DetailItem label="필요 스킬" value={renderObjectsToChips(quest.skills, navigate)} />
            <DetailItem label="추가 스킬" value={quest.additional_skills} />
            <DetailItem label="조합 스킬" value={quest.association_skills} />
            <DetailItem label="소피아 랭크" value={quest.sophia_rank} />
            <DetailItem label="소피아 포인트" value={quest.sophia_points} />
            <DetailItem label="국적" value={quest.nationality} />
            <DetailItem label="직업" value={quest.occupation} />
            <DetailItem label="항구 허가" value={quest.port_permission} />
            <DetailItem label="평판" value={quest.reputation} />
            <DetailItem label="보상 (돈)" value={quest.reward_money} />
            <DetailItem label="선금" value={quest.advance_payment} />
            <DetailItem label="보고 경험치" value={quest.report_experience} />
            <DetailItem label="보고 평판" value={quest.report_reputation} />
            <DetailItem label="보상 (아이템)" value={renderItemsWithAmount(quest.reward_items, navigate)} />
            <Box sx={{ gridColumn: '1 / -1' }}><DetailItem label="공략" value={quest.guide} /></Box>
            <Box sx={{ gridColumn: '1 / -1' }}><DetailItem label="진행" value={quest.progress} /></Box>
            {/* <DetailItem label="진행" value={quest.progress} /> */}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}