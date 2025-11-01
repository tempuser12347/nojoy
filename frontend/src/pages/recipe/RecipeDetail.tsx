import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Paper,Box, Typography, Grid, CircularProgress, TableContainer, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import api from "../../api";
import { renderObjectsToChips } from "../../common/render";
import DetailItem from "../../components/DetailItem";

interface Recipe {
  id: number;
  name: string;
  description: string;
  recipe_book_id: number;
  required_Skill: Array<{ ref: string; name: string; value: number }>;
  ingredients: Array<{ ref: string; name: string; value: number }>;
  sophia: number;
  era: string;
  home_production: string;
  development: number;
  Investment_cost: number;
  central_city: string;
  Industrial_revolution: string;
  own_Industrial_city: string;
  title: string;
  consumption_contribution: number;
  other: string;
  success: Array<{ ref: string; name: string; value: number }>;
  greatsuccess: Array<{ ref: string; name: string; value: number }>;
  failure: Array<{ ref: string; name: string; value: number }>;
}

export default function RecipeDetail({ data }: { data?: Recipe }) {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(data || null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const renderIngredientAndOutput = (recipe: Recipe | null) => {
    if (recipe == null) {
      return null;
    }

    const outcomes = [
      {
        type: "성공",
        data: recipe.success,
      },
      {
        type: "대성공",
        data: recipe.greatsuccess,
      },
      {
        type: "실패",
        data: recipe.failure,
      },
    ].filter((outcome) => outcome.data && outcome.data.length > 0);

    if (outcomes.length === 0) {
      return null;
    }

    return (
      <Grid size={{xs: 12}}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>재료</TableCell>
                <TableCell sx={{ width: "100px" }}>유형</TableCell>
                <TableCell>생산물</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {outcomes.map((outcome, index) => (
                <TableRow key={outcome.type}>
                  {index === 0 && (
                    <TableCell rowSpan={outcomes.length}>
                      {renderObjectsToChips(
                        recipe.ingredients.map((x) => ({ ...x, id: parseInt(x.ref) })),
                        navigate,
                        (value) => "x " + value
                      )}
                    </TableCell>
                  )}
                  <TableCell>{outcome.type}</TableCell>
                  <TableCell>
                    {renderObjectsToChips(outcome.data.map((x) => ({ ...x, id: parseInt(x.ref) })), navigate, (v) => "x " + v)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    )
  };

  const renderRequirements = (recipe: Recipe|null) => {
    if(recipe==null){
      return null;
    }
    if (!(recipe.sophia || recipe.era || recipe.central_city || recipe.Investment_cost || recipe.home_production || recipe.Industrial_revolution)){
      return null;
    }
    return  (

      <Grid size={{xs: 12}}>
        <Typography>요구사항</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {recipe.sophia && <TableCell>소피아</TableCell>}
                {recipe.era && <TableCell>시대</TableCell>}
                {recipe.central_city && <TableCell>중앙도시</TableCell>}
                {recipe.Investment_cost && <TableCell>투자</TableCell>}
                {recipe.home_production && <TableCell>자택생산</TableCell>}
                {recipe.Industrial_revolution && <TableCell>산업혁명</TableCell>}
                {recipe.own_Industrial_city && <TableCell>자영산업도시</TableCell>}
                {recipe.title && <TableCell>칭호</TableCell>}
                {recipe.consumption_contribution && <TableCell>소비 공헌도</TableCell>}
                {recipe.other && <TableCell>기타</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {recipe.sophia && <TableCell>{recipe.sophia}</TableCell>}
                {recipe.era && <TableCell>{recipe.era}</TableCell>}
                {recipe.Investment_cost && <TableCell>{recipe.Investment_cost}</TableCell>}
                {recipe.home_production && <TableCell>{recipe.home_production}</TableCell>}
                {recipe.Industrial_revolution && <TableCell>{recipe.Industrial_revolution}</TableCell>}
                {recipe.own_Industrial_city && <TableCell>{recipe.own_Industrial_city}</TableCell>}
                {recipe.title && <TableCell>{recipe.title}</TableCell>}
                {recipe.consumption_contribution && <TableCell>{recipe.consumption_contribution}</TableCell>}
                {recipe.other && <TableCell>{recipe.other}</TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    )
  }

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await api.get(`/api/recipes/${id}`);
        console.log(response.data);
        setRecipe(response.data);
      } catch (err) {
        setError("Failed to load recipe details");
        console.error("Error fetching recipe:", err);
      }
    };

    if (!data && id) {
      fetchRecipe();
    }
  }, [id, data]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{xs: 12}}>
        <DetailItem label="설명" value={recipe.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem
          label="필요 스킬"
          value={renderObjectsToChips(
            recipe.required_Skill.map((x) => ({ ...x, id: parseInt(x.ref) })),
            navigate
          )}
        />
      </Grid>
      {renderRequirements(recipe)}
      
      {renderIngredientAndOutput(recipe)}

    </Grid>
  );
}
