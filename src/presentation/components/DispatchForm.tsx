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
    <div>
      <BookAutocomplete onSelect={addItem} disabled={disabled} />
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>Libro #{item.bookId} - Cant: {item.quantitySent}</li>
        ))}
      </ul>
      <button onClick={handleSubmit} disabled={items.length === 0 || disabled}>
        Agregar libros al envío
      </button>
    </div>
  );
};

export default DispatchForm;
export {};