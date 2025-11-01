import { Divider, Box, Typography, Switch, FormControlLabel } from "@mui/material";

interface DetailPageTitleProps {
  typename: string;
  title: string;
  completed: boolean;
  onCompletedChange: (completed: boolean) => void;
}

const DetailPageTitle = ({ typename, title, completed, onCompletedChange }: DetailPageTitleProps) => (
  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Typography variant="h5" color="primary.main" fontWeight="bold">
        {typename}
      </Typography>
      <Divider orientation="vertical" flexItem />
      <Typography variant="h4">
        {title}
      </Typography>
    </Box>
    <FormControlLabel
      control={
        <Switch
          checked={completed}
          onChange={(e) => onCompletedChange(e.target.checked)}
        />
      }
      label={completed ? "완료" : "미완료"}
    />
  </Box>
);

export default DetailPageTitle;
