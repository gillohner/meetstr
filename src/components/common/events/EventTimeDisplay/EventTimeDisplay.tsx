import { Box, Typography, TypographyProps } from '@mui/material';
import { formatDate } from '@/utils/formatting/formatDate';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';

interface EventTimeDisplayProps {
    startTime: string;
    endTime?: string | null;
    typographyProps?: TypographyProps;
}

export default function EventTimeDisplay({ startTime, endTime, typographyProps }: EventTimeDisplayProps) {
    const { t } = useTranslation();
    const formattedStartTime = startTime
        ? formatDate(startTime, t('error.event.invalidDate', 'Invalid date')) 
        : t('error.event.noDate', 'No date provided');
    const formattedEndTime = endTime 
        ? formatDate(endTime, t('error.event.invalidDate', 'Invalid date')) 
        : null;

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography
                variant="body1"
                color="text.secondary"
                {...typographyProps}
            >
                {formattedStartTime}
                {formattedEndTime && ` - ${formattedEndTime}`}
            </Typography>
        </Box>
    );
}
