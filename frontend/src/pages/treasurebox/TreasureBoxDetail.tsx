import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import api from "../../api";
import "../../common/innertable.css";

interface TreasureBox {
  name: string;
  description: string;
  sell_period: string;
  price: number;
  items: Record<string, { items: { id: number; name: string }[]; count: number }[]>;
}

const renderItems = (
  items: Record<string, { items: { id: number; name: string }[]; count: number }[]>,
  navigate: any
) => {
  const tableRows: React.ReactNode[] = [];
  Object.entries(items).forEach(([setname, itemGroup]) => {
    itemGroup.forEach((item, index) => {
      tableRows.push(
        <tr key={`${setname}-${index}`}>
          {index === 0 && (
            <td rowSpan={itemGroup.length} style={{ verticalAlign: "top" }}>
              {setname}
            </td>
          )}
          <td>
            {item.items.map((subItem, subIdx) => (
              <div key={subIdx}>
                <a
                  href={`/object/${subItem.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/object/${subItem.id}`);
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
          <th>세트 이름</th>
          <th>아이템</th>
          <th>개수</th>
        </tr>
      </thead>
      <tbody>{tableRows}</tbody>
    </table>
  );
};

const DetailItem = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) =>
  value ? (
    <Box>
      <Typography variant="h6" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
        {value}
      </Typography>
    </Box>
  ) : null;

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {treasureBox.name}
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
              },
            }}
          >
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem label="설명" value={treasureBox.description} />
            </Box>
            <DetailItem label="판매 기간" value={treasureBox.sell_period} />
            <DetailItem label="가격" value={treasureBox.price} />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <DetailItem label="아이템" value={renderItems(treasureBox.items, navigate)} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
