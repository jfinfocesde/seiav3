"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Volume2, Languages, Loader2, Mic, StopCircle } from "lucide-react";
import { translateTextWithGemini, transcribeTranslateAndTTSWithGemini, generateSegmentedTTSWithGemini } from "@/lib/gemini-translate-service";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

export default function TranslatorPanel() {
  const [original, setOriginal] = useState("");
  const [translated, setTranslated] = useState("");
  const [targetLang, setTargetLang] = useState<'es'|'en'>("en");
  const [loading, setLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [transcript, setTranscript] = useState("");
  const [includeTimestamps, setIncludeTimestamps] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [ttsVoice, setTtsVoice] = useState('Kore');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [mode, setMode] = useState<'texto' | 'audio'>('texto');
  const [generateVoice, setGenerateVoice] = useState(false);

  const handleTranslate = async () => {
    setLoading(true);
    setError("");
    setAudioUrl(null);
    try {
      const res = await translateTextWithGemini(original, targetLang);
      setTranslated(res);
      if (generateVoice && res) {
        const audioBlob = await import("@/lib/gemini-translate-service").then(m => m.generateTTSWithGemini(res, targetLang, ttsVoice));
        if (audioBlob) setAudioUrl(URL.createObjectURL(audioBlob));
      }
    } catch {
      setError("Error al traducir el texto.");
    } finally {
      setLoading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setAudioLoading(true);
    setAudioUrl(null);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const base64 = (ev.target?.result as string).split(",")[1];
          // Llama a la función extendida para TTS
          const result = await transcribeTranslateAndTTSWithGemini(base64, targetLang, { timestamps: includeTimestamps, ttsVoice, returnAudio: false });
          setTranscript(result.transcript);
          setOriginal(result.transcript);
          setTranslated(result.translation);
          // Si hay timestamps y el usuario lo pidió, generar TTS segmentado
          let audioBlob: Blob | undefined = undefined;
          if (includeTimestamps && /\[\d{2}:\d{2}:\d{2}\]/.test(result.translation)) {
            audioBlob = await generateSegmentedTTSWithGemini(result.translation, targetLang, ttsVoice);
          } else if (result.translation) {
            audioBlob = await import("@/lib/gemini-translate-service").then(m => m.generateTTSWithGemini(result.translation, targetLang, ttsVoice));
          }
          if (audioBlob) {
            setAudioUrl(URL.createObjectURL(audioBlob));
          }
        } catch {
          setError("Error al transcribir, traducir o generar audio.");
        } finally {
          setAudioLoading(false);
          e.target.value = '';
        }
      };
      reader.readAsDataURL(file);
    } catch {
      setError("Error al leer el archivo de audio.");
      setAudioLoading(false);
      e.target.value = '';
    }
  };

  const handleStartRecording = async () => {
    setError("");
    setIsRecording(true);
    setAudioUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new window.MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setAudioLoading(true); // <-- Solo aquí se activa loading
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Convertir a base64 para procesar igual que un archivo subido
        const reader = new FileReader();
        reader.onload = async (ev) => {
          try {
            const base64 = (ev.target?.result as string).split(",")[1];
            const result = await transcribeTranslateAndTTSWithGemini(base64, targetLang, { timestamps: includeTimestamps, ttsVoice, returnAudio: false });
            setTranscript(result.transcript);
            setOriginal(result.transcript);
            setTranslated(result.translation);
            let audioBlob: Blob | undefined = undefined;
            if (includeTimestamps && /\[\d{2}:\d{2}:\d{2}\]/.test(result.translation)) {
              audioBlob = await generateSegmentedTTSWithGemini(result.translation, targetLang, ttsVoice);
            } else if (result.translation) {
              audioBlob = await import("@/lib/gemini-translate-service").then(m => m.generateTTSWithGemini(result.translation, targetLang, ttsVoice));
            }
            if (audioBlob) {
              setAudioUrl(URL.createObjectURL(audioBlob));
            }
          } catch {
            setError("Error al transcribir, traducir o generar audio.");
          } finally {
            setAudioLoading(false);
          }
        };
        reader.readAsDataURL(audioBlob);
      };
      mediaRecorder.start();
    } catch {
      setError("No se pudo acceder al micrófono.");
      setAudioLoading(false);
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="w-full max-w-full mx-auto py-8 px-2 md:px-8">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><Languages className="w-7 h-7 text-primary" /> Traductor IA</h1>
      <div className="flex gap-4 mb-4">
        <Button variant={mode === 'texto' ? 'default' : 'outline'} onClick={() => setMode('texto')}>Traducción de texto</Button>
        <Button variant={mode === 'audio' ? 'default' : 'outline'} onClick={() => setMode('audio')}>Traducción de audio</Button>
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Columna original */}
        <Card className="flex-1 min-w-[220px] min-h-[60vh] flex flex-col">
          <CardContent className="p-4 flex flex-col gap-2 h-full">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-semibold">Texto original</span>
              {mode === 'audio' && (
                <>
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    title="Subir audio y transcribir"
                    aria-label="Subir audio y transcribir"
                    disabled={audioLoading || isRecording}
                  >
                    <Upload className="w-5 h-5" /> Subir audio y transcribir
                  </Button>
                  <Button
                    variant={isRecording ? "destructive" : "outline"}
                    className="gap-2"
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    title={isRecording ? "Detener grabación" : "Grabar audio"}
                    aria-label={isRecording ? "Detener grabación" : "Grabar audio"}
                    disabled={audioLoading}
                  >
                    {isRecording ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />} {isRecording ? "Detener grabación" : "Grabar audio"}
                  </Button>
                  <input type="file" accept="audio/*" className="hidden" ref={fileInputRef} onChange={handleAudioUpload} />
                  <label className="flex items-center gap-1 text-xs cursor-pointer select-none ml-2">
                    <input
                      type="checkbox"
                      checked={includeTimestamps}
                      onChange={e => setIncludeTimestamps(e.target.checked)}
                      disabled={audioLoading}
                    />
                    Incluir marcas de tiempo
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer select-none ml-2">
                    <span>Voz:</span>
                    <select value={ttsVoice} onChange={e => setTtsVoice(e.target.value)} disabled={audioLoading} className="border rounded px-1 py-0.5 text-xs">
                      <option value="Kore">Kore</option>
                      <option value="Puck">Puck</option>
                      <option value="Zephyr">Zephyr</option>
                      <option value="Charon">Charon</option>
                      <option value="Fenrir">Fenrir</option>
                      <option value="Leda">Leda</option>
                      <option value="Orus">Orus</option>
                      <option value="Aoede">Aoede</option>
                      <option value="Callirrhoe">Callirrhoe</option>
                      <option value="Autonoe">Autonoe</option>
                      <option value="Enceladus">Enceladus</option>
                      <option value="Iapetus">Iapetus</option>
                      <option value="Umbriel">Umbriel</option>
                      <option value="Algieba">Algieba</option>
                      <option value="Despina">Despina</option>
                      <option value="Erinome">Erinome</option>
                      <option value="Algenib">Algenib</option>
                      <option value="Laomedeia">Laomedeia</option>
                      <option value="Achernar">Achernar</option>
                      <option value="Alnilam">Alnilam</option>
                      <option value="Schedar">Schedar</option>
                      <option value="Gacrux">Gacrux</option>
                      <option value="Pulcherrima">Pulcherrima</option>
                      <option value="Achird">Achird</option>
                      <option value="Zubenelgenubi">Zubenelgenubi</option>
                      <option value="Vindemiatrix">Vindemiatrix</option>
                      <option value="Sadachbia">Sadachbia</option>
                      <option value="Sadaltager">Sadaltager</option>
                      <option value="Sulafat">Sulafat</option>
                    </select>
                  </label>
                  {audioLoading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                  {audioLoading && <span className="text-xs text-muted-foreground ml-2">Transcribiendo audio...</span>}
                </>
              )}
            </div>
            <div className="flex flex-col flex-grow">
              <Textarea
                rows={8}
                className="resize-y min-h-[80px] flex-grow"
                placeholder={mode === 'texto' ? "Escribe o pega el texto a traducir..." : "Aquí aparecerá la transcripción o escribe manualmente..."}
                value={original}
                onChange={e => setOriginal(e.target.value)}
                disabled={audioLoading || (mode === 'audio')}
              />
            </div>
            {transcript && <div className="text-xs text-muted-foreground">Transcripción: {transcript}</div>}
          </CardContent>
        </Card>
        {/* Columna traducida */}
        <Card className="flex-1 min-w-[220px] min-h-[60vh] flex flex-col">
          <CardContent className="p-4 flex flex-col gap-2 h-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold">Traducción</span>
              <Select value={targetLang} onValueChange={v => setTargetLang(v as 'es'|'en')} disabled={loading || audioLoading}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Idioma destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">Inglés</SelectItem>
                </SelectContent>
              </Select>
              {mode === 'texto' && (
                <>
                  <Button onClick={handleTranslate} disabled={!original.trim() || loading || audioLoading} className="gap-2 ml-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    Traducir
                  </Button>
                  <label className="flex items-center gap-1 text-xs cursor-pointer select-none ml-2">
                    <input
                      type="checkbox"
                      checked={generateVoice}
                      onChange={e => setGenerateVoice(e.target.checked)}
                      disabled={loading || audioLoading}
                    />
                    Generar audio traducido
                  </label>
                </>
              )}
            </div>
            <div className="flex flex-col flex-grow">
              <Textarea
                rows={8}
                className="resize-y min-h-[80px] flex-grow"
                placeholder="Aquí aparecerá la traducción..."
                value={translated}
                readOnly
              />
            </div>
            {audioUrl && (
              <audio controls className="mt-2 w-full">
                <source src={audioUrl} type="audio/wav" />
                Tu navegador no soporta la reproducción de audio.
              </audio>
            )}
          </CardContent>
        </Card>
      </div>
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
}
