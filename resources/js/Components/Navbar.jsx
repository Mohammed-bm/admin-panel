
import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import {
    AppBar,
    Toolbar,
    Box,
    IconButton,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar({ onMobileToggle }) {

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                // Hide on desktop (sm and up), show on mobile (xs)
                display: { xs: 'block', sm: 'none' },
                left: 0,
                width: '100%',
                transition: '200ms ease',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                borderBottom: '1px solid #E2E8F0',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Mobile Hamburger Button */}
                    <IconButton
                        onClick={onMobileToggle}
                        sx={{ color: '#64748B', mr: 1 }}
                    >
                        <MenuIcon />
                    </IconButton>

                </Box>
            </Toolbar>
        </AppBar>
    );
}