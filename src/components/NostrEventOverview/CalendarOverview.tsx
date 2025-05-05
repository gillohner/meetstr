// src/components/NostrEventOverview/CalendarOverview.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { Grid, Box } from '@mui/material';
// import { useSingleCalendarEvent } from '@/hooks/useSingleCalendarEvent';
import { useNdk } from 'nostr-hooks';
import { fetchEventById } from '@/hooks/fetchEventById';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function CalendarOverview({ calendarId }: { calendarId: string | undefined }) {
    const { ndk } = useNdk();
    const [event, setEvent] = useState<NDKEvent | null>(null);
    const { i18n } = useTranslation();
    
    useEffect(() => {
        if (!ndk || !calendarId) return;
        fetchEventById(ndk, calendarId)
            .then(setEvent)
            .catch(console.error);
    }, [ndk, calendarId]);

    if (!event) return (       
        <Typography variant="h4">
            {i18n.t('error.calendar.invalidId')}
        </Typography>
    );
    if (event.kind !== 31924) return (
        <Typography variant="h4">
            {i18n.t('error.calendar.wrongKind')}
        </Typography>
    );

    // Extract event metadata from tags
    const name = event.tags.find(t => t[0] === 'name');
    const description = event.tags.find(t => t[0] === 'description');
    const image = event.tags.find(t => t[0] === 'image');

    return (
        <Card>
            <CardMedia
                component="img"
                alt={ description }
                height="300"
                image={image?.[1] || 'https://picsum.photos/200'}
            />
            <CardContent>
                <Grid container>
                    <Grid item>
                        <Typography gutterBottom variant="h5" component="div">
                            {name?.[1] || i18n.t('error.calendar.noName')}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {description?.[1]}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
