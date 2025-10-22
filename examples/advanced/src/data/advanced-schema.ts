/**
 * Advanced database schema for demonstration
 */

import type { SchemaDefinition } from '@sql-editor/core';

export const sampleSchema: SchemaDefinition = {
  databases: {
    ecommerce: {
      name: 'ecommerce',
      comment: 'E-commerce database with advanced features',
      tables: {
        users: {
          name: 'users',
          comment: 'User accounts and profiles',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Unique user identifier',
            },
            username: {
              type: 'varchar',
              length: 50,
              unique: true,
              nullable: false,
              comment: 'Unique username',
            },
            email: {
              type: 'varchar',
              length: 255,
              unique: true,
              nullable: false,
              comment: 'User email address',
            },
            first_name: {
              type: 'varchar',
              length: 100,
              comment: 'User first name',
            },
            last_name: {
              type: 'varchar',
              length: 100,
              comment: 'User last name',
            },
            status: {
              type: 'enum',
              enumValues: ['active', 'inactive', 'suspended', 'pending'],
              defaultValue: 'pending',
              comment: 'User account status',
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
          comment: 'Product catalog with inventory',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Product identifier',
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
            stock_quantity: {
              type: 'int',
              defaultValue: 0,
              comment: 'Available stock quantity',
            },
            category_id: {
              type: 'int',
              foreignKey: 'categories.id',
              comment: 'Product category reference',
            },
            is_active: {
              type: 'boolean',
              defaultValue: true,
              comment: 'Product active status',
            },
            created_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
              comment: 'Product creation timestamp',
            },
          },
        },
        categories: {
          name: 'categories',
          comment: 'Product categories hierarchy',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Category identifier',
            },
            name: {
              type: 'varchar',
              length: 100,
              nullable: false,
              comment: 'Category name',
            },
            parent_id: {
              type: 'int',
              foreignKey: 'categories.id',
              comment: 'Parent category reference',
            },
            description: {
              type: 'text',
              comment: 'Category description',
            },
            sort_order: {
              type: 'int',
              defaultValue: 0,
              comment: 'Category sort order',
            },
          },
        },
        orders: {
          name: 'orders',
          comment: 'Customer orders and transactions',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Order identifier',
            },
            user_id: {
              type: 'int',
              foreignKey: 'users.id',
              nullable: false,
              comment: 'Customer user reference',
            },
            order_number: {
              type: 'varchar',
              length: 50,
              unique: true,
              nullable: false,
              comment: 'Unique order number',
            },
            status: {
              type: 'enum',
              enumValues: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
              defaultValue: 'pending',
              comment: 'Order status',
            },
            total_amount: {
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
              comment: 'Total order amount',
            },
            shipping_address: {
              type: 'text',
              comment: 'Shipping address',
            },
            billing_address: {
              type: 'text',
              comment: 'Billing address',
            },
            created_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
              comment: 'Order creation timestamp',
            },
            updated_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
              comment: 'Last update timestamp',
            },
          },
        },
        order_items: {
          name: 'order_items',
          comment: 'Individual items within orders',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Order item identifier',
            },
            order_id: {
              type: 'int',
              foreignKey: 'orders.id',
              nullable: false,
              comment: 'Order reference',
            },
            product_id: {
              type: 'int',
              foreignKey: 'products.id',
              nullable: false,
              comment: 'Product reference',
            },
            quantity: {
              type: 'int',
              nullable: false,
              comment: 'Item quantity',
            },
            unit_price: {
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
              comment: 'Unit price at time of order',
            },
            total_price: {
              type: 'decimal',
              precision: 10,
              scale: 2,
              nullable: false,
              comment: 'Total price for this item',
            },
          },
        },
        reviews: {
          name: 'reviews',
          comment: 'Product reviews and ratings',
          columns: {
            id: {
              type: 'int',
              primaryKey: true,
              autoIncrement: true,
              comment: 'Review identifier',
            },
            user_id: {
              type: 'int',
              foreignKey: 'users.id',
              nullable: false,
              comment: 'Reviewer user reference',
            },
            product_id: {
              type: 'int',
              foreignKey: 'products.id',
              nullable: false,
              comment: 'Reviewed product reference',
            },
            rating: {
              type: 'int',
              nullable: false,
              comment: 'Rating from 1 to 5',
            },
            title: {
              type: 'varchar',
              length: 200,
              comment: 'Review title',
            },
            content: {
              type: 'text',
              comment: 'Review content',
            },
            is_verified: {
              type: 'boolean',
              defaultValue: false,
              comment: 'Verified purchase review',
            },
            created_at: {
              type: 'timestamp',
              defaultValue: 'CURRENT_TIMESTAMP',
              comment: 'Review creation timestamp',
            },
          },
        },
      },
    },
  },
};
