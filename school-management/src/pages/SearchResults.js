import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box, Typography, Grid, Card, CardContent, Avatar,
    Chip, Divider, alpha, Fade, CircularProgress,
    IconButton, Tooltip, Breadcrumbs, Link
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Badge as BadgeIcon,
    ArrowForward as ArrowForwardIcon,
    Search as SearchIcon,
    NavigateNext as NavigateNextIcon,
    Home as HomeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const GlassCard = styled(Card)(({ theme }) => ({
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.05)}`,
    transition: 'all 0.3s ease',
    overflow: 'hidden',
    height: '100%',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 12px 48px ${alpha(theme.palette.primary.main, 0.1)}`,
        borderColor: alpha(theme.palette.primary.main, 0.3),
    },
}));

const SearchResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q') || '';

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await axios.get(`/api/users?search=${query}&limit=50`);
                setResults(res.data.users);
                setError(null);
            } catch (err) {
                console.error('Search error:', err);
                setError('Failed to fetch search results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    const getRoleColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin': return '#f59e0b';
            case 'teacher': return '#6366f1';
            case 'student': return '#10b981';
            default: return '#94a3b8';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress size={60} thickness={4} sx={{ color: '#6366f1' }} />
            </Box>
        );
    }

    return (
        <Fade in={true} timeout={800}>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                {/* Header & Breadcrumbs */}
                <Breadcrumbs
                    separator={<NavigateNextIcon fontSize="small" />}
                    sx={{ mb: 2 }}
                >
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                        <HomeIcon sx={{ fontSize: 18 }} /> Dashboard
                    </Link>
                    <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SearchIcon sx={{ fontSize: 18 }} /> Search
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        Search Results
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                        Showing {results.length} results for "{query}"
                    </Typography>
                </Box>

                {error && (
                    <Box sx={{ mb: 4 }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}

                {results.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 10 }}>
                        <Typography variant="h5" color="text.secondary">
                            No matching students or teachers found.
                        </Typography>
                        <Typography variant="body1" sx={{ mt: 1 }}>
                            Try adjusting your search terms.
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={3}>
                        {results.map((result) => (
                            <Grid item xs={12} sm={6} md={4} key={result._id}>
                                <GlassCard>
                                    <Box sx={{
                                        height: 6,
                                        bgcolor: getRoleColor(result.role),
                                        opacity: 0.8
                                    }} />
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                                            <Avatar
                                                src={result.profilePicture}
                                                sx={{
                                                    width: 60,
                                                    height: 60,
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                    border: `2px solid ${alpha(getRoleColor(result.role), 0.2)}`
                                                }}
                                            >
                                                {result.name.charAt(0)}
                                            </Avatar>
                                            <Chip
                                                label={result.role?.toUpperCase()}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getRoleColor(result.role), 0.1),
                                                    color: getRoleColor(result.role),
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem'
                                                }}
                                            />
                                        </Box>

                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                            {result.name}
                                        </Typography>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.7 }}>
                                            <EmailIcon sx={{ fontSize: 16 }} />
                                            <Typography variant="body2">{result.email}</Typography>
                                        </Box>

                                        {result.department && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, opacity: 0.7 }}>
                                                <BadgeIcon sx={{ fontSize: 16 }} />
                                                <Typography variant="body2">{result.department}</Typography>
                                            </Box>
                                        )}

                                        <Divider sx={{ my: 2, opacity: 0.3 }} />

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Tooltip title="View Profile">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => navigate(`/profile/${result._id}`)}
                                                    sx={{
                                                        bgcolor: alpha(getRoleColor(result.role), 0.05),
                                                        '&:hover': { bgcolor: alpha(getRoleColor(result.role), 0.1) }
                                                    }}
                                                >
                                                    <ArrowForwardIcon sx={{ color: getRoleColor(result.role) }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </GlassCard>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Fade>
    );
};

export default SearchResults;
