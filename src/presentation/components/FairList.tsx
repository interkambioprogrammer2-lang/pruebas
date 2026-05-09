import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fair } from '../../domain/entities/Fair';
import { User } from '../../domain/entities/User';
import { CreateFairPayload } from '../../domain/repositories/IFairRepository';
import { deleteFair } from '../../container/dependencies'; // <-- nuevo

interface Props {
  fairs: Fair[];
  users: User[];
  onUpdate: (fairId: number, fair: CreateFairPayload) => Promise<void>;
  onDelete: () => void; // <-- nuevo: callback para refrescar la lista después de eliminar
}

const formatDateForInput = (value: string): string => {
  if (!value) return '';
  if (value.includes('T')) return value.split('T')[0];
  return value;
};

const FairList: React.FC<Props> = ({ fairs, users, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CreateFairPayload>({
    name: '',
    place: '',
    startDate: '',
    endDate: '',
    responsibleUserId: 0,
  });

  const beginEdit = (fair: Fair) => {
    if (!fair.id) return;
    setEditingId(fair.id);
    setFormData({
      name: fair.name || '',
      place: fair.place || '',
      startDate: formatDateForInput(fair.startDate),
      endDate: formatDateForInput(fair.endDate),
      responsibleUserId: fair.responsible?.id || 0,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!editingId) return;
    if (!formData.name.trim()) {
      alert('El nombre de la feria es obligatorio.');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('Debes ingresar fecha de inicio y fecha de término.');
      return;
    }
    if (!formData.responsibleUserId) {
      alert('Debes seleccionar un responsable.');
      return;
    }

    setSaving(true);
    try {
      await onUpdate(editingId, formData);
      setEditingId(null);
    } catch (error: any) {
      alert('Error al guardar cambios: ' + (error?.response?.data?.message || error?.message || 'Error inesperado.'));
    } finally {
      setSaving(false);
    }
  };

  // --- NUEVO: eliminar feria ---
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (window.confirm('¿Estás seguro de eliminar esta feria?')) {
      try {
        await deleteFair.execute(id);
        onDelete();
      } catch (error) {
        alert('Error al eliminar la feria');
      }
    }
  };

  if (fairs.length === 0) {
    return <p>No hay ferias registradas.</p>;
  }

  return (
    <div className="table-responsive">
      <table className="fair-list-table">
        <thead>
          <tr>
            <th>Nombre de feria</th>
            <th>Lugar</th>
            <th>Fecha de inicio</th>
            <th>Fecha de término</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Detalle</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {fairs.map((fair) => {
            const isEditing = fair.id === editingId;

            return (
              <tr key={fair.id}>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={saving}
                    />
                  ) : (
                    fair.name || 'Sin nombre'
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.place}
                      onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                      disabled={saving}
                    />
                  ) : (
                    fair.place || '-'
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      disabled={saving}
                    />
                  ) : (
                    formatDateForInput(fair.startDate)
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      disabled={saving}
                    />
                  ) : (
                    formatDateForInput(fair.endDate)
                  )}
                </td>
                <td>
                  {isEditing ? (
                    <select
                      value={formData.responsibleUserId}
                      onChange={(e) => setFormData({ ...formData, responsibleUserId: Number(e.target.value) })}
                      disabled={saving}
                    >
                      <option value={0}>Seleccione responsable</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name || user.email || `Usuario ${user.id}`}
                        </option>
                      ))}
                    </select>
                  ) : (() => {
                    const responsibleUser = users.find((u) => u.id === fair.responsible?.id);
                    return responsibleUser?.name || fair.responsible?.name || `Usuario ${fair.responsible?.id ?? ''}`;
                  })()}
                </td>
                <td>
                  <span className={`status-badge status-${fair.status}`}>{fair.status}</span>
                </td>
                <td>
                  {fair.id ? <Link to={`/fair/${fair.id}`}>Abrir</Link> : '-'}
                </td>
                <td className="table-actions-cell">
                  {isEditing ? (
                    <div className="table-actions">
                      <button onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button className="secondary" onClick={cancelEdit} disabled={saving}>
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="table-actions">
                      <button onClick={() => beginEdit(fair)} disabled={saving || !fair.id}>
                        Editar
                      </button>
                      {/* NUEVO: botón Eliminar */}
                      <button onClick={(e) => handleDelete(e, fair.id!)}
                        style={{ background: '#dc3545', color: 'white' }}
                        disabled={saving}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default FairList;
export {};