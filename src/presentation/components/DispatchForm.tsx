import React, { useState } from 'react';
import BookAutocomplete from './BookAutocomplete';
import { DispatchItemRequest } from '../../domain/repositories/IFairRepository';

interface Props {
  onAdd: (items: DispatchItemRequest[]) => void;
  disabled: boolean;
}

const DispatchForm: React.FC<Props> = ({ onAdd, disabled }) => {
  const [items, setItems] = useState<DispatchItemRequest[]>([]);

  const addItem = (bookId: number, quantity: number, salePrice: number, sourceLocationId: number) => {
    setItems([...items, { bookId, quantitySent: quantity, salePrice, sourceLocationId }]);
  };

  const handleSubmit = () => {
    if (items.length > 0) {
      onAdd(items);
      setItems([]);
    }
  };

  return (
    <div className="dispatch-form">
      <BookAutocomplete onSelect={addItem} disabled={disabled} />

      <div className="dispatch-items-panel">
        {items.length === 0 ? (
          <p className="dispatch-items-empty">Aún no hay libros agregados.</p>
        ) : (
          <ul className="dispatch-items-list">
            {items.map((item, idx) => (
              <li key={idx}>
                <span>Libro #{item.bookId}</span>
                <span>Cant: {item.quantitySent}</span>
              </li>
            ))}
          </ul>
        )}

        <button onClick={handleSubmit} disabled={disabled || items.length === 0}>
          Agregar libros al envío
        </button>
      </div>
    </div>
  );
};

export default DispatchForm;
export {};
