import AdbIcon from '@mui/icons-material/Adb';
import { Typography } from '@mui/material';

export default function Logo({ isMobile = false }) {
    return (
        <>
            <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
            <Typography
            variant={isMobile ? 'h5' : 'h6'}
            noWrap
            component="a"
            href="/"
            sx={{
                mr: 2,
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                display: isMobile ? { xs: 'flex', md: 'none' } : { xs: 'none', md: 'flex' }
            }}
            >
            Dezentralbot
            </Typography>
        </>
    );
};
