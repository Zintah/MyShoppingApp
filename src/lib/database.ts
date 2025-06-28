import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDatabase() {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(process.cwd(), 'shopping.db'),
    driver: sqlite3.Database
  });

  // Initialize tables
  await initializeTables();
  
  return db;
}

async function initializeTables() {
  if (!db) return;

  // Create shopping_lists table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS shopping_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      week_starting TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create shopping_items table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS shopping_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit TEXT NOT NULL DEFAULT 'pcs',
      category TEXT NOT NULL DEFAULT 'General',
      price DECIMAL(10,2) DEFAULT 0.00,
      completed BOOLEAN NOT NULL DEFAULT 0,
      list_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES shopping_lists (id) ON DELETE CASCADE
    )
  `);

  // Create catalog_items table for frequently used items
  await db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      default_quantity INTEGER NOT NULL DEFAULT 1,
      default_unit TEXT NOT NULL DEFAULT 'pcs',
      category TEXT NOT NULL DEFAULT 'General',
      default_price DECIMAL(10,2) DEFAULT 0.00,
      usage_count INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add price column to existing tables if it doesn't exist
  try {
    await db.exec('ALTER TABLE shopping_items ADD COLUMN price DECIMAL(10,2) DEFAULT 0.00');
  } catch (error) {
    // Column might already exist, ignore error
  }

  try {
    await db.exec('ALTER TABLE catalog_items ADD COLUMN default_price DECIMAL(10,2) DEFAULT 0.00');
  } catch (error) {
    // Column might already exist, ignore error
  }

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_shopping_items_list_id ON shopping_items(list_id);
    CREATE INDEX IF NOT EXISTS idx_shopping_lists_week_starting ON shopping_lists(week_starting);
    CREATE INDEX IF NOT EXISTS idx_catalog_items_name ON catalog_items(name);
    CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(category);
  `);
} 