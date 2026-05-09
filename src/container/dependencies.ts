import { FairRepository } from '../infrastructure/repositories/FairRepository';
import { BookRepository } from '../infrastructure/repositories/BookRepository';
import { WarehouseRepository } from '../infrastructure/repositories/WarehouseRepository';
import { GetFairs } from '../application/fair/GetFairs';
import { CreateFair } from '../application/fair/CreateFair';
import { UpdateFair } from '../application/fair/UpdateFair';
import { AddDispatchItems } from '../application/fair/AddDispatchItems';
import { ConfirmDispatch } from '../application/fair/ConfirmDispatch';
import { RecordReturn } from '../application/fair/RecordReturn';
import { GetFairDetail } from '../application/fair/GetFairDetail';
import { DownloadReport } from '../application/fair/DownloadReport';
import { SearchBooks } from '../application/book/SearchBooks';
import { GetAllWarehouses } from '../application/warehouse/GetAllWarehouses';
import { UserRepository } from '../infrastructure/repositories/UserRepository';
import { GetAllUsers } from '../application/user/GetAllUsers';
import { DeleteFair } from '../application/fair/DeleteFair';


const fairRepo = new FairRepository();
const bookRepo = new BookRepository();
const warehouseRepo = new WarehouseRepository();
const userRepo = new UserRepository();


export const getFairs = new GetFairs(fairRepo);
export const createFair = new CreateFair(fairRepo);
export const updateFair = new UpdateFair(fairRepo);
export const getFairDetail = new GetFairDetail(fairRepo);
export const addDispatchItems = new AddDispatchItems(fairRepo);
export const confirmDispatch = new ConfirmDispatch(fairRepo);
export const recordReturn = new RecordReturn(fairRepo);
export const downloadReport = new DownloadReport(fairRepo);
export const searchBooks = new SearchBooks(bookRepo);
export const getAllWarehouses = new GetAllWarehouses(warehouseRepo);
export const getAllUsers = new GetAllUsers(userRepo);
export const deleteFair = new DeleteFair(fairRepo);
