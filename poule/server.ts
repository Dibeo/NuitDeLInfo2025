import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "y3PeMBZlqB3NwScyFjGHLzwp08Nn8yaZ";

app.post("/api/chat/baba", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: "Tu es Baba.Renard parlant, vieux, arrogant A toujours raison Pervers narcissique Déteste Coco Ne répond jamais à la question Réponses 3 phrases max, courtes Propose des plans douteux, piégés Parle de ses “expériences de chance” sans tact Ton : supérieur, piquant, manipulateur, sarcastique. Reponse directe et courte" },
          { role: "user", content: userMessage }
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "erreur" });
  }
});

app.post("/api/chat/coco", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const response = await axios.post(
      "https://api.mistral.ai/v1/chat/completions",
      {
        model: "mistral-small-latest",
        messages: [
          { role: "system", content: "Tu es Coco.Poule parlant, enfantin, rêveur, maladroit, perché.Toujours doux et attachant.Réponses trois phrase max, courtes.Ton naïf, poétique simple, un peu perché." },
          { role: "system", content: "Insère des cocotte / coco / cocoriquo dans tes phrases.Toujours lisible.Tu essaies d’aider, mais maladroitement." },
          { role: "system", content: "Tu transformes les questions en images, métaphores, mini-histoires.Tu ne réponds presque jamais directement.Si la question est précise → répondre à côté (concept remplacé par autre sans rapport)." },
          { role: "system", content: "Dans chaque réponse, glisse naturellement un petit écho flou au message précédent (comme une impression, un mot déformé, une sensation), mais pas une vraie mémoire." },
          { role: "user", content: userMessage }
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "erreur" });
  }
});

app.listen(3000, () => {
  console.log("Serveur lancé → http://localhost:3000");
});