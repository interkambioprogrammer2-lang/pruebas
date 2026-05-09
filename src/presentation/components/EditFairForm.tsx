import React, { useState } from 'react';
import { CreateFairPayload } from '../../domain/repositories/IFairRepository';
import { User } from '../../domain/entities/User';

interface Props {
  initial: {
    id: number;
    name: string;
    place: string;
    startDate: string;
    endDate: string;
    responsibleUserId: number;
    status?: string;
  };
  users: User[];
  onSave: (fair: CreateFairPayload) => Promise<void>;
  onCancel: () => void;
}

const normalizeDate = (value: string): string => {
  if (!value) return '';
  return value.includes('T') ? value.split('T')[0] : value;
};

const EditFairForm: React.FC<Props> = ({ initial, users, onSave, onCancel }) => {
  const [name, setName] = useState(initial.name);
  const [place, setPlace] = useState(initial.place || '');
  const [startDate, setStartDate] = useState(normalizeDate(initial.startDate));
  const [endDate, setEndDate] = useState(normalizeDate(initial.endDate));
  const [responsibleUserId, setResponsibleUserId] = useState(initial.responsibleUserId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responsibleUserId) {
      alert('Debes seleccionar un responsable.');
      return;
    }

    await onSave({
      name: name.trim(),
      place: place.trim(),
      startDate: normalizeDate(startDate),
      endDate: normalizeDate(endDate),
      responsibleUserId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Editar Feria</h3>
      <label>Nombre:
        <input value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>Lugar:
        <input value={place} onChange={e => setPlace(e.target.value)} />
      </label>
      <label>Inicio:
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
      </label>
      <label>Fin:
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
      </label>
      <label>Responsable:
        <select value={responsibleUserId} onChange={e => setResponsibleUserId(Number(e.target.value))}>
          <option value={0}>Seleccione responsable</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name || user.email}</option>
          ))}
        </select>
      </label>
      <div className="form-actions">
        <button type="submit">Guardar cambios</button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
};

export default EditFairForm;
export {};
