import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Fair } from '../../domain/entities/Fair';
import { removeDispatchItem } from '../../container/dependencies';
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
import apiClient from '../../infrastructure/http/apiClient';

const FairDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [fair, setFair] = useState<Fair | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchSent, setSearchSent] = useState('');
  const [searchReturn, setSearchReturn] = useState('');

  const getErrorMessage = (error: any, fallback: string) => {
    const responseData = error?.response?.data;
    if (typeof responseData === 'string' && responseData.trim() !== '') return responseData;
    if (typeof responseData?.message === 'string' && responseData.message.trim() !== '') return responseData.message;
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
    setLoading(true);
    loadFair();
  }, [id]);

  // Consulta el stock actual de un libro en un almacén
  const getStockDisponible = async (bookId: number, warehouseId: number): Promise<number> => {
    try {
      const response = await fetch(`http://localhost:8080/api/books/${bookId}/stock?warehouseId=${warehouseId}`);
      if (!response.ok) throw new Error('No se pudo obtener el stock');
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error('Error obteniendo stock', error);
      return 0;
    }
  };

  const handleAddItems = async (items: DispatchItemRequest[]) => {
    // Verificar duplicados
    const existingBookIds = fair?.dispatchItems?.map(item => item.bookId) || [];
    const duplicates = items.filter(item => existingBookIds.includes(item.bookId));

    if (duplicates.length > 0) {
      const duplicateTitles = duplicates.map(dup => {
        const existing = fair?.dispatchItems?.find(d => d.bookId === dup.bookId);
        return existing?.title || `Libro #${dup.bookId}`;
      }).join(', ');

      Swal.fire({
        icon: 'warning',
        title: 'Libros ya agregados',
        html: `<p>Los siguientes libros ya están en la lista de envío:</p><p><strong>${duplicateTitles}</strong></p>`,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    // Si no hay duplicados, agregar normalmente
    try {
      await addDispatchItems.execute(Number(id), items);
      await loadFair();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al agregar libros',
        text: getErrorMessage(error, 'No se pudieron agregar los libros.'),
      });
      throw error;
    }
  };

  const handleConfirm = async () => {
    if (!fair?.dispatchItems || fair.dispatchItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Sin libros',
        text: 'No hay libros agregados para confirmar el envío.',
      });
      return;
    }

    // Verificar stock disponible para cada libro
    const stockChecks = await Promise.all(
      fair.dispatchItems.map(async (item) => {
        const warehouseId = item.sourceLocation?.id || 1;
        const disponible = await getStockDisponible(item.bookId, warehouseId);
        return { ...item, disponible };
      })
    );

    const insufficient = stockChecks.filter(item => item.disponible < item.quantitySent);

    if (insufficient.length > 0) {
      const lista = insufficient.map(item => 
        `<tr>
          <td>${item.title}</td>
          <td>${item.quantitySent}</td>
          <td style="color:red">${item.disponible}</td>
        </tr>`
      ).join('');

      Swal.fire({
        icon: 'error',
        title: 'Stock insuficiente',
        html: `
          <p>Los siguientes libros no tienen suficiente stock en el almacén seleccionado:</p>
          <table border="1" cellpadding="5" style="margin:0 auto; text-align:center; border-collapse:collapse;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th>Título</th>
                <th>Solicitado</th>
                <th>Disponible</th>
              </tr>
            </thead>
            <tbody>
              ${lista}
            </tbody>
          </table>
          <p style="margin-top:10px">Por favor ajusta las cantidades o selecciona otro almacén.</p>
        `,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    try {
      await confirmDispatch.execute(Number(id));
      Swal.fire({
        icon: 'success',
        title: 'Envío confirmado',
        text: 'El inventario ha sido actualizado correctamente.',
      });
      loadFair();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al confirmar envío',
        text: getErrorMessage(error, 'No se pudo confirmar el envío.'),
      });
    }
  };

  const handleReturn = async (returns: ReturnRequest[]) => {
    try {
      await recordReturn.execute(Number(id), returns);
      Swal.fire({
        icon: 'success',
        title: 'Retorno registrado',
        text: 'El inventario ha sido actualizado.',
      });
      loadFair();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar retorno',
        text: getErrorMessage(error, 'No se pudo registrar el retorno.'),
      });
    }
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
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar PDF',
        text: error.response?.data?.message || error.message,
      });
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
      Swal.fire({
        icon: 'error',
        title: 'Error al descargar resumen',
        text: error.response?.data?.message || error.message,
      });
    }
  };

  // Función para editar un libro (elimina y vuelve a agregar con nuevos valores)
  const handleEditItem = async (item: any) => {
    const { value: formValues } = await Swal.fire({
      title: 'Editar libro',
      html: `
        <label>Cantidad:</label>
        <input id="swal-quantity" class="swal2-input" type="number" value="${item.quantitySent}" min="1">
        <label>Precio venta:</label>
        <input id="swal-price" class="swal2-input" type="number" value="${item.salePrice}" min="0" step="0.01">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const quantity = (document.getElementById('swal-quantity') as HTMLInputElement)?.value;
        const price = (document.getElementById('swal-price') as HTMLInputElement)?.value;
        if (!quantity || !price) {
          Swal.showValidationMessage('Ambos campos son obligatorios');
          return false;
        }
        return { quantity: Number(quantity), price: Number(price) };
      }
    });

    if (formValues) {
      try {
        // Eliminar el ítem actual
        await removeDispatchItem.execute(Number(id), item.id);
        // Agregar uno nuevo con los valores actualizados
        await addDispatchItems.execute(Number(id), [{
          bookId: item.bookId,
          quantitySent: formValues.quantity,
          salePrice: formValues.price,
          sourceLocationId: item.sourceLocation?.id || item.sourceLocationId || 1,
        }]);
        loadFair();
        Swal.fire({
          icon: 'success',
          title: 'Libro actualizado',
          text: 'Los cambios se han guardado correctamente.',
        });
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error al editar',
          text: error.response?.data?.message || error.message,
        });
      }
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

      {/* Tabla de libros enviados (con buscador) */}
      {fair.dispatchItems && fair.dispatchItems.length > 0 && (
        <div className="card">
          <h2>Libros enviados</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Buscar por título o SKU..."
              value={searchSent}
              onChange={(e) => setSearchSent(e.target.value)}
              style={{ padding: '8px 12px', width: '100%', maxWidth: '400px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
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
                {fair.dispatchItems
                  .filter(item =>
                    item.title.toLowerCase().includes(searchSent.toLowerCase()) ||
                    item.sku.toLowerCase().includes(searchSent.toLowerCase())
                  )
                  .map(item => (
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
                          <div className="table-actions">
                            <button
                              onClick={() => handleEditItem(item)}
                              style={{ background: '#ec9726', color: 'white', marginRight: '5px' }}
                            >
                              Editar
                            </button>
                            <button
                              className="danger"
                              style={{ background: '#dc3545', color: 'white' }}
                              onClick={async () => {
                                const result = await Swal.fire({
                                  icon: 'warning',
                                  title: '¿Eliminar este libro?',
                                  text: '¿Estás seguro de que deseas eliminar este libro de la feria?',
                                  showCancelButton: true,
                                  confirmButtonText: 'Sí, eliminar',
                                  cancelButtonText: 'Cancelar',
                                });
                                if (result.isConfirmed) {
                                  try {
                                    await removeDispatchItem.execute(Number(id), item.id);
                                    loadFair();
                                  } catch (error: any) {
                                    Swal.fire({
                                      icon: 'error',
                                      title: 'Error al eliminar',
                                      text: error.response?.data?.message || error.message,
                                    });
                                  }
                                }
                              }}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formulario de retorno (con buscador) */}
      {fair.status === 'DISPATCHED' && (
        <div className="card">
          <h2>Registrar retorno</h2>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchReturn}
              onChange={(e) => setSearchReturn(e.target.value)}
              style={{ padding: '8px 12px', width: '100%', maxWidth: '400px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>
          <ReturnForm
            items={(fair.dispatchItems || []).filter(item =>
              item.title.toLowerCase().includes(searchReturn.toLowerCase())
            )}
            onReturn={handleReturn}
          />
        </div>
      )}

      {/* Resumen final (CLOSED) con filtro */}
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
                {fair.dispatchItems
                  .filter(item =>
                    item.title.toLowerCase().includes(searchSent.toLowerCase())
                  )
                  .map(item => (
                    <tr key={item.id}>
                      <td>{item.title}</td>
                      <td>{item.quantitySent}</td>
                      <td>{item.quantityReturned ?? '-'}</td>
                      <td>{(item.quantitySent - (item.quantityReturned || 0))}</td>
                      <td>{(item as any).faltantes ?? ''}</td>
                    </tr>
                  ))
                }
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