import "./render.css";
// import mui chip
import { Chip, Table, TableBody, TableCell, TableRow } from "@mui/material";
import { useNavigate } from "react-router-dom";

type NavigateFunction = ReturnType<typeof useNavigate>;
// create function that will take in array of json object with field (ref, name, value) and return mui chip array
export function renderObjectsToChips(
  data:
    | {
        ref?: string;
        name: string;
        value?: number | null;
        id?: number;
        link?: string;
      }[]
    | null,
  navigate?: NavigateFunction | null,
  value_render_fn?: (value: number | null) => string
) {
  if (!data) return null;

  return data.map((item, index) => {
    const hasLink = item.link && navigate;

    const label =
      item.value === null || item.value === undefined
        ? item.name
        : `${item.name} ${
            value_render_fn
              ? value_render_fn(item.value)
              : "(" + item.value + ")"
          }`;

    return (
      <Chip
        key={index}
        label={label}
        sx={{ margin: 0.5, cursor: hasLink ? "pointer" : "default" }}
        onClick={hasLink ? () => navigate(item.link!) : undefined}
        clickable={!!hasLink}
      />
    );
  });
}

export function renderItemsWithAmount(
  data: { name: string; value: number; id?: number; link?: string }[] | null,
  navigate?: NavigateFunction
) {
  if (!data) return null;
  return data.map((item, index) => {
    const hasLink = item.id && navigate;
    return (
      // render <span> text with the name in it and  add 'x 1' like to show the amount. if link is presend, make the name only link and clickable, not the 'x 1' part.
      <span key={index} style={{ marginRight: 8 }}>
        {hasLink ? (
          <Chip
            label={item.name}
            sx={{ margin: 0.5, cursor: "pointer" }}
            onClick={() => navigate!('/obj/' + item.id)}
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

export function renderRequirementsTable(
  data: { type: string; content: any }[] | null
) {
  if (!data) return null;
  // render table with two columns. first is 'type' second is 'content'. and then show data as rows
  return (
    <Table>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell align="center">{item.type}</TableCell>
            <TableCell align="left">{item.content}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function renderLink(
  text: string | undefined,
  url?: string,
  navigate?: NavigateFunction
) {
  if (!text) return null;

  return (
    <span
      className="highlight-link"
      onClick={() => navigate?.(url ?? "")}
    >
      {text}
    </span>
  );
}
