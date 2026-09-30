import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme, Box, Typography } from '@mui/material';
import { Link, usePage } from '@inertiajs/react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from "@mui/icons-material/Business";

const OPEN_WIDTH = 220;
const CLOSED_WIDTH = 68;

const NAV_ITEMS = [
    { text: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
    { text: 'Users', icon: PeopleIcon, href: '/users' },
    { text: 'Organization', icon: BusinessIcon, href: '/organization' }
];

export default function Sidebar({ open, onToggle }) {
    const { url } = usePage();
    const width = open ? OPEN_WIDTH : CLOSED_WIDTH;
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            open={open}
            sx={{
                width: isMobile ? 0 : width,
                flexShrink: 0,
                transition: 'width 200ms ease',

                '& .MuiDrawer-paper': {
                    width: isMobile ? OPEN_WIDTH : width,
                    boxSizing: 'border-box',
                    borderRight: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    transition: 'width 200ms ease',
                    overflowX: 'hidden',
                },
            }}
        >
            {/* Header / Logo Container */}
            <Box
                sx={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'space-between' : 'center',
                    px: open ? 1.5 : 1,
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        borderRadius: '10px',
                        p: open ? 1 : 0,
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        component="img"
                        src="/leadnest.jpg"
                        alt="Leadnest Logo"
                        sx={{
                            height: 32,
                            width: 32,
                            objectFit: 'contain',
                            borderRadius: '4px',
                            flexShrink: 0,
                        }}
                    />
                    {open && (
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                color: '#1E293B',
                                letterSpacing: '-0.02em',
                                fontSize: '1.1rem',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Leadnest.ai
                        </Typography>
                    )}
                </Box>

                <IconButton
                    onClick={onToggle}
                    sx={{
                        color: '#64748B',
                        transition: 'all 0.2s',
                        '&:hover': {
                            backgroundColor: '#F3E8FF',
                            color: '#7C3AED',
                        },
                    }}
                >
                    {open ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
            </Box>

            {/* Navigation List */}
            <List sx={{ px: 1 }}>
                {NAV_ITEMS.map(({ text, icon: Icon, href }) => {
                    const isActive = url === href || url.startsWith(`${href}/`);

                    return (
                        <ListItem key={text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                href={href}
                                sx={{
                                    minHeight: 48,
                                    borderRadius: '10px',
                                    color: isActive ? '#7C3AED' : '#64748B',
                                    backgroundColor: isActive ? '#F3E8FF' : 'transparent',
                                    justifyContent: open ? 'initial' : 'center',
                                    '&:hover': {
                                        backgroundColor: isActive ? '#F3E8FF' : '#F8FAFC',
                                        color: '#7C3AED',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : 0,
                                        justifyContent: 'center',
                                        color: isActive ? '#7C3AED' : '#64748B',
                                    }}
                                >
                                    <Icon />
                                </ListItemIcon>

                                <ListItemText
                                    primary={text}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                    }}
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        whiteSpace: 'nowrap',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
}