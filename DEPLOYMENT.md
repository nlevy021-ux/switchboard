# Switchboard Deployment Guide

This guide walks you through deploying Switchboard to production on Vercel.

## Prerequisites

- GitHub account with your Switchboard repository
- Vercel account (free tier works)
- OpenRouter API key from [https://openrouter.ai/](https://openrouter.ai/)
- Google Analytics 4 property (optional, for analytics tracking)
- Domain name (optional, but recommended)

## Step 1: Prepare Your Repository

1. **Ensure all sensitive files are in `.gitignore`:**
   - `.env*` files should already be ignored
   - Verify no API keys are committed to the repository

2. **Test your build locally:**
   ```bash
   npm run build
   npm start
   ```
   Verify the application works correctly.

## Step 2: Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in (or create an account)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

## Step 3: Configure Environment Variables

In the Vercel project settings, add the following environment variables:

### Required Variables

- **`OPENROUTER_API_KEY`**
  - Value: Your OpenRouter API key (starts with `sk-or-v1-`)
  - Environment: Production, Preview, Development
  - **Important:** This is server-side only and will not be exposed to clients

### Optional Variables

- **`NEXT_PUBLIC_GA_MEASUREMENT_ID`**
  - Value: Your Google Analytics 4 Measurement ID (format: `G-XXXXXXXXXX`)
  - Environment: Production, Preview (optional)
  - Leave empty if you don't want analytics

- **`NEXT_PUBLIC_APP_URL`**
  - Value: Your production domain URL (e.g., `https://switchboard.ai`)
  - Environment: Production
  - Used for API referer headers
  - Can be left empty for auto-detection

## Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your site will be available at `your-project.vercel.app`

## Step 5: Set Up Custom Domain (Optional)

If you purchased a domain:

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your domain (e.g., `switchboard.ai`)
4. Follow Vercel's DNS configuration instructions:
   - Add the A/CNAME records to your domain registrar
   - Wait for DNS propagation (can take a few minutes to 48 hours)
5. SSL certificate will be automatically provisioned by Vercel

### Domain Recommendations

Since `switchboard.com` is taken, consider:
- **switchboard.ai** (recommended - professional, matches AI focus)
- useswitchboard.com
- switchboard.app
- getswitchboard.com
- switchboardtools.com

## Step 6: Verify Deployment

1. **Test the application:**
   - Visit your production URL
   - Try routing a request
   - Verify API calls work correctly
   - Check that no errors appear in the browser console

2. **Verify security:**
   - Check that API keys are not exposed in client-side code
   - Verify the debug endpoint (`/api/debug-env`) is not accessible (should return 404)
   - Test that OpenRouter API calls work

3. **Test analytics (if enabled):**
   - Visit your site and perform some actions
   - Check Google Analytics Real-Time reports to verify tracking works

## Step 7: Post-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] Application builds successfully on Vercel
- [ ] Custom domain is configured (if applicable)
- [ ] SSL certificate is active
- [ ] API routes work correctly
- [ ] No API keys are exposed to the client
- [ ] Analytics tracking works (if enabled)
- [ ] Mobile responsiveness is working
- [ ] Deep links to external tools work correctly

## Troubleshooting

### Build Fails

- Check Vercel build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Vercel uses Node 18+ by default)

### API Keys Not Working

- Verify environment variables are set in Vercel dashboard
- Check that `OPENROUTER_API_KEY` is set for the correct environment
- Ensure the key is still valid in your OpenRouter account

### Analytics Not Tracking

- Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
- Check browser console for GA4 errors
- Use Google Analytics DebugView to test events
- Ensure the Measurement ID format is correct (`G-XXXXXXXXXX`)

### Domain Not Working

- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Verify domain is added in Vercel dashboard
- Check SSL certificate status in Vercel

## Security Notes

- **Never commit `.env*` files** - They are already in `.gitignore`
- **API keys are server-side only** - `OPENROUTER_API_KEY` is never sent to the client
- **Debug endpoint removed** - The `/api/debug-env` endpoint has been removed for security
- **Environment variables** - Use Vercel's environment variable settings, not `.env` files in production

## Support

For issues with:
- **Vercel deployment:** Check [Vercel Documentation](https://vercel.com/docs)
- **OpenRouter API:** Check [OpenRouter Documentation](https://openrouter.ai/docs)
- **Google Analytics:** Check [GA4 Documentation](https://support.google.com/analytics/answer/9304153)

