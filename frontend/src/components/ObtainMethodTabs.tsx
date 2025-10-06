import React from "react";
import { useState } from "react";

import { Link } from "react-router-dom";
import { Box, Tabs, Tab } from "@mui/material";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const renderTabContent = (method: any) => {
  switch (method.from) {
    case "quest":
      return (
        <ul>
          {method.quest_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/obj/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    case "recipe":
      return (
        <ul>
          {method.recipe_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/obj/${item.id}`}>{item.name}</Link>
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
                  <Link to={`/obj/${item.location_id}`}>
                    {item.location_name}
                  </Link>
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
              <Link to={`/obj/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    case "treasurebox":
      return (
        <ul>
          {method.treasurebox_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/obj/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};
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

const ObtainMethodTabs: React.FC<{ data: { from: string }[] }> = ({ data }) => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="obtain methods"
        >
          {data.map((method, index) => {
            let label = method.from.toUpperCase();
            if (method.from == "quest") {
              label = "퀘스트";
            } else if (method.from == "recipe") {
              label = "생산";
            } else if (method.from == "npcsale") {
              label = "구입";
            } else if (method.from == "shipwreck") {
              label = "침몰선";
            } else if (method.from == "treasurebox") {
              label = "트레져박스";
            }

            return <Tab label={label} key={index} />;
          })}
        </Tabs>
      </Box>
      {data.map((method, index) => (
        <TabPanel value={tabValue} index={index} key={index}>
          {renderTabContent(method)}
        </TabPanel>
      ))}
    </>
  );
};

export default ObtainMethodTabs;
