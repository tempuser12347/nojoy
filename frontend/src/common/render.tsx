// import mui chip
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

type NavigateFunction = ReturnType<typeof useNavigate>;
// create function that will take in array of json object with field (ref, name, value) and return mui chip array
export function renderObjectsToChips(
  data: { ref?: string; name: string; value: number; id?: number; link?: string }[] | null,
  navigate?: NavigateFunction
) {
  if (!data) return null;
  return data.map((item, index) => {
    const hasLink = item.link && navigate;
    return (
      <Chip
        key={index}
        label={`${item.name} (${item.value})`}
        sx={{ margin: 0.5, cursor: hasLink ? 'pointer' : 'default' }}
        onClick={hasLink ? () => navigate(item.link!) : undefined}
        clickable={!!hasLink}
      />
    );
  });
}
