import express, { query } from "express";
import mysql from "mysql2";
import cors from "cors";
import {config} from "dotenv"

const app = express();
const port = 5000;

app.use(cors());
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
  con.query("SELECT film.film_id, film.title, COUNT(*) AS rented FROM rental JOIN inventory ON rental.inventory_id = inventory.inventory_id JOIN film ON inventory.film_id = film.film_id JOIN film_actor ON film.film_id = film_actor.film_id WHERE film_actor.actor_id = (SELECT film_actor.actor_id FROM film JOIN film_actor ON film.film_id = film_actor.film_id GROUP BY film_actor.actor_id ORDER BY COUNT(film_actor.actor_id) DESC LIMIT 1 OFFSET 0) GROUP BY film.film_id ORDER BY rented DESC LIMIT 5;", (err, result) => {
    if (err) {
      res.status(500).json({ message: "Error fetching data" });
      return;
    }
    res.json(result);
  });
});
app.get("/api/Customers", (req, res) => {
  const { q, sort } = req.query;

  let q2="SELECT customer.customer_id,customer.first_name,customer.last_name,COUNT(*) AS rented FROM rental JOIN customer ON rental.customer_id = customer.customer_id"
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


app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
