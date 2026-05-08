import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
}

const FairBooksPage = () => {
  const { fairId } = useParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [fairName, setFairName] = useState('');

  useEffect(() => {
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
    const updated = await axios.get(`/api/fairs/${fairId}/books`);
    setBooks(updated.data);
  };

  return (
    <div>
      <h2>Libros de la feria: {fairName}</h2>
      {/* Aquí más adelante pondrás un buscador de libros */}
      <ul>
        {books.map(book => (
          <li key={book.id}>{book.title} por {book.author}</li>
        ))}
      </ul>
    </div>
  );
};

export default FairBooksPage;