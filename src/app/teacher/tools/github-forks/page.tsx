'use client';
import React, { useState } from 'react';

interface GithubFork {
  id: number;
  full_name: string;
  html_url: string;
  stargazers_count: number;
  owner: {
    login: string;
  };
}

export default function GithubForksPage() {
  const [repo, setRepo] = useState('');
  const [forks, setForks] = useState<GithubFork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setForks([]);
    try {
      // repo debe ser en formato owner/repo
      const res = await fetch(`https://api.github.com/repos/${repo}/forks`);
      if (!res.ok) throw new Error('No se pudo obtener los forks.');
      const data: GithubFork[] = await res.json();
      setForks(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Buscador de Forks de GitHub</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="border rounded px-2 py-1 flex-1"
          placeholder="owner/repo (ej: vercel/next.js)"
          value={repo}
          onChange={e => setRepo(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <ul className="space-y-2">
        {forks.map(fork => (
          <li key={fork.id} className="border rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <a href={fork.html_url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 hover:underline">
                {fork.full_name}
              </a>
              <div className="text-sm text-gray-600">{fork.owner?.login}</div>
            </div>
            <div className="text-xs text-gray-500 mt-1 md:mt-0">⭐ {fork.stargazers_count}</div>
          </li>
        ))}
      </ul>
    </div>
  );
} 