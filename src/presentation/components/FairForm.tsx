import React, { useState } from 'react';
import { CreateFairPayload } from '../../domain/repositories/IFairRepository';
import { User } from '../../domain/entities/User';

interface Props {
  onSubmit: (fair: CreateFairPayload) => void;
  users: User[];
}

const FairForm: React.FC<Props> = ({ onSubmit, users }) => {
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [respId, setRespId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      place,
      startDate: start,
      endDate: end,
      responsibleUserId: Number(respId),
    });
    setName(''); setPlace(''); setStart(''); setEnd(''); setRespId('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Nombre feria" value={name} onChange={e => setName(e.target.value)} required />
      <input placeholder="Lugar" value={place} onChange={e => setPlace(e.target.value)} />
      <input type="date" value={start} onChange={e => setStart(e.target.value)} required />
      <input type="date" value={end} onChange={e => setEnd(e.target.value)} required />
      <select value={respId} onChange={e => setRespId(e.target.value)} required>
        <option value="">Seleccione responsable</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.name || user.email || `Usuario ${user.id}`}
          </option>
        ))}
      </select>
      <button type="submit" style={{ background: '#098a3f', color: 'white' }}>Crear Feria</button>
    </form>
  );
};

export default FairForm;
export {};