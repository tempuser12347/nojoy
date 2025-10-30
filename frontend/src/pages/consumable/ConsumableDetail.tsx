import { Box, Typography, Card, CardContent, Grid } from "@mui/material";
import { renderObjectsToChips } from "../../common/render";
import ObtainMethodTabs from "../../components/ObtainMethodTabs";
import DetailItem from "../../components/DetailItem";

interface Consumable {
  id: number;
  name: string;
  additional_Name: string;
  description: string;
  category: string;
  type: string;
  usage_Effect: { id: number; name: string };
  features: string;
  item: { id: number; name: string; value?: number }[] | null;
  Duplicate: string;
  obtain_method: any[];
}

export default function ConsumableDetail({ data }: { data: Consumable }) {
  const consumable = data;
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {consumable.name}
      </Typography>
      {consumable.additional_Name && (
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {consumable.additional_Name}
        </Typography>
      )}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{xs: 12}}>
              <DetailItem label="설명" value={consumable.description} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="카테고리" value={consumable.category} />
            </Grid>
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="타입" value={consumable.type} />
            </Grid>
            {consumable.features ? 
            
            <Grid size={{xs: 12, sm: 6}}>
              <DetailItem label="특징" value={consumable.features} />
            </Grid> : null
          }
            {consumable.usage_Effect && (
              <Grid size={{xs: 12}}>
                <Typography variant="subtitle1" color="text.secondary">
                  사용효과
                </Typography>
                <Typography
                  component="pre"
                  sx={{
                    whiteSpace: "pre-wrap",
                    fontFamily: "monospace",
                    bgcolor: "grey.100",
                    p: 1,
                    borderRadius: 1,
                  }}
                >
                  {typeof consumable.usage_Effect === "object"
                    ? JSON.stringify(consumable.usage_Effect, null, 2)
                    : consumable.usage_Effect}
                </Typography>
              </Grid>
            )}
            <Grid size={{xs: 12}}>
              <DetailItem
                label="아이템"
                value={
                  renderObjectsToChips(
                    consumable.item,
                    null,
                    (value) => "x" + value
                  )
                }
              />
            </Grid>

            {consumable.obtain_method ? (
              <Grid size={{xs: 12}}>
                <DetailItem
                  label="획득방법"
                  value={<ObtainMethodTabs data={consumable.obtain_method} />}
                />
              </Grid>
            ) : null}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
