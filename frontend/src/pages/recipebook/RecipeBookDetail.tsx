import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import ObtainMethodTabs from "../../components/ObtainMethodTabs";
import { renderObjectsToChips } from "../../common/render";
import DetailItem from "../../components/DetailItem";

interface RecipeItem {
  ref: string;
  name: string;
  value: number;
}

interface Recipe {
  id: number;
  name: string;
  required_Skill: string | RecipeItem[];
  ingredients: string | RecipeItem[];
  output: string | RecipeItem[];
}

interface Recipebook {
  id: number;
  name: string;
  additionalname: string | null;
  description: string | null;
  productionNPC: string | null;
  era: string | null;
  skill: string | null; // or object if needed
  obtain_method: any[] | null;
  recipes: Recipe[] | null;
}

export default function RecipebookDetail({ data }: { data?: Recipebook }) {
  const { id } = useParams<{ id: string }>();
  const [recipebook, setRecipebook] = useState<Recipebook | null>(data || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecipebook = async () => {
      try {
        const response = await api.get(`/api/recipebooks/${id}`);
        console.log(response.data);
        setRecipebook(response.data);
      } catch (err) {
        setError("Failed to load recipebook details");
        console.error("Error fetching recipebook:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!data && id) {
      fetchRecipebook();
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

  if (!recipebook) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Recipebook not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={recipebook.description} />
      </Grid>
      {recipebook.productionNPC && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="제작 NPC" value={recipebook.productionNPC} />
        </Grid>
      )}
      {recipebook.era && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <DetailItem label="시대" value={recipebook.era} />
        </Grid>
      )}
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="스킬" value={recipebook.skill} />
      </Grid>

      {recipebook.recipes && recipebook.recipes.length > 0 && (
        <Grid size={{ xs: 12 }} sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            레시피 목록
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>스킬</TableCell>
                  <TableCell>재료</TableCell>
                  <TableCell>결과물</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recipebook.recipes.map((recipe, index) => {
                  const parsedIngredients = recipe.ingredients ? JSON.parse(recipe.ingredients as unknown as string) : [];
                  const parsedOutput = recipe.output ? JSON.parse(recipe.output as unknown as string) : [];
                  const parsedRequiredSkill = recipe.required_Skill ? JSON.parse(recipe.required_Skill as unknown as string) : [];

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Link to={`/obj/${recipe.id}`}>{recipe.name}</Link>
                      </TableCell>
                      <TableCell>
                        {renderObjectsToChips(
                          parsedRequiredSkill.map((x: RecipeItem) => ({ ...x, id: parseInt(x.ref) })),
                          navigate
                        )}
                      </TableCell>
                      <TableCell>
                        {renderObjectsToChips(
                          parsedIngredients.map((x: RecipeItem) => ({ ...x, id: parseInt(x.ref) })),
                          navigate,
                          (value) => " x " + value
                        )}
                      </TableCell>
                      <TableCell>
                        {renderObjectsToChips(
                          parsedOutput.map((x: RecipeItem) => ({ ...x, id: parseInt(x.ref) })),
                          navigate,
                          (value) => " x " + value
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      )}

      {recipebook.obtain_method ? (
        <Grid size={{ xs: 12 }}>
          <DetailItem
            label="획득방법"
            value={<ObtainMethodTabs data={recipebook.obtain_method} />}
          />
        </Grid>
      ) : null}

    </Grid>
  );
}
