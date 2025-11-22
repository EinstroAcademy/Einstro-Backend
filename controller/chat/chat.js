const fs = require("fs");
const pdfParse = require("pdf-parse");
const OpenAI = require("openai");
const fetch = require("node-fetch");
const {GoogleGenAI} = require("@google/genai")
const axios = require("axios")
const cheerio = require("cheerio")
const puppeteer = require("puppeteer")
const path = require("path");
const { University } = require("../../schema/subject.schema");
const { Course } = require("../../schema/course.schema");
const mammoth = require("mammoth");
const {sendEmail} = require("../../middleware/sendmail");
const { format } = require("date-fns");
const Setting = require("../../schema/setting.schema");

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


// let pdfText = "";

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

let pdfText = "";
let pdfLoaded = false;

// 📂 Load PDFs and DOCX dynamically
const loadDocs = async () => {
  if (!pdfLoaded) {
    let combinedText = "";

    // Load multiple PDFs
    const pdfFiles = [
      "./einstro_academy_detailed.pdf",
    ];
    for (const file of pdfFiles) {
      const dataBuffer = fs.readFileSync(file);
      const data = await pdfParse(dataBuffer);
      combinedText += "\n\n" + data.text;
    }

    // Load multiple DOCX
    const docxFiles = [
      "./FAQ (2).docx",
      "./FAQs - Study in the UK.docx",
    ];
    for (const file of docxFiles) {
      const result = await mammoth.extractRawText({ path: file });
      combinedText += "\n\n" + result.value;
    }

    pdfText = combinedText;
    pdfLoaded = true;
  }
};

const sessionStore = {};
// const geminiChat = async (req, res) => {
//   try {
//     const { question, sessionId } = req.body;

//     if (!sessionId) {
//       return res.status(400).json({ error: "Missing sessionId" });
//     }

//     // Initialize session if new
//     if (!sessionStore[sessionId]) {
//       sessionStore[sessionId] = { stage: "start", data: {} };
//     }

//     const session = sessionStore[sessionId];

//     function isValidMobile(number) {
//   // Allow 10-digit numbers, optionally with +91 or 0 in front
//   const regex = /^(?:\+91|0)?[6-9]\d{9}$/;
//   return regex.test(number);
// }

// const isValidEmail = (email) => {
//   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   return regex.test(String(email).toLowerCase());
// };

//     // 🪄 Handle data collection steps
//     if (session.stage === "start") {
//       session.stage = "ask_firstname";
//       return res.json({ answer: "Hi,Can I get your first name?" });
//     }

//     if (session.stage === "ask_firstname") {
//       session.data.firstName = question;
//       session.stage = "ask_lastname";
//       return res.json({ answer: "Thanks! What's your last name?" });
//     }

//     if (session.stage === "ask_lastname") {
//       session.data.lastName = question;
//       session.stage = "ask_email";
//       return res.json({ answer: "Great! What's your Email ID?" });
//     }

//      if (session.stage === "ask_email") {
//       if (!isValidEmail(question)) {
//     return res.json({
//       answer: "Hmm… that doesn’t look like a valid Email. Please enter a valid Email ID.",
//     });
//   }
//       session.data.email = question;
//       session.stage = "ask_mobile";
//       return res.json({ answer: "Great! What's your mobile number?" });
//     }

//     if (session.stage === "ask_mobile") {
//       if (!isValidMobile(question)) {
//     return res.json({
//       answer: "Hmm… that doesn’t look like a valid mobile number 📱. Please enter a valid 10-digit number.",
//     });
//   }
//       session.data.mobile = question;
//       session.stage = "complete";

//       // ✅ Save data to DB (Example)
//       // await User.create({
//       //   firstName: session.data.firstName,
//       //   lastName: session.data.lastName,
//       //   mobile: session.data.mobile,
//       // });

//       sendEmail({
//         fullName: session.data.firstName,
//         email: session.data.email,
//         phone: session.data.mobile,
//         date: format(new Date(), 'dd/MM/yyyy')
//       })

//       console.log(session.data)

//       // Clear session if needed
//       delete sessionStore[sessionId];

//       return res.json({ answer: "Thanks! Your details have been saved successfully ✅" });
//     }

//     // 🤖 If no data collection needed, continue your Gemini logic
//     await loadDocs();
//     const websiteData = JSON.parse(fs.readFileSync("websiteData.json", "utf-8"));
//     const siteText = websiteData.map(p => `${p.url}\n${p.text}`).join("\n\n");

