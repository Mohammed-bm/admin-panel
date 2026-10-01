import React, { useState } from 'react';
import { Box, Typography, IconButton, Collapse, Paper, Chip } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ConsolidatedStatBar from './Stats/CampaignStatsGrid';
import CampaignsTable from './CampaignsTable'; // Your existing table component

export default function AppAccordionItem({ app }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper variant="outlined" sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
      {/* 1. App Header + Accordion Toggle */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          backgroundColor: 'background.paper',
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {app.name}
          </Typography>
          <Chip label={`App ID: ${app.id}`} size="small" variant="outlined" />
        </Box>

        <IconButton size="small">
          {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Box>

      {/* 2. Consolidated Stat Bar */}
      <Box sx={{ px: 2, pb: 2 }}>
        <ConsolidatedStatBar stats={app.stats} />
      </Box>

      {/* 3. Collapsible Campaign Table */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Box sx={{ px: 2, pb: 2 }}>
          <CampaignsTable campaigns={app.campaigns} />
        </Box>
      </Collapse>
    </Paper>
  );
}