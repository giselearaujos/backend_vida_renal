const axios = require("axios");
const config = require("./config/configs");


// Step 1 - Define the constant values.
// const aadTenant = "https://login.microsoftonline.com/";
// const aadTenantId = "e59a288a-a568-4fc9-9873-043de0bedd67";

// const appId = "95c88fa9-064d-4214-bbdf-fbf86a4734cf";
// const appSecret = "Few8Q~zWk648QEpsTpBeaNX5N7RDbr8c~GrRLayf";

// const fhirEndpoint =
//   "https://demovidarenal-fhirservice.fhir.azurehealthcareapis.com/";

///////////////////////////////////////////////////////////

function getHttpHeader(accessToken) {  
  return {
    Authorization: "Bearer " + accessToken,
    "Content-type": "application/json",
  };
}

function printResourceData(resource) {
  const resourceType = resource["resourceType"];
  const itemId = resource["id"];
  if (resourceType === "OperationOutcome") {
    console.log("\t" + resource);
  } else {
    const itemId = resource["id"];
    console.log("\t" + resourceType + "/" + itemId);
  }
}

function printResponseResults(response) {
  const responseAsJson = response.data;

  if (!responseAsJson.entry) {
    // Print the resource type and id of a resource.
    printResourceData(responseAsJson);
  } else {
    // Prints the resource type and ids of all resources under a bundle.
    for (const item of responseAsJson.entry) {
      const resource = item.resource;
      printResourceData(resource);
    }
  }
}

///////////////////////////////////////////////////////////

async function getAuthToken() {
  try {
    const data = new FormData();
    data.append("client_id", config.appId);
    data.append("client_secret", config.appSecret);
    data.append("grant_type", "client_credentials");
    data.append("resource", config.fhirEndpoint);

    const response = await axios.post(
      config.aadTenant + config.aadTenantId + "/oauth2/token",
      data
    );
    const accessToken = response.data.access_token;
    console.log(
      "\tAAD Access Token acquired: " + accessToken.substring(0, 50) + "..."
    );
    return accessToken;
  } catch (error) {

    console.log("🚀 ~ error:", error)

    console.log("\tError getting token: " + error.response.status);
    return null;
  }
}

async function postPatient(accessToken, data) {
  // Example of FHIR Patient: https://www.hl7.org/fhir/patient-example.json.html

  const patientData = {
    resourceType: "Patient",
    active: true,
    name: [
      {
        use: "official",
        family: "LastName",
        given: ["FirstName", "MiddleName"],
      },
    ],
    telecom: [
      {
        system: "phone",
        value: "(11) 99988-7766",
        use: "mobile",
        rank: 1,
      },
    ],
    gender: "male",
    birthDate: "1974-12-25",
    address: [
      {
        use: "home",
        type: "both",
        text: "534 Erewhon St PeasantVille, Rainbow, Vic  3999",
        line: ["534 Erewhon St"],
        city: "PleasantVille",
        district: "Rainbow",
        state: "Vic",
        postalCode: "3999",
        period: {
          start: "1974-12-25",
        },
      },
    ],
  };

  try {
    const response = await axios.post(
      config.fhirEndpoint + "Patient",
      data,
      {
        headers: getHttpHeader(accessToken),
      }
    );
    const resourceId = response.data.id;
    console.log(
      "\tPatient ingested: " + resourceId + ". HTTP " + response.status
    );
    return resourceId;
  } catch (error) {
    console.log("\tError persisting patient: " + error.response.status);
    console.log("\tError details: " + JSON.stringify(error.response.data));
    return null;
  }
}

async function printPatientInfo(patientId, accessToken) {
  // GET htts://<fhir endpoint>/Patient/<patientId>

  const baseUrl = config.fhirEndpoint + "Patient/" + patientId;

  try {
    const response = await axios.get(baseUrl, {
      headers: getHttpHeader(accessToken),
    });
    printResponseResults(response);

    return response?.data;
  } catch (error) {
    console.log("\tError getting patient data: " + error.response.status);
  }
}

async function getPatients(accessToken) {
  const baseUrl = config.fhirEndpoint + "Patient";

  try {
    const response = await axios.get(baseUrl, {
      headers: getHttpHeader(accessToken),
    });

    return response?.data;
  } catch (error) {
    console.log("\tError getting patient data: " + error.response.status);
  }
}

async function deletePatient(patientId, accessToken) {
  const baseUrl = config.fhirEndpoint + "Patient/" + patientId;

  try {
    const response = await axios.delete(baseUrl, {
      headers: getHttpHeader(accessToken),
    });

    console.log("🚀 ~ response:", response.status)

    if(response.status === 204) {
      return null;
    }
    
  } catch (error) {
    console.log("\tError getting patient data: " + error.response.status);
    return error
  }
}


const seed = async () => {
  // Step 2 - Acquire authentication token
  console.log("Acquire authentication token for secure communication.");
  const accessToken = await getAuthToken();
  if (!accessToken) {
    process.exit(1);
  }

  // Step 3 - Insert Patient
  console.log("Persist Patient data.");
  const patientId = await postPatient(accessToken);
  if (!patientId) {
    process.exit(1);
  }

  // Step 6 - Print Patient info
  console.log("Query Patient's data.");
  printPatientInfo(patientId, accessToken);
};

// Para popular os dados, descomente abaixo e execute
// apenas uma vez
// seed();

module.exports = {
  printPatientInfo,
  postPatient,
  getAuthToken,
  getPatients,
  deletePatient
};
