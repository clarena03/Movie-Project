import React, { useEffect, useState } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import SearchCustomer from './Component/SearchUser';


export default function Customers() {


  return (
    <>
      <nav>
        <h1>Customers</h1>
        <div class="container">
            <section>
                <a id="top1" href="/">Home</a>
                <a id="top2" href="/FilmsPage">Films</a>
                <a id="top3" href="/CustomersPage">Customers</a>
            </section>
        </div>
    </nav>
    <SearchCustomer />

    
    </>
  );
}

function Items({ currentItems }) {
    return (
      <>
        {currentItems &&
          currentItems.map((item, i) => (
            <div>
              <h3>{item}</h3>
            </div>
          ))}
      </>
    );
  }
  
  function PaginatedItems({ itemsPerPage }) {
    // Here we use item offsets; we could also use page offsets
    // following the API or data you're working with.
    const [itemOffset, setItemOffset] = useState(0);
  
    // Simulate fetching items from another resources.
    // (This could be items from props; or items loaded in a local state
    // from an API endpoint with useEffect and useState)
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    const currentItems = items.slice(itemOffset, endOffset);
    const pageCount = Math.ceil(items.length / itemsPerPage);
  
    // Invoke when user click to request another page.
    const handlePageClick = (event) => {
      const newOffset = (event.selected * itemsPerPage) % items.length;
      console.log(
        `User requested page number ${event.selected}, which is offset ${newOffset}`
      );
      setItemOffset(newOffset);
    };
  
    return (
      <>
        <Items currentItems={currentItems} />
        <ReactPaginate
          breakLabel="..."
          nextLabel="next >"
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={pageCount}
          previousLabel="< previous"
          renderOnZeroPageCount={null}
        />
        
      </>
    );
  }
  