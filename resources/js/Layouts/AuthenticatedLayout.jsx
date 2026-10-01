import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Sidebar from '@/Components/Sidebar';
import Navbar from '@/Components/Navbar';


export default function AuthenticatedLayout({ header, children }) {
    const [open, setOpen] = useState(false);

    const handleDrawerToggle = () => {
        setOpen((prev) => !prev);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FAF9FF' }}>
            <CssBaseline />

            <Navbar open={open} onMobileToggle={handleDrawerToggle} />
            <Sidebar open={open} onToggle={handleDrawerToggle} />

            {/* MAIN CONTENT AREA */}
            <Box
                sx={{
                    flexGrow: 1,
                    minWidth: 0,
                    transition: 'width 200ms ease, margin 200ms ease',
                }}
            >

                {/* PAGE CONTENT */}
                <Box
                    component="main"
                    sx={{
                        pt: '30px',
                        px: { xs: 2, sm: 3.5 },
                        pb: 4,
                    }}
                >
                    {header && <Box sx={{ mb: 3 }}>{header}</Box>}
                    {children}
                </Box>
            </Box>
        </Box>
    );
}