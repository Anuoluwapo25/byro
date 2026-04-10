/**
 * Supabase User Schema Documentation
 * 
 * This file documents the expected schema for the 'users' table in Supabase.
 * Use this as a reference when creating migrations or querying user data.
 * 
 * SQL Migration Example:
 * 
 * CREATE TABLE IF NOT EXISTS users (
 *   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *   privy_id TEXT UNIQUE NOT NULL,
 *   email TEXT,
 *   wallet_address TEXT,
 *   wallet_addresses JSONB DEFAULT '[]'::jsonb,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * CREATE INDEX IF NOT EXISTS idx_users_privy_id ON users(privy_id);
 * CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
 * CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
 * 
 * -- Add updated_at trigger
 * CREATE OR REPLACE FUNCTION update_updated_at_column()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   NEW.updated_at = NOW();
 *   RETURN NEW;
 * END;
 * $$ language 'plpgsql';
 * 
 * CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
 *   FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
 */

/**
 * @typedef {Object} SupabaseUser
 * @property {string} id - UUID primary key (auto-generated)
 * @property {string} privy_id - Privy user ID (unique, required)
 * @property {string|null} email - User's email address
 * @property {string|null} wallet_address - Primary wallet address
 * @property {string[]} wallet_addresses - Array of all wallet addresses
 * @property {string} created_at - ISO timestamp of creation
 * @property {string} updated_at - ISO timestamp of last update
 */

/**
 * Expected schema structure for the users table
 */
export const USER_SCHEMA = {
  tableName: 'users',
  columns: {
    id: {
      type: 'UUID',
      primaryKey: true,
      required: true,
      description: 'Auto-generated UUID primary key',
    },
    privy_id: {
      type: 'TEXT',
      unique: true,
      required: true,
      indexed: true,
      description: 'Privy user ID - unique identifier from Privy authentication',
    },
    email: {
      type: 'TEXT',
      required: false,
      indexed: true,
      description: "User's email address from Privy account",
    },
    wallet_address: {
      type: 'TEXT',
      required: false,
      indexed: true,
      description: 'Primary wallet address (first wallet in wallet_addresses array)',
    },
    wallet_addresses: {
      type: 'JSONB',
      required: false,
      default: '[]',
      description: 'Array of all wallet addresses associated with the user',
    },
    created_at: {
      type: 'TIMESTAMPTZ',
      required: false,
      default: 'NOW()',
      description: 'Timestamp when the user record was created',
    },
    updated_at: {
      type: 'TIMESTAMPTZ',
      required: false,
      default: 'NOW()',
      description: 'Timestamp when the user record was last updated',
    },
  },
};

/**
 * Get the column names as an array
 * @returns {string[]} Array of column names
 */
export function getUserColumns() {
  return Object.keys(USER_SCHEMA.columns);
}

/**
 * Get required column names
 * @returns {string[]} Array of required column names
 */
export function getRequiredColumns() {
  return Object.entries(USER_SCHEMA.columns)
    .filter(([_, config]) => config.required)
    .map(([name]) => name);
}

/**
 * Validate user data against schema
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export function validateUserData(userData) {
  const errors = [];
  const required = getRequiredColumns();

  // Check required fields
  for (const field of required) {
    if (!userData[field] && userData[field] !== 0) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate types
  if (userData.wallet_addresses && !Array.isArray(userData.wallet_addresses)) {
    errors.push('wallet_addresses must be an array');
  }

  if (userData.email && typeof userData.email !== 'string') {
    errors.push('email must be a string');
  }

  if (userData.privy_id && typeof userData.privy_id !== 'string') {
    errors.push('privy_id must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get migration SQL for creating the users table
 * @returns {string} SQL migration script
 */
export function getMigrationSQL() {
  return `
-- Create users table
CREATE TABLE IF NOT EXISTS ${USER_SCHEMA.tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_id TEXT UNIQUE NOT NULL,
  email TEXT,
  wallet_address TEXT,
  wallet_addresses JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_privy_id ON ${USER_SCHEMA.tableName}(privy_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON ${USER_SCHEMA.tableName}(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON ${USER_SCHEMA.tableName}(wallet_address);

-- Add updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON ${USER_SCHEMA.tableName};
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON ${USER_SCHEMA.tableName}
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
  `.trim();
}

