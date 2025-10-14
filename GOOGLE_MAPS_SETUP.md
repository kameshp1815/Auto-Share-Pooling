# Google Maps Integration Setup

This document explains how to set up Google Maps integration for the AutoSharePolling application.

## Prerequisites

1. Google Cloud Platform account
2. Google Maps API enabled
3. API key with appropriate permissions

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Directions API
   - Geocoding API
   - Routes API

## Step 2: Create API Key

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the generated API key
4. (Optional) Restrict the API key to your domain for security

## Step 3: Configure Environment Variables

Create a `.env` file in the `client` directory with the following content:

```env
# LocationIQ API Key for geocoding and directions
VITE_LOCATIONIQ_API_KEY=your_locationiq_api_key

# Google Maps API Key for interactive maps
VITE_GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key

# Razorpay API Key for payments
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

Replace `your_actual_google_maps_api_key` with your actual Google Maps API key.

## Step 4: Features Enabled

With Google Maps integration, the following features are available:

### Interactive Maps
- Real-time map rendering
- Zoom and pan controls
- Traffic layer display
- Transit layer display

### Route Visualization
- Real driving directions
- Traffic-aware routing
- Multiple route alternatives
- Turn-by-turn directions

### Live Driver Tracking
- Real-time driver position updates
- Driver movement animation
- ETA calculations
- Distance calculations

### Navigation Integration
- Direct integration with Google Maps app
- Turn-by-turn navigation
- Voice-guided directions
- Offline map support (when available)

## Step 5: Fallback Behavior

If no Google Maps API key is provided, the application will automatically fall back to a static map with:
- Basic route visualization
- Driver location indicators
- Essential ride information
- Navigation buttons (opens external maps)

## Step 6: Testing

1. Start the development server:
   ```bash
   cd client
   npm run dev
   ```

2. Navigate to the ride status page
3. Book a ride to see the interactive map in action
4. Verify that:
   - Map loads correctly
   - Markers appear at correct locations
   - Routes are displayed
   - Driver tracking works (simulated)

## Troubleshooting

### Map Not Loading
- Check if API key is correctly set in `.env` file
- Verify API key has required permissions
- Check browser console for errors
- Ensure APIs are enabled in Google Cloud Console

### Geocoding Issues
- Verify LocationIQ API key is set
- Check API quota limits
- Ensure addresses are in supported regions

### Performance Issues
- Enable caching for geocoding results
- Optimize map rendering settings
- Consider using map clustering for multiple markers

## Security Considerations

1. **API Key Restrictions**: Restrict your API key to specific domains/IPs
2. **Quota Limits**: Set up billing alerts and quota limits
3. **Rate Limiting**: Implement rate limiting for geocoding requests
4. **Caching**: Cache geocoding results to reduce API calls

## Cost Optimization

1. **Caching**: Implement aggressive caching for geocoding results
2. **Batch Requests**: Use batch geocoding when possible
3. **Quota Monitoring**: Monitor API usage regularly
4. **Fallback Strategy**: Use LocationIQ as fallback for geocoding

## Advanced Features (Future)

- Real-time traffic data
- Predictive routing
- Multi-modal transportation
- Indoor maps
- Street View integration
- Custom map styling

## Support

For issues related to:
- Google Maps API: Check [Google Maps Platform documentation](https://developers.google.com/maps/documentation)
- LocationIQ API: Check [LocationIQ documentation](https://locationiq.com/docs)
- Application issues: Check the application logs and browser console

