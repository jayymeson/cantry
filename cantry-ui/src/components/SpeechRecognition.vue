<template>
  <div>
    <h2>Aprendendo inglês com IA</h2>
    <button @click="toggleRecording">
      {{ isRecording ? "Parar" : "Conversar" }}
    </button>
    <p>Sua fala: {{ transcribedText }}</p>

    <div v-for="(entry, index) in conversationHistory" :key="index">
      <p v-if="entry.isUser">Fala: {{ entry.message }}</p>
      <p v-else>Resposta: {{ entry.message }}</p>
    </div>
  </div>
</template>

<script>
/* global webkitSpeechRecognition */

export default {
  data() {
    return {
      recognition: null,
      transcribedText: "",
      isRecording: false,
      serverResponse: "",
      conversationHistory:
        JSON.parse(localStorage.getItem("conversationHistory")) || [],
    };
  },

  methods: {
    toggleRecording() {
      if (this.isRecording) {
        this.recognition.stop();
        this.isRecording = false;
      } else {
        this.startRecognition();
        this.isRecording = true;
      }
    },

    restartRecognitionIfNeeded() {
      if (this.isRecording) {
        this.startRecognition();
      }
    },

    startRecognition() {
      // Verifica se a API de reconhecimento de voz está disponível
      if (!("webkitSpeechRecognition" in window)) {
        alert("Seu navegador não suporta a API de reconhecimento de voz.");
        return;
      }

      // Cria uma nova instância do reconhecimento de voz
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = "en-US"; // Defina o idioma conforme necessário
      this.recognition.continuous = false; // Define se o reconhecimento deve continuar após a primeira frase

      // Evento disparado quando o texto é reconhecido
      this.recognition.onresult = (event) => {
        // Acumula o texto reconhecido enquanto o usuário fala
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            this.transcribedText += event.results[i][0].transcript;
          }
        }
      };

      this.recognition.onend = () => {
        if (this.isRecording) {
          this.restartRecognitionIfNeeded();
        } else {
          this.updateConversation(this.transcribedText, true);
          this.sendTextToServer();
          this.transcribedText = "";
        }
      };

      // Trata erros
      this.recognition.onerror = (event) => {
        console.error("Erro no reconhecimento de voz:", event.error);
      };

      // Inicia o reconhecimento de voz
      this.recognition.start();
    },

    async sendTextToServer() {
      const lastUserMessage =
        this.conversationHistory.filter((entry) => entry.isUser).pop()
          ?.message || "";

      try {
        const response = await fetch("http://localhost:3000/api/chat/message", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: lastUserMessage }),
        });
        const data = await response.json();
        this.serverResponse = data.response; // Armazena a resposta do servidor
        this.updateConversation(data.response, false); // Resposta do servidor
        this.speakResponse(data.response); // Chama o método speakResponse
        console.log("Resposta do servidor:", data);
        // Processar a resposta do servidor conforme necessário
      } catch (error) {
        console.error("Erro ao enviar texto para o servidor:", error);
      }
    },

    created() {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices();
      };
    },

    speakResponse(responseText) {
      const parts = this.splitTextIntoParts(responseText, 100);
      this.speakPartByPart(parts);
    },

    splitTextIntoParts(text, maxCharacters) {
      const parts = [];
      while (text.length > 0) {
        let part = text.substring(0, maxCharacters);
        let lastIndex = Math.min(text.length, maxCharacters);

        if (lastIndex < text.length) {
          lastIndex = part.lastIndexOf(" ");
          part = part.substring(0, lastIndex);
        }

        parts.push(part);
        text = text.substring(lastIndex).trim();
      }
      return parts;
    },

    speakPartByPart(parts) {
      if (parts.length === 0) return;

      const utterance = new SpeechSynthesisUtterance(parts[0]);
      const voices = speechSynthesis.getVoices();
      const englishVoice = voices.find((voice) => voice.lang === "en-US");

      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      utterance.onend = () => {
        parts.shift();
        this.speakPartByPart(parts);
      };

      speechSynthesis.speak(utterance);
    },

    updateConversation(message, isUserMessage) {
      const timestamp = new Date();
      const formattedTimestamp = this.formatTimestamp(timestamp);
      this.conversationHistory.push({
        message,
        isUser: isUserMessage,
        time: formattedTimestamp,
      });

      localStorage.setItem(
        "conversationHistory",
        JSON.stringify(this.conversationHistory)
      );
    },

    formatTimestamp(timestamp) {
      const days = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
      const day = days[timestamp.getDay()];
      const hours = timestamp.getHours().toString().padStart(2, "0");
      const minutes = timestamp.getMinutes().toString().padStart(2, "0");

      return `${day} ${hours}:${minutes}`;
    },
  },
};
</script>
