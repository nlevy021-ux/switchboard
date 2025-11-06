// lib/links.ts
import type { Tool } from "./types";

export function buildDeepLink(tool: Tool, text: string) {
  const q = encodeURIComponent(text || "");
  switch (tool) {
    // Text & Research
    case "chatgpt":
      return { url: `https://chat.openai.com/?q=${q}`, label: "Open in ChatGPT" };
    case "perplexity":
      return { url: `https://www.perplexity.ai/search?q=${q}`, label: "Open in Perplexity" };

    // Images & Design
    case "dalle":
      // DALL·E uses prompt parameter
      return { url: `https://labs.openai.com/?prompt=${q}`, label: "Open DALL·E" };
    case "sd_image":
      // ClipDrop Stable Diffusion uses prompt parameter
      return { url: `https://clipdrop.co/stable-diffusion?prompt=${q}`, label: "Open Stable Diffusion" };
    case "canva":
      // Canva uses query parameter for search
      return { url: `https://www.canva.com/?query=${q}`, label: "Open Canva" };
    case "framer_ai":
      // Framer AI uses prompt parameter
      return { url: `https://www.framer.com/ai/?prompt=${q}`, label: "Open Framer AI" };
    case "lovable":
      // Loveable uses prompt parameter
      return { url: `https://lovable.dev/?prompt=${q}`, label: "Open Loveable" };

    // Video
    case "runway":
      // Runway uses prompt parameter
      return { url: `https://app.runwayml.com/?prompt=${q}`, label: "Open Runway" };
    case "pika":
      // Pika Labs uses prompt parameter
      return { url: `https://pika.art/?prompt=${q}`, label: "Open Pika Labs" };
    case "kaiber":
      // Kaiber uses prompt parameter
      return { url: `https://www.kaiber.ai/?prompt=${q}`, label: "Open Kaiber" };

    // Audio/Voice/Music
    case "elevenlabs":
      // ElevenLabs uses text parameter for speech synthesis
      return { url: `https://elevenlabs.io/app/speech-synthesis?text=${q}`, label: "Open ElevenLabs" };
    case "whisper":
      // Whisper uses prompt parameter
      return { url: `https://huggingface.co/spaces/openai/whisper?prompt=${q}`, label: "Open Whisper" };
    case "suno":
      // Suno uses prompt parameter
      return { url: `https://suno.com/?prompt=${q}`, label: "Open Suno" };
    case "udio":
      // Udio uses prompt parameter
      return { url: `https://www.udio.com/?prompt=${q}`, label: "Open Udio" };

    // Narrative & Presentations
    case "descript":
      // Descript uses prompt parameter
      return { url: `https://www.descript.com/app?prompt=${q}`, label: "Open Descript" };
    case "gamma":
      // Gamma uses prompt parameter
      return { url: `https://gamma.app/?prompt=${q}`, label: "Open Gamma" };
    case "tome":
      // Tome uses prompt parameter
      return { url: `https://tome.app/?prompt=${q}`, label: "Open Tome" };

    default:
      return { url: `https://chat.openai.com/?q=${q}`, label: "Open ChatGPT" };
  }
}
