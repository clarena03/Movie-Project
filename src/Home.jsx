import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';



export default function Home() {
    const [data, setData] = useState([]);  // For films data
const [actor, setActor] = useState([]); // For actors data
const [actorsMovies0, setActorsMovies0] = useState([]); // For actors data
const [actorsMovies1, setActorsMovies1] = useState([]);
const [actorsMovies2, setActorsMovies2] = useState([]);
const [actorsMovies3, setActorsMovies3] = useState([]);
const [actorsMovies4, setActorsMovies4] = useState([]);
const navigate = useNavigate();


// Fetch film data from the backend
useEffect(() => {
  axios.get("http://localhost:5000/api/data")
    .then((response) => {
      setData(response.data);
    })
    .catch((error) => {
      console.error("Error fetching film data:", error);
    });
}, []);

// Fetch actor data from the backend
useEffect(() => {
  axios.get("http://localhost:5000/api/Actor")
    .then((response) => {
      setActor(response.data);
    })
    .catch((error) => {
      console.error("Error fetching actor data:", error);
    });
}, []);
useEffect(() => {
  axios.get("http://localhost:5000/api/ActorsMovies/0")
    .then((response) => {
      setActorsMovies0(response.data);
    })
    .catch((error) => {
      console.error("Error fetching film data:", error);
    });
}, []);
useEffect(() => {
  axios.get("http://localhost:5000/api/ActorsMovies/1")
    .then((response) => {
      setActorsMovies1(response.data);
    })
    .catch((error) => {
      console.error("Error fetching film data:", error);
    });
}, []);
useEffect(() => {
  axios.get("http://localhost:5000/api/ActorsMovies/2")
    .then((response) => {
      setActorsMovies2(response.data);
    })
    .catch((error) => {
      console.error("Error fetching film data:", error);
    });
}, []);
useEffect(() => {
  axios.get("http://localhost:5000/api/ActorsMovies/3")
    .then((response) => {
      setActorsMovies3(response.data);
    })
    .catch((error) => {
      console.error("Error fetching film data:", error);
    });
}, []);
useEffect(() => {
  axios.get("http://localhost:5000/api/ActorsMovies/4")
    .then((response) => {
      setActorsMovies4(response.data);
    })
    .catch((error) => {
      console.error("Error fetching film data:", error);
    });
}, []);

  return (
    <>
    <nav>
        <h1 class="PageHead">Home</h1>
        <div class="container">
            <section>
                <a id="top1" href="/">Home</a>
                <a id="top2" href="/FilmsPage">Films</a>
                <a id="top3" href="/CustomersPage">Customers</a>
            </section>
        </div>
    </nav>
      <div>
      <h1>Most Rented Films</h1>
      <ol>
        {data.map((item, index) => (
          <li key={index}>
            <details>
              <summary>
                {item.title}
              </summary>
              <p>
                Description: {item.description}
              </p>
              <div>
                Release Year: {item.release_year}
              </div>
              <div>
                Length: {item.length} Min
              </div>
              <div>
                Genre: {item.name}
              </div>
              <div>
                Rating: {item.rating}
              </div>
              <div>
                Film ID: {item.film_id}
              </div>
            </details>
          </li>
        ))}
      </ol>

      <h1>Top Actors</h1>
      <ol>
        {actor.map((item, index) => (
          <li key={index}>
            <details>
              <summary>
                {item.first_name} {item.last_name}
              </summary>
              <p>
                Actor ID: {item.actor_id}
              </p>
              <div>
                <h3>Movies:</h3>
                <ol>
                  
                  
                </ol>
              </div>
            </details>
          </li>
        ))}
      </ol>
    </div>
    </>
  );
}