import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import cors from 'cors';

dotenv.config();

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

const client = new OpenAI({
  apiKey: process.env.API_KEY,
});

app.post("/", (req, res) => {
  res.send("API is working!!")
})

app.post("/chat", async (req, res) => {
  try {
    const message = req.body.message;
    const role = req.body.role;
    console.log(message)
    console.log(role)

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: role,
          content: message,
        },
      ],
    });
    res.json({
       "content": completion.choices[0].message.content,
       "role": completion.choices[0].message.role
      });
      console.log(completion.choices[0].message.role)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
