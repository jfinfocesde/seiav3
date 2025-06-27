import { redirect } from 'next/navigation';

export default function PerformanceAnalyzerPanel() {
  redirect('/teacher/tools/performance-analyzer/audio');
  return null;
} 