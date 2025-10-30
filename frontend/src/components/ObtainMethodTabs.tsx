import React from "react";
import { useState } from "react";

import { Link } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  TableCell,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
} from "@mui/material";

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

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>레시피책</TableCell>
                <TableCell>레시피</TableCell>
                <TableCell>스킬</TableCell>
                <TableCell>재료</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.recipe_list.map((item: any) => (
                <TableRow>
                  <TableCell><Link to={`/obj/${item.recipe_book.id}`}>{item.recipe_book.name}</Link>{item.method}</TableCell>
                  <TableCell>
                    <Link to={`/obj/${item.id}`}>{item.name}</Link>
                  </TableCell>
                  <TableCell>{item.skill.map((x: { id: number, name: string }) => <Link to={`/obj/${x.id}`}>{x.name}</Link>)}</TableCell>
                  <TableCell>{item.ingredients.map((x: { id: number, name: string, value: number }, i: number) => (<span key={i}>
                    <Link to={`/obj/${x.id}`}>{x.name}</Link> {x.value}
                    {i < item.ingredients.length - 1 ? ", " : ""}
                  </span>))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
        case "npcsale":
          return (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>npc</TableCell>
                    <TableCell>지역</TableCell>
                    <TableCell>위치</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {method.npcsale_list.map((item: any, index: number) => {
                    const currentRowNpc = item.npc;
                    const previousRowNpc = index > 0 ? method.npcsale_list[index - 1].npc : undefined;
                    const isFirstOfGroup = currentRowNpc !== previousRowNpc;
    
                    let rowSpan = 1;
                    if (isFirstOfGroup) {
                      for (let i = index + 1; i < method.npcsale_list.length; i++) {
                        if (method.npcsale_list[i].npc === currentRowNpc) {
                          rowSpan++;
                        } else {
                          break;
                        }
                      }
                    }
    
                    return (
                      <TableRow key={index}>
                        {isFirstOfGroup && (
                          <TableCell rowSpan={rowSpan}>{item.npc}</TableCell>
                        )}
                        <TableCell>
                          {item.region}
                        </TableCell>
                        <TableCell>
                          {item.locations.map((value: { id: number, name: string }, idx: number) => (
                            <span key={value.id}>
                              <Link to={`/obj/${value.id}`}>{value.name}</Link>
                              {idx < item.locations.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
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
    case "treasuremap":
      return (
        <ul>
          {method.treasuremap_list.map((item: any) => (
            <li key={item.id}>
              <Link to={`/obj/${item.id}`}>{item.name}</Link>
            </li>
          ))}
        </ul>
      );
    case "field_gatherable":
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>방법</TableCell>
                <TableCell>필드</TableCell>
                <TableCell>랭크</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.field_list.map((item: any) => (
                <TableRow>
                  <TableCell>{item.method}</TableCell>
                  <TableCell>
                    <Link to={`/obj/${item.id}`}>{item.name}</Link>
                  </TableCell>
                  <TableCell>{item.rank}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    case "field_resurvey_reward":
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>필드</TableCell>
                <TableCell>수량</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.field_list.map((item: any) => (
                <TableRow>
                  <TableCell>
                    <Link to={`/obj/${item.id}`}>{item.name}</Link>
                  </TableCell>
                  <TableCell>{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    case "consumable":
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>아이템</TableCell>
                <TableCell>획득수량</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.consumable_list.map((item: any) => (
                <TableRow>
                  <TableCell>
                    <Link to={`/obj/${item.id}`}>{item.name}</Link>
                  </TableCell>
                  <TableCell>{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    case "landnpc_drop":
      return (

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>육상npc</TableCell>
                <TableCell>필드</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.landnpc_list.map((item: any) => (
                <TableRow>
                  <TableCell>
                    <Link to={`/obj/${item.id}`}>{item.name}</Link>
                  </TableCell>
                  <TableCell>
                    {item.fields.map((value: { id: number, name: string }, index: number) => (
                      <span key={value.id}>
                        <Link to={`/obj/${value.id}`}>{value.name}</Link>
                        {index < item.fields.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )
    case "marinenpc_drop":
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>방식</TableCell>
                <TableCell>해상npc</TableCell>
                <TableCell>해역</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.marinenpc_list.map((item: any, index: number) => {
                const currentRowMethod = item.method;
                const previousRowMethod = index > 0 ? method.marinenpc_list[index - 1].method : undefined;
                const isFirstOfGroup = currentRowMethod !== previousRowMethod;

                let rowSpan = 1;
                if (isFirstOfGroup) {
                  for (let i = index + 1; i < method.marinenpc_list.length; i++) {
                    if (method.marinenpc_list[i].method === currentRowMethod) {
                      rowSpan++;
                    } else {
                      break;
                    }
                  }
                }

                return (
                  <TableRow key={index}>
                    {isFirstOfGroup && (
                      <TableCell rowSpan={rowSpan}>{item.method}</TableCell>
                    )}
                    <TableCell>
                      <Link to={`/obj/${item.id}`}>{item.name}</Link>
                    </TableCell>
                    <TableCell>
                      {item.sea_areas.map((value: { id: number, name: string }, idx: number) => (
                        <span key={value.id}>
                          <Link to={`/obj/${value.id}`}>{value.name}</Link>
                          {idx < item.sea_areas.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )
    case "ganador":
      return (

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{minWidth: '80px'}}>유형</TableCell>
                <TableCell sx={{minWidth: '80px'}}>난이도</TableCell>
                <TableCell>가나돌</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.ganador_list.map((item: any, index: number) => {
                const currentRowMethod = item.category;
                const previousRowMethod = index > 0 ? method.ganador_list[index - 1].category : undefined;
                const isFirstOfGroup = currentRowMethod !== previousRowMethod;

                let rowSpan = 1;
                if (isFirstOfGroup) {
                  for (let i = index + 1; i < method.ganador_list.length; i++) {
                    if (method.ganador_list[i].category === currentRowMethod) {
                      rowSpan++;
                    } else {
                      break;
                    }
                  }
                }

                return (
                  <TableRow key={index}>
                    {isFirstOfGroup && (
                      <TableCell rowSpan={rowSpan}>{item.category}</TableCell>
                    )}
                    <TableCell>
                      {JSON.stringify(item.difficulty)}
                    </TableCell>
                    <TableCell>
                      {item.ganador_list.map((value: { id: number, name: string }, idx: number) => (
                        <span key={value.id}>
                          <Link to={`/obj/${value.id}`}>{value.name}</Link>
                          {idx < item.ganador_list.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

      )
    case "citynpc_gift":
      return (

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{minWidth: '80px'}}>지역</TableCell>
                <TableCell sx={{minWidth: '80px'}}>도시</TableCell>
                <TableCell sx={{minWidth: '80px'}}>npc</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {method.citynpc_list.map((item: any, index: number) => {
                const currentRowMethod = item.region;
                const previousRowMethod = index > 0 ? method.citynpc_list[index - 1].region : undefined;
                const isFirstOfGroup = currentRowMethod !== previousRowMethod;

                let rowSpan = 1;
                if (isFirstOfGroup) {
                  for (let i = index + 1; i < method.citynpc_list.length; i++) {
                    if (method.citynpc_list[i].region === currentRowMethod) {
                      rowSpan++;
                    } else {
                      break;
                    }
                  }
                }

                return (
                  <TableRow key={index}>
                    {isFirstOfGroup && (
                      <TableCell rowSpan={rowSpan}>{item.region}</TableCell>
                    )}
                    <TableCell>
                      <Link to={`/obj/${item.city.id}`}>{item.city.name}</Link>
                    </TableCell>
                    <TableCell>
                      {item.citynpc_list.map((value: { id: number, name: string }, idx: number) => (
                        <span key={value.id}>
                          <Link to={`/obj/${value.id}`}>{value.name}</Link>
                          {idx < item.citynpc_list.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )
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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
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
            } else if (method.from == "treasuremap") {
              label = "보물지도";
            } else if (method.from == "field_gatherable") {
              label = "필드수집";
            } else if (method.from == "field_resurvey_reward") {
              label = "육지재조사보상";
            } else if (method.from == "consumable") {
              label = "아이템 사용";
            } else if (method.from == "landnpc_drop") {
              label = "육상NPC드랍";
            }
            else if (method.from == "marinenpc_drop") {
              label = "해상NPC드랍";
            }
            else if (method.from == "ganador") {
              label = "가나돌";
            }
            else if (method.from == "citynpc_gift") {
              label = "답례품";
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
