const fs = require("fs");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const fetch = require("node-fetch");
const {GoogleGenAI} = require("@google/genai")
const axios = require("axios")
const cheerio = require("cheerio")
const puppeteer = require("puppeteer")
const path = require("path")

const urls = [
  "https://studytez.com/", 
  "https://studytez.com/course/list",
  "https://studytez.com/about",
  "https://studytez.com/blog",
 " https://www.studytez.com/destination/UK",
 "https://www.studytez.com/destination/Ireland",
 "https://www.studytez.com/destination/Australia",
 "http://localhost:4000/get/all/list/course",
 "http://localhost:4000/get/all/list/university"
];


let pdfText = "";

async function scrapePage(url, browser) {
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    // Wait a little if your React app takes time
   await new Promise(resolve => setTimeout(resolve, 3000));

    // Extract visible text
    const text = await page.evaluate(() => {
      return document.body.innerText.replace(/\s+/g, " ").trim();
    });

    await page.close();
    return { url, text };
  } catch (err) {
    console.error("❌ Error scraping", url, err.message);
    return { url, text: "" };
  }
}

async function crawlSite() {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  for (const url of urls) {
    const data = await scrapePage(url, browser);
    results.push(data);
  }

  await browser.close();
  fs.writeFileSync("websiteData.json", JSON.stringify(results, null, 2), "utf-8");
  console.log("✅ Website data saved to websiteData.json");
}



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
        // 1️⃣ Read site text
    const websiteData = JSON.parse(fs.readFileSync("websiteData.json", "utf-8"));
    const siteText = websiteData.map(p => `${p.url}\n${p.text}`).join("\n\n");

    // 2️⃣ Fetch University List
    const uniResp = await axios.get("http://localhost:4000/get/all/list/university");
    const universities = uniResp.data?.response || [];
    const universityText = universities.map(u => 
      `Name: ${u.name}\nCountry: ${u.country}\nLocation: ${u.location}\nRank: ${u.rank}\nStudents: ${u.students}\nIntake Months: ${u.intake_month?.join(", ")}\nEnglish Tests: ${u.englishTests?.join(", ")}\n`
    ).join("\n\n");

    // 3️⃣ Fetch Course List
    const courseResp = await axios.get("http://localhost:4000/get/all/list/course");
    const courses = courseResp.data?.response || [];
    const courseText = courses.map(c =>
      `Course: ${c.name}\nUniversity: ${c.university}\nLevel: ${c.level}\nDuration: ${c.duration}\nFee: ${c.fee}\n`
    ).join("\n\n");

    // 4️⃣ Build Prompt
    const prompt = `
You are an expert educational assistant. Use ONLY the content below to answer the user's question.
Do NOT invent anything. If the answer is not available, reply ONLY with "Contact admin".

Instructions:
- Provide complete university details if asked: name, location, country, rank, number of students, intake months.
- Include fee structures in a table if available.
- Include courses offered, English requirements, scholarships, and any special notes.
- Answer in a **well-formatted single paragraph** OR **markdown table** if relevant.
- Make the answer **ready to read aloud for text-to-speech**.
- Do not mention the source JSON or the URL.

Website Content:
${siteText.substring(0, 8000)}

University Information (summarized as one paragraph):
${universityText}

Course Information (summarized as one paragraph):
${courseText}

User's Question: ${question}
Answer strictly in a single coherent paragraph using the content above or say 'Contact admin':
`;
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

module.exports = { chat ,kiloChat,geminiChat,crawlSite};
