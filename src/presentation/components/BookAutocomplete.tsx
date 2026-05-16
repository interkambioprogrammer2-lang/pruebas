import React, { useState, useEffect, useRef } from 'react';
import { Book } from '../../domain/entities/Book';
import { searchBooks } from '../../container/dependencies';
import apiClient from '../../infrastructure/http/apiClient';
import { BookSearchResultItem, StockLocation } from '../../domain/entities/Book'; // importa las nuevas interfaces

interface Props {
  onSelect: (bookId: number, quantity: number, salePrice: number, sourceLocationId: number, title: string) => void;
  disabled: boolean;
}

const BookAutocomplete: React.FC<Props> = ({ onSelect, disabled }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResultItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [selectedBook, setSelectedBook] = useState<BookSearchResultItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState(0);
  const [selectedLocationId, setSelectedLocationId] = useState<number | ''>('');

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        // Llamada al nuevo endpoint que incluye el stock
        const response = await apiClient.get('/books/search-with-stock', { params: { term: normalized } });
        if (currentRequestId !== requestIdRef.current) return;
        setResults(response.data as BookSearchResultItem[]);
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

  const handleSelectBook = (book: BookSearchResultItem) => {
    setSelectedBook(book);
    // Precio sugerido del libro (del campo price)
    setSalePrice(parseFloat(book.price) || 0);
    setShowResults(false);
    setQuery('');
    // Las ubicaciones ya vienen cargadas en book.stockLocations
    setSelectedLocationId(''); // resetear selección
  };

  const handleAddItem = () => {
    if (selectedBook && quantity > 0 && salePrice > 0 && selectedLocationId !== '') {
      onSelect(selectedBook.id, quantity, salePrice, selectedLocationId as number, selectedBook.title);
      setSelectedBook(null);
      setQuantity(1);
      setSalePrice(0);
      setSelectedLocationId('');
    }
  };

  return (
    <div className="autocomplete-section" ref={wrapperRef}>
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
                <li className="autocomplete-feedback">No se encontraron libros con stock disponible.</li>
              )}
              {!isSearching && !searchError && results.map((book) => (
                <li
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  className="autocomplete-item"
                >
                  <div>
                    <strong>{book.sku} - {book.title}</strong> <span>({book.isbn})</span>
                    <div style={{ fontSize: '0.85rem', marginTop: 4 }}>
                      Precio sugerido: ${book.price}
                    </div>
                    {/* Mostrar ubicaciones de stock */}
                    {book.stockLocations.length === 0 && (
                      <div style={{ color: 'red', fontSize: '0.8rem' }}>Sin stock disponible</div>
                    )}
                    {book.stockLocations.map((loc) => (
                      <div key={loc.id} style={{ fontSize: '0.8rem', marginLeft: 10 }}>
                        {loc.warehouseName} — Estante {loc.bookcase}, Piso {loc.bookcaseFloor} |
                        Stock: <strong>{loc.stock}</strong> | Condición: {loc.condition}
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
          </div>

          <p><strong>Selecciona una ubicación de stock:</strong></p>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {selectedBook.stockLocations.length === 0 && <p>No hay ubicaciones disponibles para este libro.</p>}
            {selectedBook.stockLocations.map(loc => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                style={{
                  border: selectedLocationId === loc.id ? '2px solid #2c6fce' : '1px solid #ddd',
                  background: selectedLocationId === loc.id ? '#e0f0ff' : 'white',
                  padding: 8, margin: 4, cursor: 'pointer', borderRadius: 6
                }}
              >
                <strong>{loc.warehouseName}</strong> – Estante {loc.bookcase}, Piso {loc.bookcaseFloor}<br />
                Stock: {loc.stock} | Condición: {loc.condition}
              </div>
            ))}
          </div>

          <div className="selected-book-actions" style={{ marginTop: 10 }}>
            <button onClick={handleAddItem} disabled={disabled || selectedLocationId === '' || quantity <= 0 || salePrice <= 0}>
              Agregar a la lista
            </button>
            <button onClick={() => { setSelectedBook(null); setSelectedLocationId(''); }} className="secondary">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAutocomplete;