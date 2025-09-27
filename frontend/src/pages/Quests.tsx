import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Typography,
  Button, Chip, Autocomplete,
} from '@mui/material';
import DataTable from '../components/DataTable';
import api from '../api';
import { renderObjectsToChips } from '../common/render';
import { QUEST_FILTER_SKILL_ARRAY } from '../constants/listvalues';

interface Skill {
  id: number;
  name: string;
  value: number;
}

interface City {
  id: number;
  name: string;
}

const sampleCities: City[] = [
  { id: 1, name: '리스본' },
  { id: 2, name: '세비야' },
  { id: 3, name: '런던' },
  { id: 4, name: '암스테르담' },
  { id: 5, name: '베네치아' },
  { id: 6, name: '이스탄불' },
];

// The 'value' field is not used for filtering but is part of the Skill type.
// const sampleSkills: Skill[] = [
//   { id: 1, name: '돛 조종', value: 0 },
//   { id: 2, name: '회계', value: 0 },
//   { id: 3, name: '몸짓', value: 0 },
//   { id: 4, name: '사교', value: 0 },
//   { id: 5, name: '탐색', value: 0 },
//   { id: 6, name: '인식', value: 0 },
//   { id: 7, name: '자물쇠 따기', value: 0 },
// ];

// convert QUEST_FILTER_SKILL_ARRAY to Skill[]
const sampleSkills: Skill[] = QUEST_FILTER_SKILL_ARRAY.map((skill, index) => ({
  id: skill.id,
  name: skill.name,
  value: 0,
}));


// const sampleSkills: Skill[] = QUEST_FILTER_SKILL_ARRAY;

const Quests: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [name_search, setName_search] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  const [locationSearch, setLocationSearch] = React.useState<City[]>([]);
  const [destinationSearch, setDestinationSearch] = React.useState<City | null>(null);
  const [skillsSearch, setSkillsSearch] = React.useState<Skill[]>([]);

  const { data, isLoading } = useQuery({
    queryKey: ['quests', page, rowsPerPage, name_search, locationSearch, destinationSearch, skillsSearch],
    queryFn: async () => {
      const response = await api.get('/api/quests', {
        params: {
          name_search,
          location_search: locationSearch.map(l => l.name).join(','),
          destination_search: destinationSearch?.id,
          skills_search: skillsSearch.map(s => s.id).join(','),
          skip: page * rowsPerPage,
          limit: rowsPerPage,
        },
      });
      
      console.log(response.data);
      return response.data; // Expecting { items: [], total: 0 }
    },
  });

  const columns = [
    { id: 'name', label: '이름', minWidth: 170 },
    { id: 'type', label: '종류', minWidth: 100 },
    { id: 'difficulty', label: '난이도', minWidth: 100 },
    { id: 'location', label: '의뢰장소', minWidth: 170 },
    { id: 'destination', label: '목적지', minWidth: 170, format: (value: any) => <Typography>{value ? value.name : ''}</Typography> },
    { id: 'skills', label: '필요스킬', minWidth: 200, format: (value: Skill[]) => renderObjectsToChips(value, navigate) },
  ];


  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleSearch = () => {
    setName_search(searchInput);
    setPage(0);
  };

  const resetFilters = () => {
    setName_search('');
    setSearchInput('');
    setLocationSearch([]);
    setDestinationSearch(null);
    setSkillsSearch([]);
    setPage(0);
  };

  return (
    <Box sx={{ width: '100%', p: 3, height: 'calc(100vh - 100px)' }}>
      <Typography variant="h4" gutterBottom>퀘스트</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="퀘스트 이름 검색"
          variant="outlined"
          value={searchInput}
          onChange={handleSearchInputChange}
          sx={{ minWidth: 200 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button variant="contained" onClick={handleSearch}>검색</Button>
        <Button variant="outlined" onClick={resetFilters}>초기화</Button>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Autocomplete
          multiple
          id="location-filter"
          options={sampleCities}
          getOptionLabel={(option) => option.name}
          value={locationSearch}
          onChange={(_, newValue) => {
            setLocationSearch(newValue);
            setPage(0);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" label="의뢰장소" sx={{ minWidth: 300 }} />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
            ))
          }
        />
        <Autocomplete
          id="destination-filter"
          options={sampleCities}
          getOptionLabel={(option) => option.name}
          value={destinationSearch}
          onChange={(_, newValue) => {
            setDestinationSearch(newValue);
            setPage(0);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" label="목적지" sx={{ minWidth: 200 }} />}
        />
        <Autocomplete
          multiple
          id="skills-filter"
          options={sampleSkills}
          getOptionLabel={(option) => option.name}
          value={skillsSearch}
          onChange={(_, newValue) => {
            setSkillsSearch(newValue);
            setPage(0);
          }}
          renderInput={(params) => <TextField {...params} variant="outlined" label="필요스킬" sx={{ minWidth: 300 }} />}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option.name} {...getTagProps({ index })} />
            ))
          }
        />
      </Box>

      <DataTable
        columns={columns}
        data={data?.items || []}
        loading={isLoading}
        total={data?.total || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onRowClick={(row) => navigate(`/퀘스트/${row.id}`)}
      />
    </Box>
  );
};

export default Quests;