import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataTable from "../../components/DataTable";
import api from "../../api";
import { renderObjectsToChips } from "../../common/render";

interface Recipe {
  id: number;
  name: string;
  description: string;
  required_Skill: Array<{ ref: string; name: string; value: number }>;
  ingredients: Array<{ ref: string; name: string; value: number }>;
  sophia: number;
  era: string;
  central_city: string;
  Investment_cost: number;
}

const SKILL_FILTERS = ["주조", "공예", "보관", "조리", "연금술", "언어학", "봉제"];

export default function Recipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // search + filters
  const [searchInput, setSearchInput] = useState("");
  const [skillFilters, setSkillFilters] = useState<string[]>([]);
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedSkills, setAppliedSkills] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/recipes", {
          params: {
            search: appliedSearch,
            required_skills: appliedSkills.join(","), // backend should handle comma-separated
            skip: page * rowsPerPage,
            limit: rowsPerPage,
          },
        });
        setRecipes(response.data.items || response.data); // adjust depending on API response
      } catch (err) {
        setError("Failed to load recipes");
        console.error("Error fetching recipes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [appliedSearch, appliedSkills, page, rowsPerPage]);

  const columns = [
    { id: "name", label: "이름" },
    {
      id: "required_Skill",
      label: "필요스킬",
      format: (value: Recipe["required_Skill"]) =>
        renderObjectsToChips(value, navigate),
    },
    {
      id: "ingredients",
      label: "재료",
      format: (value: Recipe["ingredients"]) =>
        renderObjectsToChips(value, navigate),
    },
    { id: "sophia", label: "소피아" },
    { id: "era", label: "시대" },
    { id: "central_city", label: "중앙도시" },
    { id: "Investment_cost", label: "투자비용" },
  ];

  const handleSkillChange = (skill: string) => {
    setSkillFilters((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setAppliedSkills(skillFilters);
    setPage(0);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSkillFilters([]);
    setAppliedSearch("");
    setAppliedSkills([]);
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, height: "calc(100vh - 100px)" }}>
      <Typography variant="h4" gutterBottom>
        레시피
      </Typography>

      {/* Search & Filters */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            label="이름검색"
            variant="outlined"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{ minWidth: 200 }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </Box>

        <FormGroup row>
          {SKILL_FILTERS.map((skill) => (
            <FormControlLabel
              key={skill}
              control={
                <Checkbox
                  checked={skillFilters.includes(skill)}
                  onChange={() => handleSkillChange(skill)}
                />
              }
              label={skill}
            />
          ))}
        </FormGroup>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleSearch}>
            검색
          </Button>
          <Button variant="outlined" onClick={resetFilters}>
            초기화
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <DataTable
          columns={columns}
          data={recipes}
          loading={loading}
          onRowClick={(row) => navigate(`/레시피/${row.id}`)}
          page={page}
          rowsPerPage={rowsPerPage}
          total={recipes.length} // if API returns {items,total} use response.data.total instead
          onPageChange={setPage}
          onRowsPerPageChange={(newRowsPerPage) => {
            setPage(0);
            setRowsPerPage(newRowsPerPage);
          }}
        />
      )}
    </Box>
  );
}
