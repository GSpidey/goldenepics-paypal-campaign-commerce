import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
export class Store {
 constructor(path=':memory:'){
  if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,owner TEXT NOT NULL,document TEXT NOT NULL); CREATE TABLE IF NOT EXISTS budgets(day TEXT PRIMARY KEY,calls INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS locks(id TEXT PRIMARY KEY,until_ms INTEGER NOT NULL);');
 }
 put(order){this.db.prepare('INSERT INTO orders VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document').run(order.id,order.owner,JSON.stringify(order));return order;}
 get(id,owner){const row=this.db.prepare('SELECT document FROM orders WHERE id=? AND owner=?').get(id,owner);return row?JSON.parse(row.document):null;}
 list(owner){return this.db.prepare('SELECT document FROM orders WHERE owner=? ORDER BY rowid DESC LIMIT 50').all(owner).map(r=>JSON.parse(r.document));}
 reserve(limit){if(limit<=0)return false;const day=new Date().toISOString().slice(0,10);const row=this.db.prepare('INSERT INTO budgets(day,calls) VALUES(?,1) ON CONFLICT(day) DO UPDATE SET calls=calls+1 WHERE calls<? RETURNING calls').get(day,limit);return !!row&&limit>0;}
 lock(id,ttl=120000){return !!this.db.prepare('INSERT INTO locks VALUES(?,?) ON CONFLICT(id) DO UPDATE SET until_ms=excluded.until_ms WHERE until_ms<? RETURNING id').get(id,Date.now()+ttl,Date.now());}
 unlock(id){this.db.prepare('DELETE FROM locks WHERE id=?').run(id);}
 close(){this.db.close();}
}
