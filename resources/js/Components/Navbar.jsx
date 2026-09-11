import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    AppBar,
    Toolbar,
    Box,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar({ open, onMobileToggle }) {
    const user = usePage().props.auth.user;
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                left: {
                    xs: 0,
                    sm: open ? `220px` : `68px`,
                },
                width: {
                    xs: '100%',
                    sm: `calc(100% - ${open ? 220 : 68}px)`,
                },
                transition: '200ms ease',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: '#FFFFFF',
                color: '#1E293B',
                borderBottom: '1px solid #E2E8F0',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Mobile Hamburger Button */}
                    <IconButton
                        onClick={onMobileToggle}
                        sx={{ display: { sm: 'none' }, color: '#64748B', mr: 1 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Brand Logo & Title */}
                    <Box
                        component={Link}
                        //href="/"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none' }}
                    >
                        <Box
                            sx={{
                                width: 34,
                                height: 34,
                                borderRadius: '10px',
                                backgroundColor: '#6C38CC',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#FFFFFF',
                                fontWeight: 700,
                                fontSize: '1.1rem',
                            }}
                        >
                            N
                        </Box>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#0F172A', letterSpacing: '-0.02em' }}>
                            Leadnest.ai
                        </Typography>
                    </Box>
                </Box>

                {/* Right Section: Notifications & Profile Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

                    <IconButton onClick={handleProfileMenuOpen} size="small" sx={{ ml: 0.5 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: '#6C38CC', fontSize: 14, fontWeight: 600 }}>
                            {user?.name ? user.name[0].toUpperCase() : 'U'}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={isMenuOpen}
                        onClose={handleProfileMenuClose}
                        onClick={handleProfileMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 4px 16px rgba(0,0,0,0.08))',
                                mt: 1.5,
                                minWidth: 180,
                                borderRadius: '12px',
                                border: '1px solid #E2E8F0',
                                '& .MuiMenuItem-root': {
                                    px: 2,
                                    py: 1,
                                    borderRadius: '8px',
                                    mx: 0.5,
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600} color="#0F172A">
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" noWrap>
                                {user?.email}
                            </Typography>
                        </Box>
                        <Divider sx={{ my: 0.5 }} />
                        <MenuItem component={Link} href={route('profile.edit')}>
                            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem
                            component={Link}
                            href={route('logout')}
                            method="post"
                            as="button"
                            sx={{ color: '#EF4444', width: '100%' }}
                        >
                            <ListItemIcon sx={{ color: '#EF4444' }}><LogoutIcon fontSize="small" /></ListItemIcon>
                            Log Out
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}