//     const universities = await University.find();
//     const universityText = universities.map(u =>
//       `Name: ${u.name}\nCountry: ${u.country}\nLocation: ${u.location}\nRank: ${u.rank}\nStudents: ${u.students}\nIntake Months: ${u.intake_month?.join(", ")}\nEnglish Tests: ${u.englishTests?.join(", ")}\n`
//     ).join("\n\n");

//     const courses = await Course.find().populate('universityId');
//     const courseText = courses.map(c =>
//       `Course: ${c.title}\nUniversity: ${c.universityId.name}\nLevel: ${c.qualification}\nDuration: ${c.duration}\nFee: ${c.fees}\n`
//     ).join("\n\n");

//     const prompt = `
// You are an educational assistant chatbot for Einstro Study Abroad.

// 📚 CONTEXT:
// Below is all the information you are allowed to use. 
// If the answer to the question cannot be found here, respond with:
// "I don't have this information. Please contact admin."

// --- START OF CONTEXT ---
// ${siteText}

// ${universityText}

// ${courseText}
// --- END OF CONTEXT ---

// ⚠️ RULES:
// - Use ONLY the above context to answer.
// - If the answer is not in the context, DO NOT make up or guess.
// - Reply only with information from the context.
// - If not found, say: "I don't have this information. Please contact admin."
// - Do not include general knowledge, assumptions, or external info.

// ❓ User's Question: ${question}
// `;

//     const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//     const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash',
//       contents: [{ role: "user", parts: [{ text: prompt }] }]
//     });

//     let answer = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Contact admin.";
//     if (/^(i (don't|do not) know|sorry|cannot find|not sure|no information|not found|unknown|outside|as an ai|as a language|i don['’]t have)/i.test(answer) || answer.length < 3) {
//       answer = "Contact admin.";
//     }

//     res.json({ answer });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };


// const geminiChat = async (req, res) => {
//   try {
//     const { question, sessionId } = req.body;

//     if (!sessionId) {
//       return res.status(400).json({ error: "Missing sessionId" });
//     }

//     // Initialize session
//     if (!sessionStore[sessionId]) {
//       sessionStore[sessionId] = {
//         stage: "start",
//         data: {},
//         questionsAsked: 0
//       };
//     }

//     const session = sessionStore[sessionId];

//     // Validators
//     function isValidMobile(number) {
//       const regex = /^(?:\+91|0)?[6-9]\d{9}$/;
//       return regex.test(number);
//     }

//     function isValidEmail(email) {
//       const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       return regex.test(String(email).toLowerCase());
//     }

//     // 🧠 Let Gemini handle first few questions before asking details
//     if (session.stage === "start") {
//       session.questionsAsked++;

//       // After 2 or 3 questions, start collecting details
//       if (session.questionsAsked >= 5) {
//         session.stage = "ask_firstname";
//         return res.json({ answer: "Hi! Can I get your first name?" });
//       }

//       // Handle Gemini Q&A until then
//       await loadDocs();
//       const websiteData = JSON.parse(fs.readFileSync("websiteData.json", "utf-8"));
//       const siteText = websiteData.map(p => `${p.url}\n${p.text}`).join("\n\n");

//       const universities = await University.find();
//       const universityText = universities.map(u =>
//         `Name: ${u.name}\nCountry: ${u.country}\nLocation: ${u.location}\nRank: ${u.rank}\nStudents: ${u.students}\nIntake Months: ${u.intake_month?.join(", ")}\nEnglish Tests: ${u.englishTests?.join(", ")}\n`
//       ).join("\n\n");

//       const courses = await Course.find().populate("universityId");
//       const courseText = courses.map(c =>
//         `Course: ${c.title}\nUniversity: ${c.universityId.name}\nLevel: ${c.qualification}\nDuration: ${c.duration}\nFee: ${c.fees}\n`
//       ).join("\n\n");

//       const prompt = `
// You are an educational assistant chatbot for Einstro Study Abroad.

// 📚 CONTEXT:
// Below is all the information you are allowed to use. 
// If the answer to the question cannot be found here, respond with:
// "I don't have this information. Please contact admin."

// --- START OF CONTEXT ---
// ${siteText}

// ${universityText}

// ${courseText}
// --- END OF CONTEXT ---

// ❓ User's Question: ${question}
// `;

//       const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//       const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
//       const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: [{ role: "user", parts: [{ text: prompt }] }]
//       });

