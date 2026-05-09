import React, { useState } from 'react';
import BookAutocomplete from './BookAutocomplete';
import { DispatchItemRequest } from '../../domain/repositories/IFairRepository';

interface DisplayItem extends DispatchItemRequest {
  title: string; // solo para mostrar, no se envía
}

interface Props {
  onAdd: (items: DispatchItemRequest[]) => Promise<void>;
  onClearItems?: () => void;
  disabled: boolean;
}

const DispatchForm: React.FC<Props> = ({ onAdd, onClearItems, disabled }) => {
  const [items, setItems] = useState<DisplayItem[]>([]);

  const addItem = (bookId: number, quantity: number, salePrice: number, sourceLocationId: number, title: string) => {
    setItems([...items, { bookId, quantitySent: quantity, salePrice, sourceLocationId, title }]);
  };

  const handleSubmit = async () => {
    if (items.length > 0) {
      const requestItems: DispatchItemRequest[] = items.map(({ title, ...rest }) => rest);
      console.log('📤 Enviando items:', requestItems);
      try {
        await onAdd(requestItems);
        console.log('✅ Items agregados exitosamente, limpiando lista');
        setItems([]);
        onClearItems?.();
      } catch (error) {
        console.error('❌ Error al agregar items, manteniendo lista:', error);
      }
    }
  };

  return (
    <div>
      <BookAutocomplete onSelect={addItem} disabled={disabled} />
      {items.length > 0 && (
        <>
          <ul style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {items.map((item, idx) => (
              <li key={idx}>{item.title} - Cant: {item.quantitySent} - Precio: ${item.salePrice}</li>
            ))}
          </ul>
          <button onClick={handleSubmit} disabled={disabled} style={{ marginTop: '1rem' }}>
            Agregar libros al envío ({items.length})
          </button>
        </>
      )}
      {items.length === 0 && (
        <p style={{ marginTop: '1rem', color: '#999' }}>Busca un libro y agregalo a la lista.</p>
      )}
    </div>
  );
};

export default DispatchForm;
export {};