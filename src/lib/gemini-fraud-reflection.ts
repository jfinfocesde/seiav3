import { GoogleGenAI } from "@google/genai";
import { getApiKey } from './apiKeyService';

interface FraudReflectionResult {
  title: string;
  message: string;
  suggestion: string;
}

/**
 * Genera una reflexión sobre un posible intento de fraude académico.
 * @returns Un objeto con el título, mensaje y sugerencia para la reflexión.
 * @throws Si la API de Gemini no devuelve contenido o si ocurre un error.
 */
export async function generateFraudReflection(
  fraudType: string,
  fraudCount: number,
  timeOutsideEval: number,
  evaluationId: number
): Promise<FraudReflectionResult> {
  
  // const apiKey = await getApiKey(evaluationId);
  const apiKey = await getApiKey(evaluationId + 4578);
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-2.0-flash";
  
  const severityLevel = fraudCount > 3 ? "ALTO" : fraudCount > 1 ? "MEDIO" : "BAJO";

  const prompt = `
    Eres un asistente educativo que promueve la integridad académica. Genera un mensaje reflexivo único y profundo para un estudiante que ha realizado una acción que podría considerarse un intento de fraude durante una evaluación en línea.

    TIPO DE ACCIÓN DETECTADA:
    ${fraudType}

    NÚMERO DE INTENTOS DETECTADOS:
    ${fraudCount}

    NIVEL DE SEVERIDAD:
    ${severityLevel}

    TIEMPO FUERA DE LA EVALUACIÓN:
    ${timeOutsideEval} minutos

    INSTRUCCIONES ESPECÍFICAS:
    - Genera un mensaje reflexivo ÚNICO y DIFERENTE cada vez, evitando frases genéricas o repetitivas
    - Incluye una frase filosófica o cita inspiradora sobre la integridad, el conocimiento o la ética
    - Adapta el tono según el nivel de severidad (bajo: educativo, medio: reflexivo, alto: serio pero constructivo)
    - El mensaje debe invitar a la introspección sobre el valor real del aprendizaje y el conocimiento
    - Evita un tono acusatorio, enfócate en el crecimiento personal y los valores académicos

    Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
    {
      "title": string, // Título breve para el modal (máximo 50 caracteres)
      "message": string, // Mensaje principal de reflexión (100-200 caracteres) - DEBE ser una frase reflexiva única
      "suggestion": string // Sugerencia constructiva (máximo 100 caracteres)
    }
  `;

  try {
    const response = await genAI.models.generateContent({ model, contents: [prompt] });
    const text = response.text || '';
    
    console.log('Respuesta de Gemini:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as FraudReflectionResult;
      } catch (error) {
        console.error('Error al parsear la respuesta JSON:', error);
      }
    }

    // Fallback si no hay JSON o si el parseo falla
    return {
      title: 'Reflexión sobre Integridad',
      message: 'Se ha detectado una acción que podría comprometer tu evaluación. Es una oportunidad para reflexionar sobre la importancia de la honestidad académica.',
      suggestion: 'Continúa con tu evaluación, enfocándote en demostrar tu propio conocimiento.'
    };

  } catch (error) {
    console.error('Error al generar mensaje de reflexión:', error);
    return {
      title: 'Error de Conexión',
      message: 'No se pudo generar una reflexión en este momento debido a un error del sistema.',
      suggestion: 'Por favor, ignora este mensaje y continúa con tu evaluación.'
    };
  }
}