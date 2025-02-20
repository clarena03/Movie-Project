import * as React from 'react';
import SearchComponent from './Component/SearchMovie';



export default function Films() {
  return (
    <>
      <nav>
        <h1>Films</h1>
        <div class="container">
            <section>
                <a id="top1" href="/">Home</a>
                <a id="top2" href="/FilmsPage">Films</a>
                <a id="top3" href="/CustomersPage">Customers</a>
            </section>
        </div>
    </nav>

    <SearchComponent />
    </>
  );
}