// Same Store contract as the Node service, backed by durable SQLite.
export class DurableStore {
  constructor(sql) {
    this.sql = sql;
    sql.exec('CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,owner TEXT NOT NULL,document TEXT NOT NULL); CREATE TABLE IF NOT EXISTS budgets(day TEXT PRIMARY KEY,calls INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS locks(id TEXT PRIMARY KEY,until_ms INTEGER NOT NULL); CREATE TABLE IF NOT EXISTS configuration(id TEXT PRIMARY KEY,document TEXT NOT NULL);');
  }
  put(order) { this.sql.exec('INSERT INTO orders VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET document=excluded.document',order.id,order.owner,JSON.stringify(order)); return order; }
  get(id,owner) { const row=[...this.sql.exec('SELECT document FROM orders WHERE id=? AND owner=?',id,owner)][0]; return row ? JSON.parse(row.document) : null; }
  list(owner) { return [...this.sql.exec('SELECT document FROM orders WHERE owner=? ORDER BY rowid DESC LIMIT 50',owner)].map(r=>JSON.parse(r.document)); }
  reserve(limit) { if(limit<=0)return false; return [...this.sql.exec('INSERT INTO budgets(day,calls) VALUES(?,1) ON CONFLICT(day) DO UPDATE SET calls=calls+1 WHERE calls<? RETURNING calls',new Date().toISOString().slice(0,10),limit)].length>0; }
  lock(id,ttl=120000) { return [...this.sql.exec('INSERT INTO locks VALUES(?,?) ON CONFLICT(id) DO UPDATE SET until_ms=excluded.until_ms WHERE until_ms<? RETURNING id',id,Date.now()+ttl,Date.now())].length>0; }
  unlock(id) { this.sql.exec('DELETE FROM locks WHERE id=?',id); }
  config() { const row=[...this.sql.exec("SELECT document FROM configuration WHERE id='paypal'")][0]; return row ? JSON.parse(row.document) : null; }
  saveConfig(value) { this.sql.exec("INSERT INTO configuration VALUES('paypal',?)",JSON.stringify(value)); }
}
