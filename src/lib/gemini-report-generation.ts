// Eliminamos 'use client' ya que este archivo se usa en server actions

import { GoogleGenAI } from "@google/genai";
import { getApiKey } from './apiKeyService';

interface ReportResult {
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  grade: number; // Nota final de 0.0 a 5.0
  congratulationMessage?: string; // Mensaje de felicitación si la nota es alta
  recommendationMessage?: string; // Mensaje de recomendación si la nota es baja
}

interface AnswerSummary {
  questionText: string;
  questionType: string; // 'CODE' o 'TEXT'
  studentAnswer: string;
  score: number | null;
  language?: string; // Solo para preguntas de código
}

/**
 * Servicio para generar reportes de resultados utilizando Google Gemini
 * @param studentName - Nombre completo del estudiante
 * @param evaluationTitle - Título de la evaluación
 * @param answers - Resumen de las respuestas del estudiante con sus calificaciones
 * @param averageScore - Calificación promedio obtenida
 * @param fraudAttempts - Número de intentos de fraude detectados
 * @param evaluationId - ID de la evaluación (opcional, para obtener la API Key contextual)
 * @returns Objeto con el reporte generado incluyendo retroalimentación, fortalezas, áreas de mejora y mensajes personalizados
 */
export async function generateEvaluationReport(
  studentName: string,
  evaluationTitle: string,
  answers: AnswerSummary[],
  averageScore: number,
  fraudAttempts: number,
  evaluationId?: number // Nuevo parámetro opcional
): Promise<ReportResult> {
  try {
    // Obtener la API Key usando el evaluationId si está disponible
    const apiKey = await getApiKey(evaluationId);
    if (!apiKey) throw new Error('No se encontró una API Key válida para Gemini');
    const ai = new GoogleGenAI({ apiKey });
    // Usar SIEMPRE el modelo gemini-2.5-flash para máxima compatibilidad
    const model = "gemini-2.5-flash";
    // Preparar el resumen de respuestas para el prompt
    const answersDetail = answers.map((answer, index) => {
      return `\nPregunta ${index + 1} (${answer.questionType}):\n${answer.questionText}\n\nRespuesta del estudiante:\n${answer.studentAnswer}\n\nCalificación: ${answer.score !== null ? answer.score : 'No evaluada'}/5.0\n`;
    }).join('\n');
    // Crear el prompt para la generación del reporte
    const prompt = `
Eres un asistente educativo que genera reportes detallados de evaluaciones académicas. 
Genera un reporte completo para el siguiente estudiante basado en sus respuestas y calificaciones.

ESTUDIANTE: ${studentName}
EVALUACIÓN: ${evaluationTitle}
CALIFICACIÓN PROMEDIO: ${averageScore.toFixed(1)}/5.0
INTENTOS DE FRAUDE DETECTADOS: ${fraudAttempts}

DETALLE DE RESPUESTAS:
${answersDetail}

Basado en esta información, genera un reporte completo que incluya:
1. Una retroalimentación general sobre el desempeño del estudiante
2. Las principales fortalezas demostradas
3. Áreas específicas que necesitan mejora
4. Un mensaje personalizado de felicitación si la calificación es buena (≥ 4.0) o recomendaciones constructivas si la calificación es baja (< 3.0)

Ten en cuenta los intentos de fraude en tu evaluación si los hubiera.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "overallFeedback": string, // Retroalimentación general sobre el desempeño
  "strengths": string[], // Lista de fortalezas identificadas (al menos 2)
  "areasForImprovement": string[], // Lista de áreas que necesitan mejora (al menos 2)
  "grade": number, // La calificación final (debe ser igual a ${averageScore.toFixed(1)})
  "congratulationMessage": string, // Mensaje de felicitación (solo si la nota es ≥ 4.0)
  "recommendationMessage": string // Mensaje de recomendación (solo si la nota es < 3.0)
}
`;
    // Usar el mismo formato de contents que los otros servicios
    let response, text;
    try {
      response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      text = response.text || '';
      console.log('Respuesta Gemini (reporte):', text);
    } catch (err) {
      console.error('Error en la petición a Gemini para reporte:', err);
      return {
        overallFeedback: 'Ocurrió un error al generar el reporte de evaluación (petición fallida).',
        strengths: [],
        areasForImprovement: [err instanceof Error ? err.message : String(err)],
        grade: averageScore
      };
    }
    // Extraer el JSON de la respuesta
    try {
      try {
        const reportResult = JSON.parse(text) as ReportResult;
        return reportResult;
      } catch (directError) {
        console.log('Error parseo directo JSON:', directError);
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonText = jsonMatch[0];
          const reportResult = JSON.parse(jsonText) as ReportResult;
          return reportResult;
        } else {
          throw new Error('No se pudo encontrar un objeto JSON en la respuesta de Gemini.');
        }
      }
    } catch (error) {
      console.error('Error al procesar la respuesta JSON del reporte:', error, 'Texto recibido:', text);
      return {
        overallFeedback: 'Ocurrió un error al procesar el reporte de evaluación. ' + (error instanceof Error ? error.message : String(error)),
        strengths: [],
        areasForImprovement: ['Texto recibido: ' + text],
        grade: averageScore
      };
    }
  } catch (error) {
    // Mejorar el log para mostrar el error real
    console.error('Error general al generar el reporte de evaluación:', error);
    return {
      overallFeedback: 'Ocurrió un error al generar el reporte de evaluación (error general): ' + (error instanceof Error ? error.message : String(error)),
      strengths: [],
      areasForImprovement: [error instanceof Error ? error.message : String(error)],
      grade: averageScore
    };
  }
}