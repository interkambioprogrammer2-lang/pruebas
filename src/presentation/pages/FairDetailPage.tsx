import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Fair } from '../../domain/entities/Fair';
import { DispatchItemRequest, ReturnRequest, CreateFairPayload } from '../../domain/repositories/IFairRepository';
import {
  getFairDetail,
  addDispatchItems,
  confirmDispatch,
  recordReturn,
  downloadReport,
  updateFair,
  getAllUsers,
} from '../../container/dependencies';
import DispatchForm from '../components/DispatchForm';
import ReturnForm from '../components/ReturnForm';
import EditFairForm from '../components/EditFairForm';
import { User } from '../../domain/entities/User';

const FairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fair, setFair] = useState<Fair | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const getErrorMessage = (error: any, fallback: string) => {
    const responseData = error?.response?.data;

    if (typeof responseData === 'string' && responseData.trim() !== '') {
      return responseData;
    }

    if (typeof responseData?.message === 'string' && responseData.message.trim() !== '') {
      return responseData.message;
    }

    return error?.message || fallback;
  };

  const loadFair = async () => {
    if (!id) return;
    try {
      const data = await getFairDetail.execute(Number(id));
      setFair(data);
    } catch (error) {
      console.error('Error cargando feria', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFair();
    getAllUsers.execute().then(setUsers).catch(() => {});
  }, [id]);

  const handleAddItems = async (items: DispatchItemRequest[]) => {
    await addDispatchItems.execute(Number(id), items);
    loadFair();
  };

  const handleConfirm = async () => {
    await confirmDispatch.execute(Number(id));
    loadFair();
  };

  const handleReturn = async (returns: ReturnRequest[]) => {
    await recordReturn.execute(Number(id), returns);
    loadFair();
  };

  const handleDownloadSendOut = async () => {
    try {
      const blob = await downloadReport.sendOut(Number(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salida_feria_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Error al descargar PDF de envío: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDownloadFinal = async () => {
    try {
      const blob = await downloadReport.final(Number(id));
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumen_feria_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert('Error al descargar PDF final: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditSave = async (fairData: CreateFairPayload) => {
    try {
      await updateFair.execute(Number(id), fairData);
      setEditing(false);
      loadFair();
    } catch (error: any) {
      alert('Error al guardar feria: ' + getErrorMessage(error, 'No se pudo actualizar la feria.'));
    }
  };

  if (loading) return <div className="loading">Cargando feria...</div>;
  if (!fair) return <div className="error">No se encontró la feria</div>;

  return (
    <div className="page fair-detail-page">
      <Link to="/" className="secondary">← Volver a ferias</Link>
      <h1>{fair.name}</h1>
      <div className="fair-meta-grid">
        <p><strong>Lugar:</strong> {fair.place || 'No especificado'}</p>
        <p><strong>Fechas:</strong> {fair.startDate} – {fair.endDate}</p>
        <p><strong>Estado:</strong> <span className={`status-badge status-${fair.status}`}>{fair.status}</span></p>
      </div>

      <div className="page-actions">
        <button onClick={handleDownloadSendOut}>📄 Descargar PDF de envío</button>
        {fair.status === 'CLOSED' && (
          <button onClick={handleDownloadFinal}>📊 Descargar resumen final</button>
        )}
        <button onClick={() => setEditing(!editing)}>✏️ Editar</button>
      </div>

      {editing && (
        <EditFairForm
          initial={{
            id: fair.id!,
            name: fair.name,
            place: fair.place,
            startDate: fair.startDate,
            endDate: fair.endDate,
            responsibleUserId: fair.responsibleUserId ?? fair.responsible?.id ?? 0,
            status: fair.status,
          }}
          users={users} 
          onSave={handleEditSave}
          onCancel={() => setEditing(false)}
        />
      )}

      <hr />

      {fair.status === 'DRAFT' && (
        <div className="card">
          <h2>Agregar libros al envío</h2>
          <DispatchForm onAdd={handleAddItems} disabled={false} />
          <button onClick={handleConfirm} className="confirm-dispatch-btn">Confirmar envío</button>
        </div>
      )}

      {fair.status !== 'DRAFT' && fair.dispatchItems && fair.dispatchItems.length > 0 && (
        <div className="card">
          <h2>Libros enviados</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>ID Libro</th>
                  <th>Título</th>
                  <th>Precio venta</th>
                  <th>Fecha envío</th>
                  <th>Fecha retorno</th>
                  <th>Enviado</th>
                  <th>Retornado</th>
                </tr>
              </thead>
              <tbody>
                {fair.dispatchItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.bookId}</td>
                    <td>{item.title}</td>
                    <td>${item.salePrice}</td>
                    <td>{item.sentDate ? new Date(item.sentDate).toLocaleDateString() : '-'}</td>
                    <td>{item.returnedDate ? new Date(item.returnedDate).toLocaleDateString() : '-'}</td>
                    <td>{item.quantitySent}</td>
                    <td>{item.quantityReturned ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {fair.status === 'DISPATCHED' && (
        <div className="card">
          <h2>Registrar retorno</h2>
          <ReturnForm items={fair.dispatchItems || []} onReturn={handleReturn} />
        </div>
      )}

      {fair.status === 'CLOSED' && fair.dispatchItems && (
        <div className="card">
          <h2>Resumen final</h2>
          <div className="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Enviado</th>
                  <th>Retornado</th>
                  <th>Vendido (calc)</th>
                  <th>Faltantes</th>
                </tr>
              </thead>
              <tbody>
                {fair.dispatchItems.map(item => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.quantitySent}</td>
                    <td>{item.quantityReturned ?? '-'}</td>
                    <td>{(item.quantitySent - (item.quantityReturned || 0))}</td>
                    <td>{(item as any).faltantes ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FairDetailPage;
export {};
