import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Fair } from '../../domain/entities/Fair';
import { removeDispatchItem } from '../../container/dependencies';
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
      console.log('🔄 Cargando feria...', id);
      const data = await getFairDetail.execute(Number(id));
      console.log('📥 Feria cargada:', data);
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
    try {
      console.log('📨 handleAddItems llamado con:', items);
      await addDispatchItems.execute(Number(id), items);
      console.log('✅ addDispatchItems completado, llamando loadFair');
      await loadFair();
      console.log('✅ loadFair completado');
    } catch (error: any) {
      console.error('Error detallado:', error.response?.data);
      alert('Error al agregar libros: ' + getErrorMessage(error, 'No se pudieron agregar los libros.'));
      throw error;
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmDispatch.execute(Number(id));
      loadFair();
    } catch (error: any) {
      alert('Error al confirmar envío: ' + getErrorMessage(error, 'No se pudo confirmar el envío.'));
    }
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
  <div>
    <Link to="/" className="secondary">← Volver a ferias</Link>
    <h1>{fair.name}</h1>
    
    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '10px' }}>
      <p><strong>Lugar:</strong> {fair.place || 'No especificado'}</p>
      <p><strong>Fechas:</strong> {fair.startDate} – {fair.endDate}</p>
      <p>
        <strong>Estado:</strong> 
        <span className={`status-badge status-${fair.status}`}>{fair.status}</span>
      </p>
    </div>

    <div>
      <button onClick={handleDownloadSendOut}>📄 PDF de envío</button>
      {fair.status === 'CLOSED' && (
        <button onClick={handleDownloadFinal}>📊 PDF resumen final</button>
      )}
    </div>

    <hr />

    {/* Sección de envío (solo OPEN) */}
    {fair.status === 'OPEN' && (
      <div className="card">
        <h2>Agregar libros al envío</h2>
        <DispatchForm onAdd={handleAddItems} disabled={false} />
        <button onClick={handleConfirm} style={{ background: '#098a3f', color: 'white' }}>Confirmar envío</button>
      </div>
    )}

    {/* Tabla de libros enviados (cuando ya no es OPEN) */}
    {fair.dispatchItems && fair.dispatchItems.length > 0 && (
      <div className="card">
        <h2>Libros enviados</h2>
        <div className="table-responsive">
          <table style={{ minWidth: '700px' }}>
            <thead>
              <tr>
                <th>ID Libro</th>
                <th>Título</th>
                <th>Precio venta</th>
                <th>Fecha envío</th>
                <th>Fecha retorno</th>
                <th>Enviado</th>
                <th>Retornado</th>
                {fair.status === 'OPEN' && <th>Acción</th>}
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
                  {fair.status === 'OPEN' && (
                    <td>
                      <button
                        className="danger"
                        style={{ background: '#dc3545', color: 'white' }}
                        onClick={async () => {
                          if (window.confirm('¿Eliminar este libro de la feria?')) {
                            try {
                              await removeDispatchItem.execute(Number(id), item.id);
                              loadFair();
                            } catch (error: any) {
                              alert('Error al eliminar: ' + (error.response?.data?.message || error.message));
                            }
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Formulario de retorno (DISPATCHED) */}
    {fair.status === 'DISPATCHED' && (
      <div className="card">
        <h2>Registrar retorno</h2>
        <ReturnForm items={fair.dispatchItems || []} onReturn={handleReturn} />
      </div>
    )}

    {/* Resumen final (CLOSED) */}
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
