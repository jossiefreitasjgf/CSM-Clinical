import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for clinical search and AI summary using googleSearch grounding tool
app.post("/api/search-studies", async (req, res) => {
  try {
    const { query, category } = req.body;
    if (!query) {
      return res.status(400).json({ error: "O termo de pesquisa é obrigatório." });
    }

    // Build rich pediatric physiotherapy-focused prompt
    const prompt = `Aja como um especialista sênior em Fisioterapia Infantil, Neuropediatria e Reabilitação Pediátrica.
Realize uma busca aprofundada na web para responder à seguinte consulta sobre tratamento ou estudo de caso:
Assunto da Busca: "${query}"${category ? ` (Foco específico em: ${category})` : ""}

Forneça um relatório clínico completo em português com as seguintes seções estruturadas em Markdown:
1. **Resumo do Tema e Relevância Clínica** (breve introdução sobre a patologia ou técnica no contexto infantil).
2. **Estudos Clínicos e Evidências Científicas Recentes** (mencione os principais achados, ensaios clínicos, revisões sistemáticas e o nível de evidência se aplicável).
3. **Formas e Protocolos de Tratamento** (abordagens de fisioterapia recomendadas, recursos terapêuticos utilizados, frequência e duração se descrito).
4. **Orientações Práticas e Cuidados** (contraindicações, cuidados no manuseio infantil, envolvimento da família e orientações domiciliares).

Certifique-se de que todas as informações se baseiem nos resultados reais da pesquisa na web (mencionando os estudos originais, PubMed, Scielo, Cochrane, revistas médicas ou diretrizes internacionais de fisioterapia pediátrica).
Por favor, seja extremamente profissional, preciso e prático para auxiliar um fisioterapeuta no atendimento direto.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const responseText = response.text || "";

    // Extract search grounding metadata sources
    const sources: { title: string; uri: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || "Fonte Científica",
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Deduplicate sources
    const uniqueSources = Array.from(new Map(sources.map((item) => [item.uri, item])).values());

    res.json({
      responseText,
      sources: uniqueSources,
    });
  } catch (error: any) {
    console.error("Erro na API de busca de estudos:", error);
    res.status(500).json({
      error: "Erro interno ao processar a busca de estudos clínicos. Verifique a chave de API ou tente novamente.",
      details: error.message || String(error),
    });
  }
});

// Vite middleware setup
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Failed to start server:", err);
});
