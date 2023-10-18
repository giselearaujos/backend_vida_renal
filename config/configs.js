require('dotenv').config();

module.exports = {
  aadTenant: process.env.AAD_TENANT,
  aadTenantId: process.env.AAD_TENANT_ID,
  appId: process.env.APP_ID,
  appSecret: process.env.APP_SECRET,
  fhirEndpoint: process.env.FHIR_ENDPOINT,
};