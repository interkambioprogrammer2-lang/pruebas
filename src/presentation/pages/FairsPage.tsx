import React, { useEffect, useState } from 'react';
import { Fair } from '../../domain/entities/Fair';
import { CreateFairPayload } from '../../domain/repositories/IFairRepository';
import { getFairs, createFair, updateFair, getAllUsers } from '../../container/dependencies';
import FairList from '../components/FairList';
import FairForm from '../components/FairForm';
import { User } from '../../domain/entities/User';

const FairsPage: React.FC = () => {
  const [fairs, setFairs] = useState<Fair[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const loadFairs = async () => {
    const data = await getFairs.execute();
    setFairs(data);
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers.execute();
      setUsers(data);
    } catch (error) {
      console.error('Error cargando usuarios', error);
    }
  };

  useEffect(() => {
    loadFairs();
    loadUsers();
  }, []);

  const handleCreate = async (fair: CreateFairPayload) => {
    await createFair.execute(fair);
    loadFairs();
  };

  const handleUpdate = async (fairId: number, fair: CreateFairPayload) => {
    await updateFair.execute(fairId, fair);
    loadFairs();
  };

  return (
    <div className="page fairs-page">
      <h1>Ferias</h1>
      <FairForm onSubmit={handleCreate} users={users} />
<FairList fairs={fairs} users={users} onUpdate={handleUpdate} onDelete={loadFairs} />      
    </div>
  );
};

export default FairsPage;
export {};
