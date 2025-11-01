import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Grid,
} from "@mui/material";
import api from "../../api";
import "../../common/innertable.css";
import DetailItem from "../../components/DetailItem";

interface TreasureBox {
  name: string;
  description: string;
  sell_period: string;
  price: number;
  items: Record<
    string,
    { items: { id: number; name: string }[]; count: number }[]
  >;
}

const renderItems = (
  items: Record<
    string,
    { items: { id: number; name: string }[]; count: number }[]
  >,
  navigate: any
) => {
  const tableRows: React.ReactNode[] = [];
  Object.entries(items).forEach(([setname, itemGroup]) => {
    itemGroup.forEach((item, index) => {
      tableRows.push(
        <tr key={`${setname}-${index}`}>
          {index === 0 && (
            <td rowSpan={itemGroup.length} style={{ verticalAlign: "top" }}>
              {setname.startsWith("세트") ? "세트" : null}
            </td>
          )}
          <td>
            {item.items.map((subItem, subIdx) => (
              <div key={subIdx}>
                <a
                  href={`/obj/${subItem.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/obj/${subItem.id}`);
                  }}
                >
                  {subItem.name}
                </a>
              </div>
            ))}
          </td>
          <td>{item.count}</td>
        </tr>
      );
    });
  });

  return (
    <table className="inner-table">
      <thead>
        <tr>
          <th>세트</th>
          <th>아이템</th>
          <th>개수</th>
        </tr>
      </thead>
      <tbody>{tableRows}</tbody>
    </table>
  );
};

export default function TreasureBoxDetail() {
  const { id } = useParams<{ id: string }>();
  const [treasureBox, setTreasureBox] = useState<TreasureBox | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTreasureBox = async () => {
      try {
        const response = await api.get(`/api/treasurebox/${id}`);
        setTreasureBox(response.data);
      } catch (err) {
        setError("Failed to load treasure box details");
        console.error("Error fetching treasure box:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTreasureBox();
    }
  }, [id]);

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

  if (!treasureBox) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Treasure box not found.</Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DetailItem label="설명" value={treasureBox.description} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="판매 기간" value={treasureBox.sell_period} />
      </Grid>
      <Grid size={{ xs: 12, sm: 6 }}>
        <DetailItem label="가격" value={treasureBox.price} />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <DetailItem
          label="아이템"
          value={renderItems(treasureBox.items, navigate)}
        />
      </Grid>
    </Grid>
  );
}
