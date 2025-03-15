import express, { query } from "express";
import mysql from "mysql2";
import cors from "cors";
import {config} from "dotenv"

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());
config()
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password:process.env.HOST,
  database: "sakila"
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

// Create an API endpoint to fetch data
app.get("/api/data", (req, res) => {
  con.query("SELECT film.film_id, film.description, film.release_year, film.length, film.rating, film.title, category.name, COUNT(*) AS rented FROM rental JOIN inventory ON rental.inventory_id = inventory.inventory_id JOIN film ON inventory.film_id = film.film_id JOIN film_category ON film.film_id = film_category.film_id JOIN category ON film_category.category_id = category.category_id GROUP BY film.film_id , category.name ORDER BY rented DESC LIMIT 5;", (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }
    res.json(result);
  });
});

// Endpoint for top actors
app.get("/api/Actor", (req, res) => {
  con.query("SELECT actor.actor_id, actor.first_name, actor.last_name, COUNT(*) AS movies FROM film JOIN film_actor ON film.film_id = film_actor.film_id JOIN actor ON film_actor.actor_id = actor.actor_id GROUP BY actor.actor_id ORDER BY movies DESC LIMIT 5;", (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }
    res.json(result);
  });
});
app.get('/api/AllMovies', (req, res) => {
  const { q, sort } = req.query;  // Retrieve the 'q' and 'sort' parameters
  let q1 = "";  // SQL query variable

  // Check if sorting by actor or just fetching general data
  if (sort === "Actor" && q) {
    // Query for filtering by actor
    q1 = `
      SELECT film.film_id, film.title, film.description, film.release_year, 
             film.length, film.special_features, film.rating, category.name
      FROM film
      JOIN film_actor ON film.film_id = film_actor.film_id
      JOIN actor ON film_actor.actor_id = actor.actor_id
      JOIN film_category ON film.film_id = film_category.film_id
      JOIN category ON film_category.category_id = category.category_id
    `;
  } else {
    // Default query if sorting is not by actor
    q1 = `
      SELECT film.film_id, film.title, film.description, film.release_year, 
             film.length, film.special_features, film.rating, category.name
      FROM film
      JOIN film_category ON film.film_id = film_category.film_id
      JOIN category ON film_category.category_id = category.category_id
    `;
  }

  // Add the filtering condition based on 'q' (search term) and 'sort'
  if (q) {
    if (sort === "Movie") {
      // Filter by movie title
      q1 += ` WHERE film.title LIKE ?`;
    } else if (sort === "Genre") {
      // Filter by genre name
      q1 += ` WHERE category.name LIKE ?`;
    } else if (sort === "Actor") {
      // Filter by actor name (check full name, first name, or last name)
      q1 += `
        WHERE CONCAT(actor.first_name, ' ', actor.last_name) LIKE ?
        OR actor.first_name LIKE ? 
        OR actor.last_name LIKE ?
      `;
    }
  }

  // Execute the query safely using parameterized queries
  con.query(q1, [`%${q}%`, `%${q}%`, `%${q}%`], (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }

    res.json(result);  // Return the result directly (no need for 'filteredMovies')
  });
});

// Endpoint for top actors' movies
app.get("/api/ActorsMovies", (req, res) => {
  const { actor_id } = req.query;  // Destructuring actor_id from the query params
  
  // Correct SQL query without wildcards for exact matching
  let q3 = `
    SELECT film.film_id, film.title, film_actor.actor_id, COUNT(*) AS rented
    FROM rental
    JOIN inventory ON rental.inventory_id = inventory.inventory_id
    JOIN film ON inventory.film_id = film.film_id
    JOIN film_actor ON film.film_id = film_actor.film_id
    WHERE film_actor.actor_id = ? 
    GROUP BY film.film_id
    ORDER BY rented DESC
    LIMIT 5;
  `;
  
  con.query(q3, [actor_id], (err, result) => {  // Pass actor_id directly into the query
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }
    res.json(result);  // Send the result back to the client
  });
});

app.get("/api/Customers", (req, res) => {
  const { q, sort } = req.query;

  let q2="SELECT customer.customer_id,customer.address_id,customer.first_name,customer.last_name,customer.email,customer.store_id, address.address, address.postal_code, address.phone FROM customer JOIN address ON customer.address_id = address.address_id "
  if(sort === "CustomerID" && q){
    const conv = parseInt(q, 10)
    q2 += ` WHERE customer.customer_id = `+ conv;
  }else if(sort === "First Name" && q){
    q2 += ` WHERE customer.first_name LIKE ? `;
  }else if(sort === "Last Name" && q){
    q2 += ` WHERE customer.last_name LIKE ? `;
  }
  q2+=" GROUP BY customer.customer_id";
  
  con.query(q2, [`%${q}%`],(err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }
    res.json(result);
  });
});
app.get("/api/Rental", (req, res) => {
  const { idNum } = req.query;  // Destructuring actor_id from the query params
  
  // Correct SQL query without wildcards for exact matching
  let q4 = `SELECT rental.return_date, rental.rental_date, rental.rental_id, film.title FROM rental JOIN inventory ON rental.inventory_id = inventory.inventory_id JOIN film ON inventory.film_id = film.film_id WHERE rental.customer_id = ?`;
  
  con.query(q4, [idNum], (err, result) => {  // Pass actor_id directly into the query
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }
    res.json(result);  // Send the result back to the client
  });
});

