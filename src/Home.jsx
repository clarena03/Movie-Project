import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const [data, setData] = useState([]); // For films data
  const [actor, setActor] = useState([]); // For actors data
  const [actorsMovies, setActorsMovies] = useState({}); // Store movies by actor ID
  const [loadingMovies, setLoadingMovies] = useState({}); // Loading state for actor movies
  const navigate = useNavigate();

  // Fetch film data from the backend
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/data')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching film data:', error);
      });
  }, []);

  // Fetch actor data from the backend
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/Actor')
      .then((response) => {
        setActor(response.data);
      })
      .catch((error) => {
        console.error('Error fetching actor data:', error);
      });
  }, []);

  // Fetch movies for a particular actor
  const actorsMovieInfo = async (id) => {
    if (loadingMovies[id]) return; // Prevent duplicate requests
    setLoadingMovies((prev) => ({ ...prev, [id]: true }));

    try {
      const response = await axios.get('http://localhost:5000/api/ActorsMovies', {
        params: {
          actor_id: id,
        },
      });

      setActorsMovies((prev) => ({ ...prev, [id]: response.data }));
    } catch (error) {
      console.error('Error fetching actor movies:', error);
    } finally {
      setLoadingMovies((prev) => ({ ...prev, [id]: false }));
    }
  };

  // Handle opening the details of an actor (triggered by onToggle)
  const handleDetailsToggle = (actorId, event) => {
    if (event.target.open) {
      // If the details section is opened, fetch the actor's movies
      actorsMovieInfo(actorId);
    }
  };

  return (
    <>
      <nav>
        <h1 className="PageHead">Home</h1>
        <div className="container">
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
          {data.map((item) => (
            <li key={item.film_id}>
              <details>
                <summary>{item.title}</summary>
                <article>
                  <p>Description: {item.description}</p>
                  <div>Release Year: {item.release_year}</div>
                  <div>Length: {item.length} Min</div>
                  <div>Genre: {item.name}</div>
                  <div>Rating: {item.rating}</div>
                  <div>Film ID: {item.film_id}</div>
                </article>
              </details>
            </li>
          ))}
        </ol>

        <h1>Top Actors</h1>
        <ol>
          {actor.map((item) => (
            <li key={item.actor_id}>
              <details onToggle={(event) => handleDetailsToggle(item.actor_id, event)}>
                <summary>
                  {item.first_name} {item.last_name}
                </summary>
                <p>Actor ID: {item.actor_id}</p>
                <div>
                  <h3>Movies:</h3>
                  <ul>
                    {actorsMovies[item.actor_id]?.map((movie) => (
                      <li key={movie.film_id}>{movie.title}</li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
