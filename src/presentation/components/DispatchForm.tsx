import React, { useState } from 'react';
import BookAutocomplete from './BookAutocomplete';
import { DispatchItemRequest } from '../../domain/repositories/IFairRepository';

interface DisplayItem extends DispatchItemRequest {
  title: string; // solo para mostrar, no se envía
}

interface Props {
  onAdd: (items: DispatchItemRequest[]) => void;
  disabled: boolean;
}

const DispatchForm: React.FC<Props> = ({ onAdd, disabled }) => {
  const [items, setItems] = useState<DisplayItem[]>([]);

  const addItem = (bookId: number, quantity: number, salePrice: number, sourceLocationId: number, title: string) => {
    setItems([...items, { bookId, quantitySent: quantity, salePrice, sourceLocationId, title }]);
  };

  // --- NUEVO: eliminar un libro de la lista temporal ---
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (items.length > 0) {
      // Extraemos solo los campos que necesita el backend (sin title)
      const requestItems: DispatchItemRequest[] = items.map(({ title, ...rest }) => rest);
      onAdd(requestItems);
      setItems([]);
    }
  };

  return (
    <div>
      <BookAutocomplete onSelect={addItem} disabled={disabled} />
      
      {items.length > 0 && (
        <ul style={{ marginTop: '10px' }}>
          {items.map((item, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
              <span>{item.title} – Cant: {item.quantitySent} – Precio: ${item.salePrice}</span>
              <button
                onClick={() => removeItem(idx)}
                disabled={disabled}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  padding: '0 5px',
                }}
                title="Eliminar libro"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={handleSubmit} disabled={items.length === 0 || disabled}>
        Agregar libros al envío {items.length > 0 ? `(${items.length})` : ''}
      </button>
    </div>
  );
};

export default DispatchForm;
export {};