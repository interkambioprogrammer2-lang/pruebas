import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { CreateFairPayload } from '../../domain/repositories/IFairRepository';
import { User } from '../../domain/entities/User';

interface Props {
  onSubmit: (fair: CreateFairPayload) => void;
  users: User[];
}

// Devuelve la fecha actual en formato YYYY-MM-DD
const getToday = (): string => new Date().toISOString().split('T')[0];

const FairForm: React.FC<Props> = ({ onSubmit, users }) => {
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [respId, setRespId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones de fecha
    if (start < getToday()) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha de inicio debe ser mayor o igual a la fecha actual.',
      });
      return;
    }
    if (end < start) {
      Swal.fire({
        icon: 'warning',
        title: 'Fecha inválida',
        text: 'La fecha de término debe ser mayor o igual a la fecha de inicio.',
      });
      return;
    }

    onSubmit({
      name,
      place,
      startDate: start,
      endDate: end,
      responsibleUserId: Number(respId),
    });

    // Limpiar formulario
    setName('');
    setPlace('');
    setStart('');
    setEnd('');
    setRespId('');
  };

  return (
    <div className="card" style={{ marginBottom: '20px' }}>
      <h2>Crear Feria</h2>
      <form onSubmit={handleSubmit} className="form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Campos en fila: Nombre y Lugar */}
        <div className="selected-book-fields">
          <label className="selected-book-field">
            Nombre *
            <input
              placeholder="Ej. Feria del Libro 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="selected-book-field">
            Lugar
            <input
              placeholder="Dirección o sede"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          </label>
        </div>

        {/* Fechas */}
        <div className="selected-book-fields">
          <label className="selected-book-field">
            Fecha de inicio *
            <input
              type="date"
              value={start}
              min={getToday()}
              onChange={(e) => {
                setStart(e.target.value);
                // Si la fecha fin es anterior a la nueva inicio, la reseteamos
                if (end && e.target.value > end) {
                  setEnd('');
                }
              }}
              required
            />
          </label>
          <label className="selected-book-field">
            Fecha de término *
            <input
              type="date"
              value={end}
              min={start || getToday()}
              onChange={(e) => setEnd(e.target.value)}
              required
            />
          </label>
        </div>

        {/* Responsable */}
        <div className="selected-book-fields">
          <label className="selected-book-field">
            Responsable *
            <select
              value={respId}
              onChange={(e) => setRespId(e.target.value)}
              required
            >
              <option value="">Seleccione responsable</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email || `Usuario ${user.id}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Acciones */}
        <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
          <button type="submit" style={{ background: '#098a3f', color: 'white' }}>
            + Crear Feria
          </button>
        </div>
      </form>
    </div>
  );
};

export default FairForm;
export {};