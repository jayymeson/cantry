import axios from "axios";
import "dotenv/config";

// Obter resposta do ChatGPT
async function getChatResponse(text) {
  console.log(`Requesting ChatGPT with text: ${text}`);

  // Verifica se a mensagem está relacionada ao aprendizado de inglês
  if (!isRelatedToEnglishLearning(text)) {
    return "Por favor, foque suas perguntas no aprendizado de inglês.";
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: text }],
        max_tokens: 150,
        temperature: 0.5,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      },
      {
        headers: { Authorization: `Bearer ${process.env.CHATGPT_API_KEY}` },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.error("Limit rate exceeded:", error.response.data);
    } else {
      console.error("Error in getChatResponse:", error);
    }
    throw error; // Relança o erro
  }
}

function isRelatedToEnglishLearning(text) {
  const keywords = [
    "english",
    "learn",
    "language",
    "speak",
    "conversation",
    "talk",
    "discuss",
    "practice",
    "exercise",
    "study",
    "grammar",
    "vocabulary",
    "pronunciation",
    "phrase",
    "sentence",
    "word",
    "listening",
    "reading",
    "writing",
    "speaking",
    "lesson",
    "tutorial",
    "class",
    "question",
    "answer",
    "explain",
    "example",
    "instance",
    "case",
    "dialogue",
    "communication",
    "interaction",
    "expression",
    "idiom",
    "slang",
    "accent",
    "fluency",
    "comprehension",
  ];
  return keywords.some((keyword) => text.toLowerCase().includes(keyword));
}

export { getChatResponse };
