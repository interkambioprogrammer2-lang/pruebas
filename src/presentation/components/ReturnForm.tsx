import React, { useState } from 'react';
import { DispatchItem, ReturnRequest } from '../../domain/repositories/IFairRepository';

interface Props {
  items: DispatchItem[];
  onReturn: (returns: ReturnRequest[]) => void;
}

const ReturnForm: React.FC<Props> = ({ items, onReturn }) => {
  // Los inputs se manejan como strings para permitir campos vacíos
  const [returns, setReturns] = useState<Record<number, { returned: string; soldManual: string }>>({});

  const handleChange = (id: number, field: 'returned' | 'soldManual', value: string) => {
    setReturns(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    const result: ReturnRequest[] = items.map(item => {
      const r = returns[item.id];
      const quantityReturned = r?.returned && r.returned.trim() !== '' ? Number(r.returned) : 0;
      const quantitySoldManual = r?.soldManual && r.soldManual.trim() !== '' ? Number(r.soldManual) : undefined;
      return {
        dispatchItemId: item.id,
        quantityReturned,
        quantitySoldManual
      };
    });
    onReturn(result);
  };

  return (
    <div>
      <h3>Registro de retorno</h3>
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Enviado</th>
            <th>Retornado</th>
            <th>Vendido (manual)</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.title}</td>
              <td>{item.quantitySent}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max={item.quantitySent}
                  value={returns[item.id]?.returned ?? ''}
                  onChange={(e) => handleChange(item.id, 'returned', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={returns[item.id]?.soldManual ?? ''}
                  onChange={(e) => handleChange(item.id, 'soldManual', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSubmit}>Registrar retorno</button>
    </div>
  );
};

export default ReturnForm;
export {};