//       let answer =
//         response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//         "Contact admin.";
//       if (
//         /^(i (don't|do not) know|sorry|cannot find|not sure|no information|not found|unknown|outside|as an ai|as a language|i don['’]t have)/i.test(answer) ||
//         answer.length < 3
//       ) {
//         answer = "Contact admin.";
//       }

//       return res.json({ answer });
//     }

//     // 🪄 Data Collection Flow
//     if (session.stage === "ask_firstname") {
//       session.data.firstName = question;
//       session.stage = "ask_lastname";
//       return res.json({ answer: "Thanks! What's your last name?" });
//     }

//     if (session.stage === "ask_lastname") {
//       session.data.lastName = question;
//       session.stage = "ask_email";
//       return res.json({ answer: "Great! What's your Email ID?" });
//     }

//     if (session.stage === "ask_email") {
//       if (!isValidEmail(question)) {
//         return res.json({
//           answer: "Hmm… that doesn’t look like a valid Email. Please enter a valid Email ID."
//         });
//       }
//       session.data.email = question;
//       session.stage = "ask_mobile";
//       return res.json({ answer: "Perfect! What's your mobile number?" });
//     }

//     if (session.stage === "ask_mobile") {
//       if (!isValidMobile(question)) {
//         return res.json({
//           answer:
//             "Hmm… that doesn’t look like a valid mobile number 📱. Please enter a valid 10-digit number."
//         });
//       }

//       session.data.mobile = question;
//       session.stage = "complete";

//       sendEmail({
//         fullName: `${session.data.firstName} ${session.data.lastName}`,
//         email: session.data.email,
//         phone: session.data.mobile,
//         date: format(new Date(), "dd/MM/yyyy")
//       });

//       console.log("Saved user data:", session.data);
//       return res.json({
//         answer:
//           "Thanks! Your details have been saved successfully ✅. How else can I help you today?"
//       });
//     }

//     // 🧩 Once details are collected, continue Gemini logic forever
//     if (session.stage === "complete") {
//       await loadDocs();
//       const websiteData = JSON.parse(fs.readFileSync("websiteData.json", "utf-8"));
//       const siteText = websiteData.map(p => `${p.url}\n${p.text}`).join("\n\n");

//       const universities = await University.find();
//       const universityText = universities.map(u =>
//         `Name: ${u.name}\nCountry: ${u.country}\nLocation: ${u.location}\nRank: ${u.rank}\nStudents: ${u.students}\nIntake Months: ${u.intake_month?.join(", ")}\nEnglish Tests: ${u.englishTests?.join(", ")}\n`
//       ).join("\n\n");

//       const courses = await Course.find().populate("universityId");
//       const courseText = courses.map(c =>
//         `Course: ${c.title}\nUniversity: ${c.universityId.name}\nLevel: ${c.qualification}\nDuration: ${c.duration}\nFee: ${c.fees}\n`
//       ).join("\n\n");

//       const prompt = `
// You are an educational assistant chatbot for Einstro Study Abroad.

// 📚 CONTEXT:
// ${siteText}

// ${universityText}

// ${courseText}

// ❓ User's Question: ${question}
// `;

//       const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
//       const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
//       const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: [{ role: "user", parts: [{ text: prompt }] }]
//       });

//       let answer =
//         response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//         "Contact admin.";
//       if (
//         /^(i (don't|do not) know|sorry|cannot find|not sure|no information|not found|unknown|outside|as an ai|as a language|i don['’]t have)/i.test(answer) ||
//         answer.length < 3
//       ) {
//         answer = "Contact admin.";
//       }

//       return res.json({ answer });
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Something went wrong" });
//   }
// };


