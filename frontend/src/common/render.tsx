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

export function renderItemsWithAmount(data: { name: string; value: number; id?: number; link?: string }[] | null, navigate?: NavigateFunction) {
  if (!data) return null;
  return data.map((item, index) => {
    const hasLink = item.link && navigate;
    return (
        // render <span> text with the name in it and  add 'x 1' like to show the amount. if link is presend, make the name only link and clickable, not the 'x 1' part.
        <span key={index} style={{ marginRight: 8 }}>
          {hasLink ? (
            <Chip
              label={item.name}
              sx={{ margin: 0.5, cursor: 'pointer' }}
              onClick={() => navigate!(item.link!)}
              clickable
            />
          ) : (
            <Chip label={item.name} sx={{ margin: 0.5 }} />
          )}
          <span style={{ marginLeft: 4 }}>x {item.value}</span>
        </span>
    );
  });
}