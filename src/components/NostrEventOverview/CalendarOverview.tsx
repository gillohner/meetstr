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

export default function CalendarOverview({ calendarId }: { calendarId: string | undefined }) {
    const { ndk } = useNdk();
    const [event, setEvent] = useState<NDKEvent | null>(null);
    
    useEffect(() => {
        if (!ndk || !calendarId) return;
        fetchEventById(ndk, calendarId)
            .then(setEvent)
            .catch(console.error);
    }, [ndk, calendarId]);

    if (!event) return null;

    // Extract event metadata from tags
    const nameTag = event.tags.find(t => t[0] === 'name');
    const imageTag = event.tags.find(t => t[0] === 'image');
    const locationTag = event.tags.find(t => t[0] === 'location');
    const startTag = event.tags.find(t => t[0] === 'start');
    const endTag = event.tags.find(t => t[0] === 'end');

    // Convert timestamps to readable dates
    const startDate = startTag ? new Date(parseInt(startTag[1]) * 1000).toLocaleString() : '';
    const endDate = endTag ? new Date(parseInt(endTag[1]) * 1000).toLocaleString() : '';

    // Parse location data (assuming format "geo:lat,lon")
    let mapUrl = '';
    if (locationTag && locationTag[1].startsWith('geo:')) {
        const [lat, lon] = locationTag[1].split(':')[1].split(',');
        mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.001}%2C${lat-0.001}%2C${lon+0.001}%2C${lat+0.001}&amp;layer=mapnik`;
    }

    return (
        <Grid container sx={{ width: "100%" }} spacing={2}>
            <Grid item xs={12}>
                <Card sx={{ width: "100%" }}>
                    <CardMedia
                        component="img"
                        alt="Event image"
                        height="300"
                        image={imageTag?.[1] || 'https://picsum.photos/200'}
                    />
                    <CardContent>
                        <Grid container>
                            <Grid item xs={9}>
                                <Typography gutterBottom variant="h5" component="div">
                                    {nameTag?.[1] || 'Untitled Event'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {event.content}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                                    {startDate && `Starts: ${startDate}`}
                                    <br />
                                    {endDate && `Ends: ${endDate}`}
                                </Typography>
                            </Grid>
                            <Grid item xs={3} container justifyContent="flex-end" alignContent="center">
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    href={event.tags.find(t => t[0] === 'tickets')?.[1]}
                                    target="_blank"
                                >
                                    RSVP
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <CardActions>
                        <Button 
                            size="small"
                            onClick={() => navigator.clipboard.writeText(`nostr:nevent1${event.id}`)}
                        >
                            Share
                        </Button>
                        <Button 
                            size="small" 
                            href={`https://nostr.guru/e/${event.id}`} 
                            target="_blank"
                        >
                            View Details
                        </Button>
                    </CardActions>
                </Card>
            </Grid>
            
            {locationTag && (
                <Grid item xs={12} md={5}>
                    <Card sx={{ width: "100%" }}>
                        <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                                Location
                            </Typography>
                            {mapUrl ? (
                                <>
                                    <iframe
                                        width="100%"
                                        height="250"
                                        src={mapUrl}
                                    />
                                    <br />
                                    <small>
                                        <a href={locationTag[1].replace('geo:', 'https://www.openstreetmap.org/?#map=19/')}>
                                            View Larger Map
                                        </a>
                                    </small>
                                </>
                            ) : (
                                <Typography variant="body2">
                                    {locationTag[1]}
                                </Typography>
                            )}
                        </CardContent>
                        <CardActions>
                            <Link 
                                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(locationTag[1])}`} 
                                target="_blank"
                                color="secondary" 
                                fontSize={12}
                            >
                                Open in Maps
                            </Link>
                        </CardActions>
                    </Card>
                </Grid>
            )}
        </Grid>
    );
}
