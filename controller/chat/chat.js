const fs = require("fs");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const fetch = require("node-fetch");
const {GoogleGenAI} = require("@google/genai")




let pdfText = "";



const chat = async (req, res) => {
    try {
        const { question } = req.body;

        const loadPDF = async () => {
  const dataBuffer = fs.readFileSync("./einstro_academy_detailed.pdf");
  const data = await pdfParse(dataBuffer);
  pdfText = data.text;
};

// Call once when the app starts
loadPDF();

        const openai = new OpenAI({
            apiKey: process.env.OpenAPI_key,
        });

        const prompt = `
    You are a helpful assistant. Answer the user's question using ONLY the following PDF content:

    ${pdfText.substring(0, 8000)}

    Question: ${question}
    Answer:
    `;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });

        const answer = completion.choices[0].message.content;
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

const kiloChat =async(req,res)=>{
    const { question } = req.body;

  try {
      const response = await fetch("https://api.kilocodexyz.com/chat", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${process.env.KILO_CODE_API_KEY}`,
              "X-Kilo-Code-Version": "2025-01-01" // ✅ use the latest version date
          },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-preview-05-20",
        messages: [{ role: "user", content: question }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content ?? "No answer returned";

    res.json({ answer });

  } catch (error) {
    console.error("Error calling Kilo Code API:", error);
    res.status(500).json({ error: error.message });
  }
}

let pdfLoaded = false;
const loadPDF = async () => {
    if (!pdfLoaded) {
        const dataBuffer = fs.readFileSync("./einstro_academy_detailed.pdf");
        const data = await pdfParse(dataBuffer);
        pdfText = data.text;
        pdfLoaded = true;
    }
};

const geminiChat = async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Missing question" });
        }
        await loadPDF();
        const prompt = `You are a helpful assistant. The following is content from a PDF document. Use ONLY this content to answer the user's question. If you cannot find the answer in the PDF content, reply ONLY with: Contact admin.\n\nPDF Content:\n${pdfText.substring(0, 8000)}\n\nUser's Question: ${question}\nAnswer strictly from the PDF or say 'Contact admin':`;
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });
        let answer;
        if (response && response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
            answer = response.candidates[0].content.parts[0].text.trim();
        } else {
            answer = "Contact admin.";
        }
        // Post-process answer: if answer seems generic/unknown, force "Contact admin."
        if (/^(i (don't|do not) know|sorry|cannot find|not sure|no information|not found|unknown|outside|as an ai|as a language|i don['’]t have)/i.test(answer) || answer.length < 3) {
            answer = "Contact admin.";
        }
        res.json({ answer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = { chat ,kiloChat,geminiChat};
