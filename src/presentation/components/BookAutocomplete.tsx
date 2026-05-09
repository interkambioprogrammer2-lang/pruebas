import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../domain/entities/Book';
import { Warehouse } from '../../domain/entities/Warehouse';
import { searchBooks, getAllWarehouses } from '../../container/dependencies';

interface Props {
  onSelect: (bookId: number, quantity: number, salePrice: number, sourceLocationId: number) => void;
  disabled: boolean;
}

const BookAutocomplete: React.FC<Props> = ({ onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState(0);
  const [locationId, setLocationId] = useState<number | ''>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  // Cargar almacenes al montar
  useEffect(() => {
    getAllWarehouses.execute().then(setWarehouses).catch(() => {});
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Búsqueda con debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSearchError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const normalized = value.trim();
    if (normalized.length < 2) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const currentRequestId = ++requestIdRef.current;
      try {
        const books = await searchBooks.execute(normalized);
        if (currentRequestId !== requestIdRef.current) return;
        setResults(books);
        setShowResults(true);
      } catch {
        if (currentRequestId !== requestIdRef.current) return;
        setResults([]);
        setSearchError('No se pudo completar la búsqueda.');
        setShowResults(true);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, 300);
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setSalePrice(book.price); // precargar precio sugerido
    setShowResults(false);
    setQuery('');
  };

  const handleAddItem = () => {
    if (selectedBook && quantity > 0 && salePrice > 0 && locationId !== '') {
      onSelect(selectedBook.id, quantity, salePrice, locationId as number);
      // limpiar formulario
      setSelectedBook(null);
      setQuantity(1);
      setSalePrice(0);
      setLocationId('');
    }
  };

  return (
    <div className="autocomplete-section" ref={wrapperRef}>
      {/* Campo de búsqueda (oculto cuando hay libro seleccionado) */}
      {!selectedBook && (
        <div className="autocomplete-wrapper">
          <input
            type="text"
            placeholder="Buscar por SKU, ISBN o título..."
            value={query}
            onChange={handleInputChange}
            disabled={disabled}
            className="autocomplete-input"
          />
          <p className="autocomplete-hint">Escribe al menos 2 caracteres para buscar.</p>

          {showResults && (
            <ul className="autocomplete-list">
              {isSearching && <li className="autocomplete-feedback">Buscando...</li>}

              {!isSearching && searchError && (
                <li className="autocomplete-feedback autocomplete-feedback-error">{searchError}</li>
              )}

              {!isSearching && !searchError && results.length === 0 && (
                <li className="autocomplete-feedback">No se encontraron libros.</li>
              )}

              {!isSearching &&
                !searchError &&
                results.map((book) => (
                  <li
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    className="autocomplete-item"
                  >
                    {book.sku} - {book.title} ({book.isbn})
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}

      {/* Formulario para cantidad, precio y almacén */}
      {selectedBook && (
        <div className="selected-book-card">
          <p className="selected-book-title">
            {selectedBook.title} <span>(SKU: {selectedBook.sku})</span>
          </p>

          <div className="selected-book-fields">
            <label className="selected-book-field">
              Cantidad:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={disabled}
              />
            </label>
            <label className="selected-book-field">
              Precio venta:
              <input
                type="number"
                min="0"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                disabled={disabled}
              />
            </label>
            <label className="selected-book-field">
              Almacén:
              <select
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                disabled={disabled}
              >
                <option value="">-- Seleccione --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="selected-book-actions">
            <button onClick={handleAddItem} disabled={disabled || locationId === '' || quantity <= 0 || salePrice <= 0}>
              Agregar a la lista
            </button>
            <button onClick={() => setSelectedBook(null)} className="secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAutocomplete;
