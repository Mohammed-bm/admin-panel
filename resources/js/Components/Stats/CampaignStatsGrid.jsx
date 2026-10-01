import React from 'react';
import { Box, Typography } from '@mui/material';
import { STAT_CONFIGS } from './statConfigs';

export default function ConsolidatedStatBar({ stats = {}, type = 'emails' }) {
    // Fallback to empty array if type doesn't exist
    const config = STAT_CONFIGS[type] || STAT_CONFIGS.emails;

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                py: 1.5,
                px: 2,
                borderRadius: '12px',
                border: '1px solid',
                borderColor: 'grey.200',
                backgroundColor: '#ffffff'
            }}
        >
            {config.map((item, index) => {
                const IconComponent = item.icon;
                const displayValue = item.getValue(stats);

                return (
                    <React.Fragment key={item.label}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, justifyContent: 'center' }}>
                            {/* Circle Icon */}
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    backgroundColor: item.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}
                            >
                                <IconComponent sx={{ fontSize: 18, color: item.color }} />
                            </Box>

                            {/* Text Stack */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
                                    {item.label}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 700 }}>
                                    {displayValue}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Divider */}
                        {index < config.length - 1 && (
                            <Box sx={{ width: '1px', height: '28px', bgcolor: 'grey.200' }} />
                        )}
                    </React.Fragment>
                );
            })}
        </Box>
    );
}