/**
 * Test SQL Queries
 * Collection of various SQL query types for testing
 */

export const TEST_QUERIES = {
  simple: `-- Simple SELECT Query
SELECT * FROM users
WHERE status = 'active'
LIMIT 10;`,

  withAlias: `-- Query with Table Alias
SELECT 
  u.id,
  u.username,
  u.email
FROM users u
WHERE u.status = 'active';`,

  innerJoin: `-- INNER JOIN Query
SELECT 
  u.username,
  o.order_number,
  o.total
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
ORDER BY o.total DESC;`,

  leftJoin: `-- LEFT JOIN Query
SELECT 
  u.username,
  COUNT(o.id) AS order_count,
  COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.username
ORDER BY total_spent DESC;`,

  multipleJoins: `-- Multiple JOINs Query
SELECT 
  u.username,
  o.order_number,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price
FROM users u
INNER JOIN orders o ON u.id = o.user_id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed'
LIMIT 20;`,

  cte: `-- Common Table Expression (CTE)
WITH active_users AS (
  SELECT id, username, email
  FROM users
  WHERE status = 'active'
)
SELECT 
  au.username,
  COUNT(o.id) AS order_count
FROM active_users au
LEFT JOIN orders o ON au.id = o.user_id
GROUP BY au.id, au.username;`,

  multipleCTEs: `-- Multiple CTEs
WITH 
active_users AS (
  SELECT id, username FROM users WHERE status = 'active'
),
user_orders AS (
  SELECT 
    user_id, 
    COUNT(*) AS order_count,
    SUM(total) AS total_spent
  FROM orders
  GROUP BY user_id
)
SELECT 
  au.username,
  COALESCE(uo.order_count, 0) AS total_orders,
  COALESCE(uo.total_spent, 0) AS total_spent
FROM active_users au
LEFT JOIN user_orders uo ON au.id = uo.user_id
ORDER BY total_spent DESC;`,

  subquery: `-- Subquery in WHERE
SELECT 
  username,
  email
FROM users
WHERE id IN (
  SELECT user_id 
  FROM orders 
  WHERE total > 1000
);`,

  correlatedSubquery: `-- Correlated Subquery
SELECT 
  u.username,
  (SELECT COUNT(*) FROM orders o WHERE o.user_id = u.id) AS order_count,
  (SELECT COALESCE(SUM(total), 0) FROM orders o WHERE o.user_id = u.id) AS total_spent
FROM users u
WHERE u.status = 'active';`,

  windowFunction: `-- Window Functions
SELECT 
  username,
  order_date,
  total,
  ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date) AS order_sequence,
  SUM(total) OVER (PARTITION BY user_id ORDER BY order_date) AS running_total,
  AVG(total) OVER (PARTITION BY user_id) AS avg_order_value
FROM orders o
JOIN users u ON o.user_id = u.id;`,

  aggregates: `-- Aggregate Functions
SELECT 
  user_id,
  COUNT(*) AS order_count,
  SUM(total) AS total_spent,
  AVG(total) AS avg_order_value,
  MIN(total) AS min_order,
  MAX(total) AS max_order,
  MIN(order_date) AS first_order,
  MAX(order_date) AS last_order
FROM orders
GROUP BY user_id
HAVING order_count > 5
ORDER BY total_spent DESC;`,

  caseStatement: `-- CASE Statement
SELECT 
  username,
  total,
  CASE 
    WHEN total < 50 THEN 'Small'
    WHEN total BETWEEN 50 AND 200 THEN 'Medium'
    WHEN total BETWEEN 200 AND 500 THEN 'Large'
    ELSE 'Extra Large'
  END AS order_size,
  CASE
    WHEN status = 'completed' THEN '✅'
    WHEN status = 'pending' THEN '⏳'
    WHEN status = 'cancelled' THEN '❌'
    ELSE '❓'
  END AS status_icon
FROM orders o
JOIN users u ON o.user_id = u.id;`,

  union: `-- UNION Query
SELECT username, 'active' AS user_type 
FROM users 
WHERE status = 'active'
UNION
SELECT username, 'inactive' AS user_type 
FROM users 
WHERE status = 'inactive'
ORDER BY username;`,

  complexAnalytics: `-- Complex Analytics Query
WITH monthly_revenue AS (
  SELECT 
    DATE_FORMAT(order_date, '%Y-%m') AS month,
    SUM(total) AS revenue,
    COUNT(*) AS order_count
  FROM orders
  WHERE order_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  GROUP BY DATE_FORMAT(order_date, '%Y-%m')
),
ranked_months AS (
  SELECT 
    month,
    revenue,
    order_count,
    LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
    RANK() OVER (ORDER BY revenue DESC) AS revenue_rank
  FROM monthly_revenue
)
SELECT 
  month,
  revenue,
  order_count,
  prev_revenue,
  CASE 
    WHEN prev_revenue IS NOT NULL 
    THEN ((revenue - prev_revenue) / prev_revenue * 100)
    ELSE NULL
  END AS growth_rate,
  revenue_rank
FROM ranked_months
ORDER BY month DESC;`,

  variables: `-- Query with Variables
SELECT 
  u.username,
  u.email,
  COUNT(o.id) AS order_count,
  SUM(o.total) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL $(days) DAY)
  AND u.status = '$(status)'
GROUP BY u.id, u.username, u.email
HAVING order_count > $(min_orders)
ORDER BY total_spent DESC
LIMIT $(limit);`,

  allFeatures: `-- Comprehensive Query with All Features
WITH 
-- CTE: Active users with recent activity
active_users AS (
  SELECT 
    id,
    username,
    email,
    created_at
  FROM users
  WHERE status = 'active'
    AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
),
-- CTE: Product categories with sales
category_sales AS (
  SELECT 
    p.category,
    COUNT(DISTINCT oi.order_id) AS order_count,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.quantity * oi.unit_price) AS revenue
  FROM products p
  INNER JOIN order_items oi ON p.id = oi.product_id
  GROUP BY p.category
)
-- Main query with aliases, joins, subqueries, and window functions
SELECT 
  au.username AS customer_name,
  au.email,
  o.order_number,
  o.order_date,
  -- Subquery: Count items in order
  (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count,
  -- Aggregate: Order total
  SUM(oi.quantity * oi.unit_price) AS order_total,
  -- Window: Running total per customer
  SUM(SUM(oi.quantity * oi.unit_price)) OVER (
    PARTITION BY au.id 
    ORDER BY o.order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
  ) AS customer_running_total,
  -- Window: Order rank per customer
  ROW_NUMBER() OVER (PARTITION BY au.id ORDER BY o.order_date DESC) AS order_rank,
  -- Case: Categorize order value
  CASE 
    WHEN SUM(oi.quantity * oi.unit_price) < 100 THEN 'Small'
    WHEN SUM(oi.quantity * oi.unit_price) BETWEEN 100 AND 500 THEN 'Medium'
    WHEN SUM(oi.quantity * oi.unit_price) > 500 THEN 'Large'
  END AS order_category
FROM active_users au
-- Join orders
INNER JOIN orders o ON au.id = o.user_id
-- Join order items
INNER JOIN order_items oi ON o.id = oi.order_id
-- Join products
INNER JOIN products p ON oi.product_id = p.id
WHERE 
  o.status IN ('completed', 'shipped')
  AND o.order_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY 
  au.id,
  au.username,
  au.email,
  o.id,
  o.order_number,
  o.order_date
HAVING 
  order_total > 50
ORDER BY 
  au.username,
  o.order_date DESC
LIMIT 100;`,
};

