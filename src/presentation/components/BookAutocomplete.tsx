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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [salePrice, setSalePrice] = useState(0);
  const [locationId, setLocationId] = useState<number | ''>('');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar almacenes al montar
  useEffect(() => {
    getAllWarehouses.execute().then(setWarehouses);
  }, []);

  // Búsqueda con debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (value.length >= 2) {
        const books = await searchBooks.execute(value);
        setResults(books);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
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
    <div style={{ marginBottom: '1rem' }}>
      {/* Campo de búsqueda (oculto cuando hay libro seleccionado) */}
      {!selectedBook && (
        <div>
          <input
            type="text"
            placeholder="Buscar por SKU, ISBN o título..."
            value={query}
            onChange={handleInputChange}
            disabled={disabled}
            style={{ width: '100%', padding: '8px' }}
          />
          {showResults && results.length > 0 && (
            <ul style={{ border: '1px solid #ccc', listStyle: 'none', padding: 0 }}>
              {results.map((book) => (
                <li
                  key={book.id}
                  onClick={() => handleSelectBook(book)}
                  style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
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
        <div style={{ border: '1px solid #ddd', padding: '10px', marginTop: '10px' }}>
          <strong>{selectedBook.title}</strong> (SKU: {selectedBook.sku})
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label>
              Cantidad:
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                disabled={disabled}
                style={{ width: '80px', marginLeft: '5px' }}
              />
            </label>
            <label>
              Precio venta:
              <input
                type="number"
                min="0"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                disabled={disabled}
                style={{ width: '100px', marginLeft: '5px' }}
              />
            </label>
            <label>
              Almacén:
              <select
                value={locationId}
                onChange={(e) => setLocationId(Number(e.target.value))}
                disabled={disabled}
                style={{ marginLeft: '5px' }}
              >
                <option value="">-- Seleccione --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </label>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleAddItem} disabled={disabled || locationId === '' || quantity <= 0 || salePrice <= 0}>
              Agregar a la lista
            </button>
            <button onClick={() => setSelectedBook(null)} style={{ marginLeft: '10px' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookAutocomplete;