import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
} from "@mui/material";
import { renderObjectsToChips } from "../../common/render";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const renderTabContent = (method: any) => {
  switch (method.from) {
    case "quest":
      return (
        <ul>
          {method.quest_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/quest/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    case "recipe":
      return (
        <ul>
          {method.recipe_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/recipe/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    case "npcsale":
      return (
        <table className="inner-table">
          <thead>
            <tr>
              <th>NPC</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {method.npcsale_list.map((item: any) => (
              <tr key={item.id}>
                <td>{item.npc}</td>
                <td>
                  <Link to={`/city/${item.location_id}`}>{item.location_name}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    case "shipwreck":
      return (
        <ul>
          {method.shipwreck_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/shipwreck/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

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
}

export default function ConsumableDetail({ data }: { data: Consumable }) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  // const [consumable, setConsumable] = useState<Consumable>(data);
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
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            }}
          >
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                카테고리
              </Typography>
              <Typography variant="body1">{consumable.category}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                타입
              </Typography>
              <Typography variant="body1">{consumable.type}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                설명
              </Typography>
              <Typography variant="body1">{consumable.description}</Typography>
            </Box>
            <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
              <Typography variant="subtitle1" color="text.secondary">
                특징
              </Typography>
              <Typography variant="body1">{consumable.features}</Typography>
            </Box>
            {consumable.usage_Effect && (
              <Box sx={{ gridColumn: { xs: "1", sm: "1 / -1" } }}>
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
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                아이템
              </Typography>
              <Typography variant="body1">
                {renderObjectsToChips(
                  consumable.item,
                  null,
                  (value) => "x" + value
                )}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
      {consumable.obtain_method && consumable.obtain_method.length > 0 && (
        <Box sx={{ width: "100%", mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="obtain methods"
            >
              {consumable.obtain_method.map((method, index) => (
                <Tab label={method.from.toUpperCase()} key={index} />
              ))}
            </Tabs>
          </Box>
          {consumable.obtain_method.map((method, index) => (
            <TabPanel value={tabValue} index={index} key={index}>
              {renderTabContent(method)}
            </TabPanel>
          ))}
        </Box>
      )}
    </Box>
  );
}
