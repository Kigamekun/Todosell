1. SELECT * FROM product ORDER BY price DESC;


2. SELECT * FROM  transaksi WHERE transaction_date LIKE '%2018-03%';

3. SELECT user_id,SUM(total_transaction) as total FROM invoices GROUP BY user_id ORDER BY total;

4. SELECT * FROM product WHERE id NOT IN (SELECT id FROM invoices)
