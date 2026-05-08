import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Fair } from '../../domain/entities/Fair';
import { DispatchItemRequest, ReturnRequest } from '../../domain/repositories/IFairRepository';
import {
  getFairDetail,
  addDispatchItems,
  confirmDispatch,
  recordReturn,
  downloadReport,
} from '../../container/dependencies';
import DispatchForm from '../components/DispatchForm';
import ReturnForm from '../components/ReturnForm';

const FairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fair, setFair] = useState<Fair | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, [id]);

  const handleAddItems = async (items: DispatchItemRequest[]) => {
    try {
      await addDispatchItems.execute(Number(id), items);
      loadFair();
    } catch (error: any) {
      alert('Error al agregar libros: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleConfirm = async () => {
    await confirmDispatch.execute(Number(id));
    loadFair();
  };

  const handleReturn = async (returns: ReturnRequest[]) => {
    await recordReturn.execute(Number(id), returns);
    loadFair();
  };

  const handleDownloadSendOut = () => {
    downloadReport.sendOut(Number(id));
  };

  const handleDownloadFinal = () => {
    downloadReport.final(Number(id)).then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resumen_feria_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

  if (loading) return <div className="loading">Cargando feria...</div>;
  if (!fair) return <div className="error">No se encontró la feria</div>;

  return (
    <div>
      <Link to="/" className="secondary">← Volver a ferias</Link>
      <h1>{fair.name}</h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
        <p><strong>Lugar:</strong> {fair.place || 'No especificado'}</p>
        <p><strong>Fechas:</strong> {fair.startDate} – {fair.endDate}</p>
        <p>
          <strong>Estado:</strong> 
          <span className={`status-badge status-${fair.status}`}>{fair.status}</span>
        </p>
      </div>

      <div>
        <button onClick={handleDownloadSendOut}>📄 Descargar PDF de envío</button>
        {fair.status === 'CLOSED' && (
          <button onClick={handleDownloadFinal}>📊 Descargar resumen final</button>
        )}
      </div>

      <hr />

      {/* Sección de envío (DRAFT) */}
      {fair.status === 'DRAFT' && (
        <div className="card">
          <h2>Agregar libros al envío</h2>
          <DispatchForm onAdd={handleAddItems} disabled={false} />
          <button onClick={handleConfirm} style={{ marginTop: 15 }}>Confirmar envío</button>
        </div>
      )}

      {/* Tabla de libros enviados (cuando ya no es DRAFT) */}
      {fair.status !== 'DRAFT' && fair.dispatchItems && fair.dispatchItems.length > 0 && (
        <div className="card">
          <h2>Libros enviados</h2>
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
      )}
    </div>
  );
};

export default FairDetailPage;
export {};