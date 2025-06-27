"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2 } from "lucide-react";
import { generatePodcastAudioWithGemini, GEMINI_TTS_LANGUAGES, generatePodcastScriptWithGemini } from "@/lib/gemini-tts-service";

const GEMINI_VOICES = [
  "Kore", "Puck", "Charon", "Fenrir", "Leda", "Callirrhoe", "Aoede", "Enceladus", "Iapetus", "Algieba", "Algenib", "Rasalgethi", "Laomedeia", "Achernar", "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi", "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat", "Orus", "Autonoe", "Umbriel", "Erinome", "Despina"
];

export default function PodcastGeneratorPage() {
  const [mode, setMode] = useState<'mono'|'duo'>('mono');
  const [script, setScript] = useState('');
  const [speaker1, setSpeaker1] = useState({ name: 'Locutor 1', voice: 'Kore' });
  const [speaker2, setSpeaker2] = useState({ name: 'Locutor 2', voice: 'Puck' });
  const [audioUrl, setAudioUrl] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<'es'|'en'>('es');
  const [topic, setTopic] = useState("");
  const [scriptLoading, setScriptLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setAudioUrl(null);
    try {
      const blob = await generatePodcastAudioWithGemini({
        script,
        mode,
        speakers: mode === 'mono' ? [speaker1] : [speaker1, speaker2],
        language
      });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    } catch (err) {
      setError('No se pudo generar el audio. ' + (err instanceof Error ? err.message : String(err)));
      // Opcional: console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateScript() {
    setScriptLoading(true);
    setError("");
    try {
      const generated = await generatePodcastScriptWithGemini({
        topic,
        mode,
        speakers: mode === 'mono' ? [speaker1] : [speaker1, speaker2],
        language
      });
      setScript(generated);
    } catch (err) {
      setError("No se pudo generar el guion. " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setScriptLoading(false);
    }
  }

  return (
    <div className="w-full max-w-full mx-auto py-8 px-2 md:px-8">
      <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">🎙️ Generador de Podcast con IA</h1>
      <p className="text-muted-foreground mb-6">Crea podcasts educativos de uno o dos interlocutores con voces realistas usando Gemini. Escribe o genera el guion, elige voces y descarga el audio.</p>
      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Left: Content Creation */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex gap-4">
            <Button variant={mode==='mono'?'default':'outline'} onClick={()=>setMode('mono')}>Monólogo</Button>
            <Button variant={mode==='duo'?'default':'outline'} onClick={()=>setMode('duo')}>Diálogo</Button>
          </div>
          <div>
            <label className="block font-medium mb-1">Tema del podcast</label>
            <Input
              className="mb-2"
              placeholder="Ej: Energías renovables"
              value={topic}
              onChange={e => setTopic(e.target.value)}
            />
            <Button
              onClick={handleGenerateScript}
              disabled={scriptLoading || !topic.trim()}
              className="mb-2"
              variant="secondary"
            >
              {scriptLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "Generar guion por IA"}
            </Button>
          </div>
          <Textarea
            className=""
            placeholder="Escribe aquí el guion del podcast..."
            value={script}
            onChange={e => setScript(e.target.value)}
            rows={6}
          />
        </div>
        {/* Right: Podcast Options, Locutor, Idioma, Playback */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 border rounded p-3 bg-background/60">
              <div className="font-semibold mb-2">{mode==='mono' ? 'Locutor' : 'Locutor 1'}</div>
              <Input className="mb-2" value={speaker1.name} onChange={e=>setSpeaker1(s=>({...s, name: e.target.value}))} placeholder="Nombre" />
              <select className="w-full border rounded px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-background dark:text-foreground" value={speaker1.voice} onChange={e=>setSpeaker1(s=>({...s, voice: e.target.value}))}>
                {GEMINI_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            {mode==='duo' && (
              <div className="flex-1 border rounded p-3 bg-background/60">
                <div className="font-semibold mb-2">Locutor 2</div>
                <Input className="mb-2" value={speaker2.name} onChange={e=>setSpeaker2(s=>({...s, name: e.target.value}))} placeholder="Nombre" />
                <select className="w-full border rounded px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-background dark:text-foreground" value={speaker2.voice} onChange={e=>setSpeaker2(s=>({...s, voice: e.target.value}))}>
                  {GEMINI_VOICES.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            )}
            <div className="flex-1 flex flex-col gap-2 justify-between">
              <div>
                <label className="block font-medium mb-1">Idioma</label>
                <select
                  className="w-full border rounded px-2 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 dark:bg-background dark:text-foreground"
                  value={language}
                  onChange={e => setLanguage(e.target.value as 'es'|'en')}
                >
                  {GEMINI_TTS_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleGenerate} disabled={loading || !script.trim()} className="w-full gap-2 text-lg mt-4">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Generar Podcast'}
              </Button>
            </div>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          {audioUrl && (
            <div className="border rounded p-4 bg-background/80 flex flex-col items-center">
              <audio src={audioUrl} controls className="w-full mb-2" />
              <Button asChild variant="outline" className="gap-2">
                <a href={audioUrl} download="podcast.wav"><Download className="w-5 h-5" /> Descargar audio</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}