app.post('/api/rentMovie', (req, res) => {
  const { filmID, custID } = req.body;

  // Validate input
  if (!filmID || !custID) {
    return res.status(400).json({ error: 'Film ID and Customer ID are required.' });
  }

  // Get the inventory_id for the film
  con.query('SELECT inventory_id FROM inventory WHERE film_id = ? LIMIT 1', [filmID], (err, results) => {
    if (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    console.log("here2")

    if (results.length === 0) {
      return res.status(404).json({ error: 'Film not available in inventory.' });
    }

    const inventoryID = results[0].inventory_id;

    // Insert rental transaction into rental table
    con.query('INSERT INTO rental (inventory_id, customer_id, rental_date, staff_id) VALUES (?, ?, ?, 1)', [inventoryID, custID, new Date()], (err, result) => {
      if (err) {
        console.error('Error renting movie:', err);
        return res.status(500).json({ error: 'Database error while renting movie.' });
      }
      console.log("here3")

      // Return success message
      res.status(200).json({
        message: 'Movie rented successfully.',
        rental_id: result.insertId,
        filmID,
        customerID: custID,
      });
    });
  });
});

app.post('/api/returnMovie', (req, res) => {
  const { rentID } = req.body;

  con.query('UPDATE rental SET rental.return_date = ? WHERE rental_id = ?', [new Date(), rentID], (err, result) => {
    if (err) {
      console.error('Error returning movie:', err);
      return res.status(500).json({ error: 'Database error while returning movie.' });
    }
    console.log("here3")

    // Return success message
    res.status(200).json({
      message: 'Movie returned successfully.',
    });
  });

});

app.post('/api/addUser', (req, res) => {
  const {fName, lName, email, phone, address, postal_code } = req.body;
  
  // Insert address first
  const insertAddressQuery = `
    INSERT INTO address (address, address2, district, postal_code, phone, city_id, location) VALUES (?, null, ?, ?, ?, 1, ST_GeomFromText('POINT(0 0)'));`;

  const addressValues = [address, 'District Name', postal_code, phone];
  
  con.query(insertAddressQuery, addressValues, (addressErr, addressResult) => {
    if (addressErr) {
      return res.status(500).json({ error: 'Failed to add address', message: addressErr.message });
    }

    // After address is added, get the address_id
    const address_id = addressResult.insertId;

    // Insert customer
    const insertCustomerQuery = `
      INSERT INTO customer (store_id, first_name, last_name, email, address_id, active, create_date) VALUES (1, ?, ?, ?, ?, 1, ?);`;

    const customerValues = [fName, lName, email, address_id, new Date()];

    con.query(insertCustomerQuery, customerValues, (customerErr, customerResult) => {
      if (customerErr) {
        return res.status(500).json({ error: 'Failed to add customer', message: customerErr.message });
      }
  
      // Successfully added both customer and address
      res.status(200).json({
        message: 'Customer and address added successfully',
        customerId: customerResult.insertId,
        addressId: address_id,
      });
    });
  });
});
app.post('/api/deleteUser', (req, res) => {
  const { custID } = req.body;

  // Check if the customer has any active rentals
  con.query('DELETE FROM customer WHERE customer_id = ?', [custID], (err, rentals) => {
    if (err) {
      return res.status(500).json({ error: 'Error deleting user', message: err });
    }
      res.status(200).json({
        message: 'Customer deleted successfully',
      });
    });
});


app.post('/api/editUser', (req, res) => {
  const { id, aID,  fName, lName, email, phone, address, postal_code } = req.body;

  console.log(req.body)

  let q1='UPDATE customer SET customer.first_name = ?, customer.last_name = ?, customer.email = ? WHERE customer.customer_id = ?';
  con.query(q1, [fName, lName, email, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to Update Customer', message: err });
    }
    console.log(result)
    con.query('UPDATE address SET address.address = ?, address.postal_code = ?, address.phone = ? WHERE address.address_id = ?', [address, postal_code, phone, aID], (addErr, addResult) => {
      if (addErr) {
        return res.status(500).json({ error: 'Failed to Update Address', message: addErr.message });
      }
      console.log(addResult)
      // Successfully added both customer and address
      res.status(200).json({
        message: 'Customer and address updated successfully',
      });
    });
  });

});
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