export const QUERY_CATEGORIES = [
  { id: 'simple', name: 'Simple SELECT', icon: '📝' },
  { id: 'withAlias', name: 'With Alias', icon: '🏷️' },
  { id: 'innerJoin', name: 'INNER JOIN', icon: '🔗' },
  { id: 'leftJoin', name: 'LEFT JOIN', icon: '⬅️' },
  { id: 'multipleJoins', name: 'Multiple JOINs', icon: '🔗🔗' },
  { id: 'cte', name: 'CTE', icon: '📊' },
  { id: 'multipleCTEs', name: 'Multiple CTEs', icon: '📊📊' },
  { id: 'subquery', name: 'Subquery', icon: '🔍' },
  { id: 'correlatedSubquery', name: 'Correlated Subquery', icon: '🔍🔍' },
  { id: 'windowFunction', name: 'Window Functions', icon: '🪟' },
  { id: 'aggregates', name: 'Aggregates', icon: '📈' },
  { id: 'caseStatement', name: 'CASE Statement', icon: '🔀' },
  { id: 'union', name: 'UNION', icon: '➕' },
  { id: 'complexAnalytics', name: 'Complex Analytics', icon: '🎯' },
  { id: 'variables', name: 'With Variables', icon: '🔧' },
  { id: 'allFeatures', name: 'All Features', icon: '🚀' },
];

