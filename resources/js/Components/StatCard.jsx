import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

export default function StatCard({ icon: Icon, label, value, subtext }) {
    return (
        <Card 
            variant="outlined" 
            sx={{ 
                borderRadius: 2, 
                boxShadow: 'none',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
            }}
        >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, color: 'text.secondary' }}>
                    {Icon && <Icon sx={{ fontSize: 18, color: 'text.primary' }} />}
                    <Typography variant="body2" component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                        {label}
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, color: 'text.primary', tracking: '-0.02em' }}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                    </Typography>
                    {subtext && (
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                            {subtext}
                        </Typography>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}