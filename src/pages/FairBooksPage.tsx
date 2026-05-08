import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string; // opcional
}

const FairBooksPage = () => {
  const { fairId } = useParams();
  const [books, setBooks] = useState<Book[]>([]);  // ← tipado
  const [fairName, setFairName] = useState('');

  useEffect(() => {
    // Cargar detalles de la feria y sus libros
    const fetchFairAndBooks = async () => {
      const fairRes = await axios.get(`/api/fairs/${fairId}`);
      setFairName(fairRes.data.name);
      const booksRes = await axios.get(`/api/fairs/${fairId}/books`);
      setBooks(booksRes.data);
    };
    fetchFairAndBooks();
  }, [fairId]);

  const handleAddBook = async (bookId: number) => {
    await axios.post(`/api/fairs/${fairId}/books`, { bookId });
    // Refrescar la lista de libros
    const updated = await axios.get(`/api/fairs/${fairId}/books`);
    setBooks(updated.data);
  };

  return (
    <div>
      <h2>Libros de la feria: {fairName}</h2>
      {/* Aquí un buscador de libros y botón para añadir */}
      {/* Listado de libros actuales */}
      <ul>
        {books.map(book => (
          <li key={book.id}>{book.title} por {book.author}</li>
        ))}
      </ul>
    </div>
  );
};