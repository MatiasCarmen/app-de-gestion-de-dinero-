// Lightweight in-memory mock replacement for Firebase Firestore
// This module allows the app to run and be deployed without the real
// `firebase` package. It implements a minimal subset of the Firestore
// API used by the app (collection, doc, addDoc, setDoc, getDoc, deleteDoc,
// onSnapshot, query, orderBy, serverTimestamp and Timestamp).

type DocData = Record<string, any>;

class MockTimestamp {
  private _d: Date;
  constructor(d: Date) {
    this._d = d;
  }
  toDate() {
    return this._d;
  }
  static fromDate(d: Date) {
    return new MockTimestamp(d);
  }
}

const store: Record<string, Map<string, DocData>> = {};

function ensureCollection(name: string) {
  if (!store[name]) store[name] = new Map();
  return store[name];
}

function collection(_db: any, name: string) {
  return { __collection: name };
}

function doc(dbRef: any, collectionNameOrRef: any, id?: string) {
  // support both doc(db, 'collection', id) and doc(collectionRef, id)
  if (collectionNameOrRef && typeof collectionNameOrRef === 'object' && (collectionNameOrRef as any).__collection) {
    const col = (collectionNameOrRef as any).__collection;
    return { __collection: col, id };
  }
  return { __collection: collectionNameOrRef, id };
}

async function addDoc(collectionRef: any, data: DocData) {
  const colName = collectionRef.__collection;
  const col = ensureCollection(colName);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const entry = { ...data };
  // If createdAt is a MockTimestamp, store the date
  if (entry.createdAt instanceof MockTimestamp) {
    entry.createdAt = entry.createdAt.toDate();
  }
  col.set(id, entry);
  return { id };
}

async function setDoc(docRef: any, data: DocData, options?: { merge?: boolean }) {
  const colName = docRef.__collection;
  const id = docRef.id;
  const col = ensureCollection(colName);
  const existing = col.get(id) || {};
  const merged = options && options.merge ? { ...existing, ...data } : { ...data };
  col.set(id, merged);
  return;
}

async function getDoc(docRef: any) {
  const colName = docRef.__collection;
  const id = docRef.id;
  const col = ensureCollection(colName);
  const data = col.get(id);
  return {
    exists: () => data !== undefined,
    id,
    data: () => data,
  };
}

async function deleteDoc(docRef: any) {
  const colName = docRef.__collection;
  const id = docRef.id;
  const col = ensureCollection(colName);
  col.delete(id);
}

function serverTimestamp() {
  return new MockTimestamp(new Date());
}

function query(..._args: any[]) {
  return { __query: true, args: _args };
}

function orderBy(...args: any[]) {
  return { __orderBy: args };
}

function onSnapshot(queryOrRef: any, cb: any, errCb?: any) {
  try {
    // Produce a minimal QuerySnapshot object with forEach
    const colName = (queryOrRef && queryOrRef.__collection) ? queryOrRef.__collection :
      (Array.isArray(queryOrRef?.args) && queryOrRef.args[0]?.__collection) ? queryOrRef.args[0].__collection : null;
    const col = colName ? ensureCollection(colName) : null;

    const docs = [] as any[];
    if (col) {
      for (const [id, data] of col.entries()) {
        docs.push({ id, _data: data });
      }
    }

    const snapshot = {
      forEach(fn: Function) {
        docs.forEach(d => fn({ id: d.id, data: () => d._data }));
      }
    };

    // call callback immediately with current data
    cb(snapshot);

    // return unsubscribe (no-op)
    return () => {};
  } catch (e) {
    if (errCb) errCb(e);
    return () => {};
  }
}

// Export a simple `db` handle (not used by the mock logic but kept for compatibility)
const db = {};

export {
  db,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  MockTimestamp as Timestamp,
};
