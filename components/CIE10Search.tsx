'use client';

import { useEffect, useRef, useState } from 'react';
import { CIE10Result } from '@/services/cie10.service';

interface CIE10SearchProps {
  onSelect: (diagnosis: CIE10Result) => void;
  placeholder?: string;
  className?: string;
}

export default function CIE10Search({ onSelect, placeholder = "Buscar diagnóstico en CIE10...", className = "" }: CIE10SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CIE10Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cie10Data, setCie10Data] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar datos del CIE-10 una sola vez al montar el componente
  useEffect(() => {
    const loadCie10Data = async () => {
      try {
        const response = await fetch('/cie10-codes.json');
        if (response.ok) {
          const data = await response.json();
          setCie10Data(data);
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('Error al cargar códigos CIE-10:', error);
      }
    };

    if (!dataLoaded) {
      loadCie10Data();
    }
  }, [dataLoaded]);

  const searchDiagnosis = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 3 || !dataLoaded) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);
    try {
      // Filtrar diagnósticos que contengan la consulta
      const filtered = cie10Data.filter((item: any) => 
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Limitar resultados a los primeros 20 para mejor rendimiento
      const limitedResults = filtered.slice(0, 20);

      const diagnoses: CIE10Result[] = limitedResults.map((item: any) => ({
        id: item.code,
        title: item.description,
        definition: `CIE-10: ${item.code} - ${item.description}`
      }));

      setResults(diagnoses);
      setShowDropdown(true);
    } catch (error) {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    searchDiagnosis(value);
  };

  const handleSelect = (diagnosis: CIE10Result) => {
    setQuery(`${diagnosis.id} - ${diagnosis.title}`);
    setShowDropdown(false);
    setResults([]);
    onSelect(diagnosis);
  };

  const handleFocus = () => {
    if (query.length >= 3) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Pequeño delay para permitir que el click en el dropdown funcione
    setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      
      {loading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
        </div>
      )}
      
      {/* Dropdown de resultados */}
      {showDropdown && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {results.map((result) => (
            <div
              key={result.id}
              onClick={() => handleSelect(result)}
              className="px-3 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-sm text-gray-900">{result.title}</div>
              <div className="text-xs text-purple-600 font-mono mt-1">Código: {result.id}</div>
              {result.definition && (
                <div className="text-xs text-gray-600 mt-2 line-clamp-2">
                  {result.definition}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {showDropdown && results.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <div className="text-sm text-gray-500 text-center">
            No se encontraron diagnósticos para "{query}"
          </div>
          <div className="text-xs text-gray-400 text-center mt-2">
            Intenta con términos más generales o sinónimos
          </div>
        </div>
      )}
    </div>
  );
} 