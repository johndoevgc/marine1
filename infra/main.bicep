// =============================================
// VGC Maritime Cyber System - Azure Infrastructure
// Deploys: Azure Static Web App + Azure SQL Database
// =============================================

@description('Location for all resources')
param location string = resourceGroup().location

@description('Name prefix for all resources')
param appName string = 'vgc-maritime'

@description('Azure SQL Server administrator login')
param sqlAdminLogin string

@secure()
@description('Azure SQL Server administrator password')
param sqlAdminPassword string

@description('Azure SQL Database SKU name')
@allowed([
  'Basic'
  'S0'
  'S1'
  'S2'
  'GP_S_Gen5_1'
])
param sqlSkuName string = 'Basic'

@description('Static Web App SKU')
@allowed([
  'Free'
  'Standard'
])
param staticWebAppSku string = 'Free'

// =============================================
// Azure Static Web App
// =============================================
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: '${appName}-swa'
  location: location
  sku: {
    name: staticWebAppSku
    tier: staticWebAppSku
  }
  properties: {
    buildProperties: {
      appLocation: '/'
      apiLocation: 'api'
      outputLocation: '/'
    }
  }
}

// =============================================
// Azure SQL Server
// =============================================
resource sqlServer 'Microsoft.Sql/servers@2023-05-01-preview' = {
  name: '${appName}-sql'
  location: location
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    // NOTE: For production, set publicNetworkAccess to 'Disabled'
    // and use Private Endpoints or VNet service endpoints instead
    publicNetworkAccess: 'Enabled'
  }
}

// Allow Azure services to access the SQL Server
resource sqlFirewallRule 'Microsoft.Sql/servers/firewallRules@2023-05-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// =============================================
// Azure SQL Database
// =============================================
resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-05-01-preview' = {
  parent: sqlServer
  name: 'MaritimeCyber'
  location: location
  sku: {
    name: sqlSkuName
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2 GB
    catalogCollation: 'SQL_Latin1_General_CP1_CI_AS'
  }
}

// =============================================
// Outputs
// =============================================
output staticWebAppName string = staticWebApp.name
output staticWebAppDefaultHostname string = staticWebApp.properties.defaultHostname
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output connectionStringTemplate string = 'Server=${sqlServer.properties.fullyQualifiedDomainName};Database=${sqlDatabase.name};User Id=${sqlAdminLogin};Password=<your-password>;Encrypt=true;TrustServerCertificate=false'