const geminiChat = async (req, res) => {
  try {
    const { question, sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "Missing sessionId" });
    }

    // Initialize session if new
    if (!sessionStore[sessionId]) {
      sessionStore[sessionId] = {
        stage: "start",
        data: {},
        questionsAsked: 0,
        pendingQuestion: null
      };
    }

    const session = sessionStore[sessionId];

    // --- Validators ---
    function isValidMobile(number) {
      const regex = /^(?:\+91|0)?[6-9]\d{9}$/;
      return regex.test(number);
    }

    function isValidEmail(email) {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(String(email).toLowerCase());
    }

    // --- Main flow ---
    if (session.stage === "start") {
      session.questionsAsked++;

      // If user has already given details, continue Gemini logic
      if (session.stage === "complete") {
        return handleGemini(question, res);
      }

      // After 3rd question, start collecting details
      if (session.questionsAsked >= 3 && !session.data.email) {
        session.pendingQuestion = question; // store last user question
        session.stage = "ask_firstname";
        return res.json({ answer: "Hi! Can I get your first name?" });
      }

      // Otherwise, continue normal Gemini flow
      return handleGemini(question, res);
    }

    // 🪄 Data collection flow
    if (session.stage === "ask_firstname") {
      session.data.firstName = question;
      session.stage = "ask_lastname";
      return res.json({ answer: "Thanks! What's your last name?" });
    }

    if (session.stage === "ask_lastname") {
      session.data.lastName = question;
      session.stage = "ask_email";
      return res.json({ answer: "Great! What's your Email ID?" });
    }

    if (session.stage === "ask_email") {
      if (!isValidEmail(question)) {
        return res.json({
          answer: "Hmm… that doesn’t look like a valid Email. Please enter a valid Email ID."
        });
      }
      session.data.email = question;
      session.stage = "ask_mobile";
      return res.json({ answer: "Perfect! What's your mobile number?" });
    }

    if (session.stage === "ask_mobile") {
      if (!isValidMobile(question)) {
        return res.json({
          answer:
            "Hmm… that doesn’t look like a valid mobile number 📱. Please enter a valid 10-digit number."
        });
      }

      session.data.mobile = question;
      session.stage = "complete";

      // Save or email data
      sendEmail({
        fullName: `${session.data.firstName} ${session.data.lastName}`,
        email: session.data.email,
        phone: session.data.mobile,
        date: format(new Date(), "dd/MM/yyyy")
      });

      console.log("Saved user data:", session.data);

      // Resume pending question if any
      const savedQuestion = session.pendingQuestion;
      session.pendingQuestion = null;

      if (savedQuestion) {
        const answer = await generateGeminiAnswer(savedQuestion);
        return res.json({
          answer: `Thanks! Your details have been saved successfully ✅\n\nNow, about your earlier question:\n${answer}`
        });
      }

      // if no pending question
      return res.json({
        answer: "Thanks! Your details have been saved successfully ✅. How else can I help you today?"
      });
    }

    // Once complete, answer questions directly
    if (session.stage === "complete") {
      return handleGemini(question, res);
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// ----------------------------------------------------
// Helper: Handles Gemini Q&A
// ----------------------------------------------------
async function handleGemini(question, res) {
  const answer = await generateGeminiAnswer(question);
  return res.json({ answer });
}

// ----------------------------------------------------
// Helper: Generates Gemini Answer
// ----------------------------------------------------
async function generateGeminiAnswer(question) {
  await loadDocs();
  const websiteData = JSON.parse(fs.readFileSync("websiteData.json", "utf-8"));
  const siteText = websiteData.map(p => `${p.url}\n${p.text}`).join("\n\n");

  const universities = await University.find();
  const universityText = universities.map(u =>
    `Name: ${u.name}\nCountry: ${u.country}\nLocation: ${u.location}\nRank: ${u.rank}\nStudents: ${u.students}\nIntake Months: ${u.intake_month?.join(", ")}\nEnglish Tests: ${u.englishTests?.join(", ")}\n`
  ).join("\n\n");

  const courses = await Course.find().populate("universityId");
  const courseText = courses.map(c =>
    `Course: ${c.title}\nUniversity: ${c.universityId.name}\nLevel: ${c.qualification}\nDuration: ${c.duration}\nFee: ${c.fees}\n`
  ).join("\n\n");

  const geminiSetting = await Setting.findOne({ settingId: "gemini-details" });
  const geminiExtra = geminiSetting?.content || "";


  const prompt = `
You are an educational assistant chatbot for Einstro Study Abroad.

📚 CONTEXT:
Below is all the information you are allowed to use. 
If the answer to the question cannot be found here, respond with:
"I don't have this information. Please contact admin."

--- START OF CONTEXT ---
${siteText}

${universityText}

${courseText}

${geminiExtra}
--- END OF CONTEXT ---

❓ User's Question: ${question}
`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });

  let answer =
    response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
    "Contact admin";

  if (
    /^(i (don't|do not) know|sorry|cannot find|not sure|no information|not found|unknown|outside|as an ai|as a language|i don['’]t have)/i.test(answer) ||
    answer.length < 3
  ) {
    answer = "Contact admin";
  }

  return answer;
}




module.exports = { chat ,kiloChat,geminiChat,crawlSite};
