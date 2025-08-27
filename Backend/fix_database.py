#!/usr/bin/env python
"""
Script to fix database schema issues
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'api.settings')
django.setup()

from django.db import connection

def create_customuser_table():
    """Create the missing bryo_customuser table"""
    
    sql = """
    CREATE TABLE IF NOT EXISTS bryo_customuser (
        id BIGSERIAL PRIMARY KEY,
        password VARCHAR(128) NOT NULL,
        last_login TIMESTAMP WITH TIME ZONE,
        is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
        username VARCHAR(150) NOT NULL UNIQUE,
        first_name VARCHAR(150) NOT NULL DEFAULT '',
        last_name VARCHAR(150) NOT NULL DEFAULT '',
        email VARCHAR(254) NOT NULL DEFAULT '',
        is_staff BOOLEAN NOT NULL DEFAULT FALSE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        privy_id VARCHAR(255) UNIQUE
    );
    
    CREATE TABLE IF NOT EXISTS bryo_customuser_groups (
        id BIGSERIAL PRIMARY KEY,
        customuser_id BIGINT NOT NULL REFERENCES bryo_customuser(id) ON DELETE CASCADE,
        group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
        UNIQUE(customuser_id, group_id)
    );
    
    CREATE TABLE IF NOT EXISTS bryo_customuser_user_permissions (
        id BIGSERIAL PRIMARY KEY,
        customuser_id BIGINT NOT NULL REFERENCES bryo_customuser(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
        UNIQUE(customuser_id, permission_id)
    );
    
    CREATE INDEX IF NOT EXISTS bryo_customuser_username_idx ON bryo_customuser(username);
    CREATE INDEX IF NOT EXISTS bryo_customuser_email_idx ON bryo_customuser(email);
    CREATE INDEX IF NOT EXISTS bryo_customuser_privy_id_idx ON bryo_customuser(privy_id);
    """
    
    with connection.cursor() as cursor:
        cursor.execute(sql)
    
    print("✅ CustomUser table created successfully!")

def main():
    print("🔧 Fixing database schema...")
    
    try:
        create_customuser_table()
        print("✅ Database schema fixed successfully!")
        
    except Exception as e:
        print(f"❌ Error fixing database: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
