# Social and Ads Account Setup Guide

This guide explains how to create platform accounts, enable API access, and manage daily posting and ads for Washoku Plus.

## Before You Start

- Use a dedicated business email for platform accounts.
- Enable two-factor authentication on all accounts.
- Store API credentials in a secure secret manager.
- Keep publishing in dry-run mode until each platform is approved.

## 1) YouTube Shorts (Google)

### Create and configure account

1. Google Account: https://accounts.google.com/signup
2. YouTube channel setup: https://www.youtube.com/account
3. YouTube Studio: https://studio.youtube.com/

### API and developer setup

1. Google Cloud Console: https://console.cloud.google.com/
2. Create/select project.
3. Enable YouTube Data API v3:
   https://console.cloud.google.com/apis/library/youtube.googleapis.com
4. Configure OAuth consent screen:
   https://console.cloud.google.com/apis/credentials/consent
5. Create OAuth client credentials:
   https://console.cloud.google.com/apis/credentials

### Daily management

- Content management: https://studio.youtube.com/
- Analytics: https://studio.youtube.com/channel/UC/analytics
- Copyright checks: https://studio.youtube.com/channel/UC/copyright

## 2) Instagram Reels (Meta)

### Create and configure account

1. Instagram account: https://www.instagram.com/accounts/emailsignup/
2. Convert to Professional account (Business or Creator) in Instagram app settings.
3. Create Facebook Page (required): https://www.facebook.com/pages/create
4. Connect Instagram to Facebook Page in Meta Business Suite.

### API and developer setup

1. Meta for Developers: https://developers.facebook.com/
2. Create app: https://developers.facebook.com/apps/
3. Add products: Instagram Graph API and Facebook Login.
4. Graph API Explorer: https://developers.facebook.com/tools/explorer/
5. Business Manager: https://business.facebook.com/

### Daily management

- Content scheduling and inbox: https://business.facebook.com/latest/home
- Insights and performance: https://business.facebook.com/latest/insights
- Permissions and users: https://business.facebook.com/settings

## 3) TikTok Short Video Publishing

### Create and configure account

1. TikTok account: https://www.tiktok.com/signup
2. TikTok Business Center: https://business.tiktok.com/

### API and developer setup

1. TikTok Developers portal: https://developers.tiktok.com/
2. Create app and request content posting scopes.
3. Complete app review for content posting permissions.

### Daily management

- Organic account management: https://www.tiktok.com/
- Business and assets: https://business.tiktok.com/
- API app status: https://developers.tiktok.com/

## 4) Ads Platforms (Meta and TikTok)

### Meta ads account setup

1. Meta Ads Manager: https://adsmanager.facebook.com/
2. Business settings and access: https://business.facebook.com/settings
3. Pixel and events setup (if used): https://business.facebook.com/events_manager2

### TikTok ads account setup

1. TikTok Ads Manager: https://ads.tiktok.com/
2. Business Center assets and billing: https://business.tiktok.com/

## 5) Credential Mapping for This Repo

Use these files:

- Config template: automation/social/publisher-config.example.json
- Local live config (do not commit): automation/social/publisher-config.json

Map credentials to fields:

- youtube_shorts.oauthClientId / oauthClientSecret / refreshToken
- instagram_reels.accessToken / instagramBusinessAccountId / facebookPageId
- tiktok.accessToken / advertiserOrBusinessId

## 6) Local Operations Commands

Use the workspace script:

```bash
bash ops/startup.sh social-setup
bash ops/startup.sh social-pack 3
bash ops/startup.sh social-queue dry-run
bash ops/startup.sh social-run 3 dry-run
bash ops/startup.sh social-status
```

To manage ForgeWeb from the same entry point:

```bash
bash ops/startup.sh forgeweb status
bash ops/startup.sh forgeweb start
bash ops/startup.sh forgeweb stop
```

## 7) Platform Management Checklist (Daily)

1. Review generated queue artifact from local run or GitHub Actions.
2. Check account alerts in YouTube Studio, Meta Business Suite, and TikTok Business Center.
3. Verify comments/messages moderation queue.
4. Check spend pacing and conversion performance in Ads Manager(s).
5. Pause low performers and scale top creatives by your ad-rule templates.

## 8) Platform Management Checklist (Weekly)

1. Rotate hooks and thumbnails based on retention and CTR.
2. Promote top organic clips into paid tests.
3. Refresh call-to-action copy and App Store angles.
4. Audit account permissions and token expiration windows.
