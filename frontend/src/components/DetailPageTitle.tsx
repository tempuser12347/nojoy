import { Divider, Box, Typography } from "@mui/material";

const DetailPageTitle = ({ typename, title }: {typename: string, title: string}) => <>

    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Typography variant="h5" color="primary.main" fontWeight="bold">
            {typename}
        </Typography>
        <Divider orientation="vertical" flexItem />
        <Typography variant="h4">
            {title}
        </Typography>
    </Box>
</>

export default DetailPageTitle;
