const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.triageSymptoms = async (req, res) => {
  try {
    const { symptoms, availableDoctors } = req.body;

    if (!symptoms) {
      return res.status(400).json({ message: "Symptoms are required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "Gemini API key is not configured" });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an intelligent medical triage assistant. A patient is providing the following symptoms: "${symptoms}".
    
    Here is the list of available doctors in our hospital:
    ${JSON.stringify(availableDoctors)}
    
    Analyze the symptoms and determine the exact doctor they should visit based on the doctor's specialization. 
    
    You MUST respond with a raw JSON object containing exactly two keys:
    1. "recommendation": A short, reassuring sentence summarizing what they might be experiencing and confirming the recommended doctor by name.
    2. "recommendedDoctorId": The exact ID (_id) of the recommended doctor.
    
    Do NOT wrap the JSON in markdown blocks like \`\`\`json. Return only the raw JSON.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let parsedResponse;
    try {
      // In case the model accidentally wraps it in markdown despite instructions
      const cleanText = responseText.replace(/```json\n/g, "").replace(/```/g, "").trim();
      parsedResponse = JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", responseText);
      return res.status(500).json({ message: "Failed to process AI response." });
    }

    res.json(parsedResponse);
  } catch (error) {
    console.error("AI Triage Error:", error);
    res.status(500).json({ message: "Failed to analyze symptoms. Please try again later." });
  }
};
