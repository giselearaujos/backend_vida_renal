const express = require("express");
const cors = require("cors");
const {
  getAuthToken,
  postPatient,
  printPatientInfo,
  getPatients,
  deletePatient
} = require("./sample");

const app = express();
const port = 3004 || process.env.PORT; 


app.use(cors());

app.use(express.json());

app.get("/patients", async (req, res) => {
  const accessToken = await getAuthToken();
  const data = await getPatients(accessToken);

  res.json(data?.entry || []);
});

app.get("/patients/:id", async (req, res) => {
  const patientId = req.params.id;
  const accessToken = await getAuthToken();
  const data = await printPatientInfo(patientId, accessToken);

  res.json(data);
});

app.post("/patients", async (req, res) => {
  const accessToken = await getAuthToken();
  const patientId = await postPatient(accessToken, req.body);

  if(!patientId) {
    return res.status(400).json({ message: "Erro ao criar paciente" });
  }

  res.json({ patientId });
});

app.delete("/patients/:id", async (req, res) => {
  const patientId = req.params.id;
  const accessToken = await getAuthToken();
  const data = await deletePatient(patientId, accessToken);

  if(data !== null) {
    return res.status(400).json({ message: "Erro ao deletar paciente" });
  }

  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Servidor Express rodando na porta ${port}`);
});
