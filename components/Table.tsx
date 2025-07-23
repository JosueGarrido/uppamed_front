'use client';

import { useState } from 'react';

export interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactElement | null;
  pageSize?: number;
  title?: string;
}

export default function Table<T>({ columns, data, onRowClick, actions, pageSize = 10, title }: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar datos basado en el término de búsqueda
  const filteredData = data.filter((row) =>
    columns.some((column) => {
      const value = row[column.key];
      return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Calcular paginación
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-200">
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {title}
          </h2>
        </div>
      )}
      
      {/* Barra de búsqueda */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="form-input w-full max-w-xs px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
            bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100
            focus:ring-medical-500 focus:border-medical-500 dark:focus:ring-medical-400 dark:focus:border-medical-400
            placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {actions && <th scope="col" className="relative px-6 py-3" />}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                className={`
                  ${onRowClick ? 'cursor-pointer' : ''}
                  hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150
                `}
              >
                {columns.map((column) => (
                  <td
                    key={String(column.key)}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                  >
                    {String(row[column.key] ?? '')}
                  </td>
                ))}
                {actions && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {actions(row)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
              text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 
              bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
              disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
              text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 
              bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 
              disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
              transition-colors duration-200"
          >
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
              <span className="font-medium">
                {Math.min(startIndex + pageSize, filteredData.length)}
              </span>{' '}
              de <span className="font-medium">{filteredData.length}</span> resultados
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 
                  hover:bg-gray-50 dark:hover:bg-gray-600 
                  disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                <span className="sr-only">Primera</span>
                ««
              </button>
              <button
                onClick={() => setCurrentPage(page => page - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 
                  hover:bg-gray-50 dark:hover:bg-gray-600 
                  disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                <span className="sr-only">Anterior</span>
                «
              </button>
              <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(page => page + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 
                  hover:bg-gray-50 dark:hover:bg-gray-600 
                  disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                <span className="sr-only">Siguiente</span>
                »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400 
                  hover:bg-gray-50 dark:hover:bg-gray-600 
                  disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                  transition-colors duration-200"
              >
                <span className="sr-only">Última</span>
                »»
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
} 