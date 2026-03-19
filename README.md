# VGC Maritime Cyber System

Maritime Cybersecurity Operations Center Dashboard — a real-time vessel tracking, security analytics, and compliance monitoring platform.

## Architecture

```
┌─────────────────────────────────┐
│   Azure Static Web App          │
│   ┌───────────┐ ┌─────────────┐ │
│   │ Frontend   │ │ Azure       │ │       ┌──────────────┐
│   │ (HTML/JS)  │ │ Functions   │ │──────▶│  Azure SQL   │
│   │ index.html │ │ (Node.js)  │ │       │  Database    │
│   └───────────┘ └─────────────┘ │       └──────────────┘
└─────────────────────────────────┘
```

- **Frontend**: Single-page HTML application with Leaflet maps, Chart.js analytics, and compliance tracking
- **API**: Azure Functions (Node.js) integrated into the Static Web App
- **Database**: Azure SQL Database storing vessels, compliance items, threat analytics, and security scores

## Prerequisites

- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Azure Functions Core Tools v4](https://docs.microsoft.com/en-us/azure/azure-functions/functions-run-tools)
- [Node.js 18+](https://nodejs.org/)
- An Azure subscription

## Quick Start — Local Development

1. **Install API dependencies**:
   ```bash
   cd api
   npm install
   ```

2. **Configure local database connection** in `api/local.settings.json`:
   ```json
   {
     "Values": {
       "SQL_CONNECTION_STRING": "Server=localhost;Database=MaritimeCyber;User Id=sa;Password=YourPassword;TrustServerCertificate=true"
     }
   }
   ```

3. **Run the database schema and seed data**:
   ```bash
   sqlcmd -S localhost -d MaritimeCyber -i sql/schema.sql
   sqlcmd -S localhost -d MaritimeCyber -i sql/seed.sql
   ```

4. **Start the Azure Functions API locally**:
   ```bash
   cd api
   func start
   ```

5. **Serve the frontend** (using any static server):
   ```bash
   npx swa start . --api-location api
   ```

## Deploy to Azure

### Step 1: Deploy Infrastructure

```bash
az login
az group create --name vgc-maritime-rg --location eastus

az deployment group create \
  --resource-group vgc-maritime-rg \
  --template-file infra/main.bicep \
  --parameters sqlAdminLogin=sqladmin sqlAdminPassword='<YourSecurePassword>'
```

### Step 2: Initialize the Database

After deployment, connect to the Azure SQL database and run the schema and seed scripts:

```bash
sqlcmd -S vgc-maritime-sql.database.windows.net -d MaritimeCyber \
  -U sqladmin -P '<YourSecurePassword>' \
  -i sql/schema.sql

sqlcmd -S vgc-maritime-sql.database.windows.net -d MaritimeCyber \
  -U sqladmin -P '<YourSecurePassword>' \
  -i sql/seed.sql
```

### Step 3: Configure the Static Web App

1. Get the Static Web App deployment token:
   ```bash
   az staticwebapp secrets list --name vgc-maritime-swa --resource-group vgc-maritime-rg
   ```

2. Add the token as a GitHub repository secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`.

3. Configure the SQL connection string in the Static Web App:
   ```bash
   az staticwebapp appsettings set \
     --name vgc-maritime-swa \
     --resource-group vgc-maritime-rg \
     --setting-names \
       SQL_CONNECTION_STRING="Server=vgc-maritime-sql.database.windows.net;Database=MaritimeCyber;User Id=sqladmin;Password=<YourSecurePassword>;Encrypt=true"
   ```

### Step 4: Deploy via CI/CD

Push to the `main` branch. The GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`) will automatically build and deploy the application.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vessels` | Get all monitored vessels |
| GET | `/api/compliance` | Get compliance checklist (grouped by category) |
| PUT | `/api/compliance/{id}` | Update a compliance item status |
| GET | `/api/analytics` | Get threat distribution and security score |

## Project Structure

```
├── index.html                          # Frontend SPA
├── staticwebapp.config.json            # Azure Static Web App config
├── api/                                # Azure Functions API
│   ├── host.json                       # Functions host configuration
│   ├── package.json                    # Node.js dependencies
│   ├── shared/db.js                    # Database connection helper
│   ├── vessels/                        # GET /api/vessels
│   ├── compliance/                     # GET/PUT /api/compliance
│   └── analytics/                      # GET /api/analytics
├── sql/                                # Database scripts
│   ├── schema.sql                      # Table definitions
│   └── seed.sql                        # Initial data
├── infra/                              # Infrastructure as Code
│   ├── main.bicep                      # Azure resources (SWA + SQL)
│   └── main.parameters.json            # Deployment parameters
└── .github/workflows/
    └── azure-static-web-apps.yml       # CI/CD pipeline
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SQL_CONNECTION_STRING` | Azure SQL connection string (set in Static Web App app settings) |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Deployment token (GitHub Actions secret) |
