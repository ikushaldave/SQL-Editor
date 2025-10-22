/**
 * Sample database schema for demonstration
 */

import type { SchemaDefinition } from '@sql-editor/core';

export const sampleSchema: SchemaDefinition = {
  databases: {
    ecommerce: {
      name: 'ecommerce',
      comment: 'E-commerce database',
      tables: {
        users: {
          name: 'users',
          comment: 'User accounts',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'User ID',
            },
            username: {
              type: 'varchar',
              length: 50,
              unique: true,
              nullable: false,
              comment: 'Username',
            },
            email: {
              type: 'varchar',
              length: 255,
              unique: true,
              nullable: false,
              comment: 'Email address',
            },
            first_name: {
              type: 'varchar',
              length: 100,
              comment: 'First name',
            },
            last_name: {
              type: 'varchar',
              length: 100,
              comment: 'Last name',
            },
            created_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
              comment: 'Account creation timestamp',
            },
            updated_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
              comment: 'Last update timestamp',
            },
          },
        },
        products: {
          name: 'products',
          comment: 'Product catalog',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Product ID',
            },
            name: {
              type: 'varchar',
              length: 200,
              nullable: false,
              comment: 'Product name',
            },
            description: {
              type: 'text',
              comment: 'Product description',
            },
            price: {
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
              comment: 'Product price',
            },
            stock: {
              type: 'int',
              defaultValue: 0,
              comment: 'Stock quantity',
            },
            category_id: {
              type: 'int',
              foreignKey: 'categories.id',
              comment: 'Category reference',
            },
            created_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
            },
          },
        },
        categories: {
          name: 'categories',
          comment: 'Product categories',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
            },
            name: {
              type: 'varchar',
              length: 100,
              nullable: false,
            },
            parent_id: {
              type: 'int',
              comment: 'Parent category',
            },
          },
        },
        orders: {
          name: 'orders',
          comment: 'Customer orders',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
            },
            user_id: {
              type: 'int',
              foreignKey: 'users.id',
              nullable: false,
            },
            status: {
              type: 'enum',
              enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              defaultValue: 'pending',
            },
            total: {
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
            },
            created_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
            },
          },
        },
        order_items: {
          name: 'order_items',
          comment: 'Order line items',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
            },
            order_id: {
              type: 'int',
              foreignKey: 'orders.id',
              nullable: false,
            },
            product_id: {
              type: 'int',
              foreignKey: 'products.id',
              nullable: false,
            },
            quantity: {
              type: 'int',
              nullable: false,
            },
            price: {
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
            },
          },
        },
      },
    },
  },
};

