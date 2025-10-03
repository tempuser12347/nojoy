import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Card, CardContent } from "@mui/material";
import api from "../../api";
import { renderObjectsToChips } from "../../common/render";

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

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!recipe) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {recipe.name}
      </Typography>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr",
                lg: "1fr 1fr 1fr 1fr",
              },
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                필요 스킬
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap" }}>
                {renderObjectsToChips(recipe.required_Skill, navigate)}
              </Box>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                소피아
              </Typography>
              <Typography variant="body1">{recipe.sophia}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                설명
              </Typography>
              <Typography variant="body1">{recipe.description}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                재료
              </Typography>
              <Typography variant="body1">
                {renderObjectsToChips(
                  recipe.ingredients,
                  navigate,
                  (value) => "x " + value
                )}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                시대
              </Typography>
              <Typography variant="body1">{recipe.era}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                중앙도시
              </Typography>
              <Typography variant="body1">{recipe.central_city}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                투자비용
              </Typography>
              <Typography variant="body1">{recipe.Investment_cost}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                가내수공업
              </Typography>
              <Typography variant="body1">{recipe.home_production}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                개발
              </Typography>
              <Typography variant="body1">{recipe.development}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                산업혁명
              </Typography>
              <Typography variant="body1">
                {recipe.Industrial_revolution}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                자영산업도시
              </Typography>
              <Typography variant="body1">
                {recipe.own_Industrial_city}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                칭호
              </Typography>
              <Typography variant="body1">{recipe.title}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                소비 공헌도
              </Typography>
              <Typography variant="body1">
                {recipe.consumption_contribution}
              </Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                기타
              </Typography>
              <Typography variant="body1">{recipe.other}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                성공
              </Typography>
              <Typography variant="body1">
                {renderObjectsToChips(
                  recipe.success,
                  navigate,
                  (value) => "x " + value
                )}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                대성공
              </Typography>
              <Typography variant="body1">
                {renderObjectsToChips(
                  recipe.greatsuccess,
                  navigate,
                  (value) => "x " + value
                )}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                실패
              </Typography>
              <Typography variant="body1">
                {renderObjectsToChips(
                  recipe.failure,
                  navigate,
                  (value) => "x " + value
                )}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
