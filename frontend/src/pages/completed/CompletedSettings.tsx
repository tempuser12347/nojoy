import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Modal, Alert, IconButton } from '@mui/material';
import { ContentCopy } from '@mui/icons-material';
import api from '../../api';

interface MatchedItem {
  id: number;
  name: string;
}

interface CheckResult {
  match_count: number;
  error_count: number;
  matched_items: MatchedItem[];
  error_names: string[];
}

const CompletedSettings: React.FC = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [open, setOpen] = useState(false);

  const handleCheckNames = async () => {
    try {
      const response = await api.post('/api/completed/check_names', { names: text });
      setResult(response.data);
      setOpen(true);
    } catch (error) {
      console.error('Error checking names:', error);
    }
  };

  const handleAddCompleted = async () => {
    if (result && result.matched_items.length > 0) {
      try {
        await api.post('/api/completed/add_many', { items: result.matched_items });
        setOpen(false);
        setText('');
        alert('완료 목록에 추가되었습니다.');
      } catch (error) {
        console.error('Error adding completed items:', error);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCopyErrors = () => {
    if (result && result.error_names.length > 0) {
      navigator.clipboard.writeText(result.error_names.join('\n'));
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        발견완료 일괄 설정
      </Typography>
      <TextField
        multiline
        rows={10}
        variant="outlined"
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="여기에 발견물 목록을 입력하세요. 한 줄에 하나씩 입력해주세요."
      />
      <Button variant="contained" onClick={handleCheckNames} sx={{ mt: 2 }}>
        확인
      </Button>

      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}>
          {result && (
            <>
              <Typography variant="h6">처리 결과</Typography>
              <Typography>성공: {result.match_count}건</Typography>
              <Typography>실패: {result.error_count}건</Typography>
              {result.error_count > 0 && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <Typography variant="subtitle1">실패 목록:</Typography>
                    <IconButton onClick={handleCopyErrors} size="small">
                      <ContentCopy />
                    </IconButton>
                  </Box>
                  <Box sx={{ maxHeight: 150, overflow: 'auto', border: '1px solid grey', p: 1, mt: 1 }}>
                    {result.error_names.map((name, index) => (
                      <Typography key={index}>{name}</Typography>
                    ))}
                  </Box>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    실패한 항목은 무시하고 성공한 항목만 완료 목록에 추가합니다.
                  </Alert>
                </>
              )}
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleClose} sx={{ mr: 1 }}>취소</Button>
                <Button onClick={handleAddCompleted} variant="contained" disabled={result.match_count === 0}>
                  추가
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default CompletedSettings;
