import React from 'react';
import { Link } from 'react-router-dom';
import { Fair } from '../../domain/entities/Fair';

interface Props {
  fairs: Fair[];
}

const FairList: React.FC<Props> = ({ fairs }) => {
  if (fairs.length === 0) {
    return <p>No hay ferias registradas.</p>;
  }

  return (
    <ul>
      {fairs.map(fair => (
        <li key={fair.id}>
          <Link to={`/fair/${fair.id}`}>{fair.name || 'Sin nombre'}</Link>
          <span className={`status-badge status-${fair.status}`}>{fair.status}</span>
        </li>
      ))}
    </ul>
  );
};

export default FairList;
export {};