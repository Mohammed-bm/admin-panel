import React from 'react';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, IconButton, useMediaQuery, useTheme  } from '@mui/material';
import { Link } from '@inertiajs/react';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';

const OPEN_WIDTH = 220;
const CLOSED_WIDTH = 68;

const NAV_ITEMS = [
    { text: 'Dashboard', icon: DashboardIcon, href: '/dashboard'},
    { text: 'Users', icon: PeopleIcon, href: '/users'},
];

export default function Sidebar({ open, onToggle }) {
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
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}

            >
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
            </div>

            <List sx={{ px: 1 }}>
                {NAV_ITEMS.map(({ text, icon: Icon, href }) => (
                    <ListItem key={text} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            component={Link}
                            href={href}
                            sx={{
                                minHeight: 48,
                                borderRadius: '10px',
                                color: '#64748B',
                                justifyContent: open ? 'initial' : 'center',
                                '&:hover': {
                                    backgroundColor: '#F3E8FF',
                                    color: '#7C3AED',
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 2 : 0,
                                    justifyContent: 'center',
                                    color: 'inherit',
                                }}
                            >
                                <Icon />
                            </ListItemIcon>

                            <ListItemText
                                primary={text}
                                sx={{
                                    opacity: open ? 1 : 0,
                                    whiteSpace: 'nowrap',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}
