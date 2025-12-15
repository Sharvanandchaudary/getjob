# n8n Workflow Templates for Job Tracker

This directory contains n8n workflow templates that automate various tasks in the Job Tracker system.

## Workflows

### 1. Daily Email Reports Workflow
**File:** `daily-reports-workflow.json`

**Trigger:** Cron - Daily at 8:00 AM

**Steps:**
1. HTTP Request to `/api/admin/users` - Get all users
2. For each user:
   - HTTP Request to `/api/applications?userId={id}` - Get applications
   - HTTP Request to `/api/ai/job-matches?userId={id}` - Get recommendations
   - Send Email with personalized report
3. Log completion

### 2. Job Scraping Workflow
**File:** `job-scraping-workflow.json`

**Trigger:** Cron - Every 6 hours

**Steps:**
1. HTTP Request to multiple job board APIs
   - Indeed API
   - Adzuna API
   - LinkedIn (if available)
2. Parse responses
3. For each job:
   - HTTP POST to `/api/jobs` - Create job record
4. Trigger job matching for all users

### 3. Google Sheets Sync Workflow
**File:** `sheets-sync-workflow.json`

**Trigger:** Cron - Every hour

**Steps:**
1. HTTP Request to `/api/admin/applications` - Get all applications
2. HTTP Request to `/api/admin/users` - Get all users
3. Google Sheets nodes:
   - Clear existing data
   - Write new data to "Users" sheet
   - Write new data to "Applications" sheet
   - Write new data to "Analytics" sheet
4. Send confirmation email to admin

### 4. Status Change Notification Workflow
**File:** `status-notification-workflow.json`

**Trigger:** Webhook - Triggered by backend on status change

**Steps:**
1. Receive webhook with application data
2. Get user details
3. Send email notification
4. Send SMS (optional - Twilio)
5. Log notification

## Setup Instructions

### 1. Import Workflows to n8n

1. Access your n8n instance (https://your-n8n-instance.com)
2. Click "Workflows" > "Import from File"
3. Upload each JSON file from this directory
4. Activate the workflow

### 2. Configure Credentials

Create the following credentials in n8n:

#### HTTP Auth
- Name: `Job Tracker API`
- Type: Header Auth
- Header Name: `Authorization`
- Header Value: `Bearer YOUR_API_TOKEN`

#### Gmail/SMTP
- Name: `Job Tracker Email`
- Type: Gmail OAuth2 or SMTP
- Configure with your email credentials

#### Google Sheets
- Name: `Job Tracker Sheets`
- Type: Google Sheets API
- OAuth2 or Service Account
- Grant access to your spreadsheet

### 3. Configure Webhook URLs

In your backend `.env` file:

```env
N8N_WEBHOOK_DAILY_REPORT=https://your-n8n.com/webhook/daily-report
N8N_WEBHOOK_JOB_SCRAPE=https://your-n8n.com/webhook/job-scrape
N8N_WEBHOOK_SHEET_SYNC=https://your-n8n.com/webhook/sheet-sync
N8N_WEBHOOK_STATUS_CHANGE=https://your-n8n.com/webhook/status-change
```

### 4. Test Workflows

1. Open each workflow in n8n
2. Click "Execute Workflow" button
3. Verify outputs in the execution log
4. Check that emails are sent correctly
5. Verify Google Sheets are updated

## Workflow Details

### Daily Reports Workflow Structure

```json
{
  "name": "Daily Email Reports",
  "nodes": [
    {
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "parameters": {
        "rule": {
          "interval": [
            {
              "field": "cronExpression",
              "expression": "0 8 * * *"
            }
          ]
        }
      }
    },
    {
      "name": "Get Users",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "{{$env.API_URL}}/api/admin/users",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth"
      }
    },
    {
      "name": "Loop Users",
      "type": "n8n-nodes-base.splitInBatches"
    },
    {
      "name": "Get Applications",
      "type": "n8n-nodes-base.httpRequest"
    },
    {
      "name": "Send Email",
      "type": "n8n-nodes-base.emailSend"
    }
  ]
}
```

## Alternative: Use Backend Cron Jobs

If you prefer not to use n8n, the backend already has built-in cron jobs for:
- Daily reports
- Google Sheets sync
- Job scraping

Simply ensure your backend server is running and cron jobs will execute automatically.

## Monitoring

Monitor workflow executions in n8n:
1. Go to "Executions" tab
2. View success/failure status
3. Check execution logs for errors
4. Set up error notifications

## Custom Workflows

You can create additional workflows for:
- Weekly summary reports
- Application reminders
- Interview scheduling
- Offer letter generation
- Performance analytics

## Support

For n8n workflow issues:
- n8n Documentation: https://docs.n8n.io
- n8n Community: https://community.n8n.io

For Job Tracker integration:
- Check backend logs
- Verify API endpoints
- Test webhook URLs
