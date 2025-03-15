import React, { useState, useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import axios from 'axios';

const SearchForm = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        class="search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter search query"
      />
      <button type="submit">
        Search
      </button>
    </form>
  );
};

export default function SearchCustomer () {
  const [results, setResults] = useState([]);
  const [sortState, setSortState] = useState('CustomerID');

  const handleSearch = async (query) => {
    try {
      const response = await axios.get('http://localhost:5000/api/Customers', {
        params: {
          q: query,
          sort: sortState,
        },
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      alert("Search Failure");
    }
  };

  const handleSortChange = () => {
    const nextSortState = sortState === 'CustomerID' 
      ? 'First Name' 
      : sortState === 'First Name'
      ? 'Last Name'
      : 'CustomerID';
    setSortState(nextSortState);
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortState === 'First Name') {
      return a.first_name.localeCompare(b.first_name);
    } else if (sortState === 'Last Name') {
      return a.last_name.localeCompare(b.last_name);
    } else {
      return a.customer_id - b.customer_id;
    }
  });

  return (
    <>
    <div>
    <button onClick={handleSortChange}>
        Sort: {sortState}
      </button>
      <SearchForm onSearch={handleSearch} />
      
    </div>
    <div>
      <PaginatedItems itemsPerPage={10} items={sortedResults} />
    </div>
    </>
    
  );
};

const Items = ({ currentItems }) => {
  const [rentals, setRentals] = useState({});
  const [loadingRental, setLoadingRental] = useState({});
  const [editState, setEditState] = useState(false);

  const fetchRentals = async (customerId) => {
    if (loadingRental[customerId]) return; // Prevent duplicate requests
    setLoadingRental((prev) => ({ ...prev, [customerId]: true }));

    try {
      const response = await axios.get('http://localhost:5000/api/Rental', {
        params: {
          idNum: customerId,
        },
      });
      setRentals((prev) => ({ ...prev, [customerId]: response.data }));
    } catch (error) {
      console.error('Error fetching rentals:', error);
      alert("Error Retrieving Rentals");
    } finally {
      setLoadingRental((prev) => ({ ...prev, [customerId]: false }));
    }
  };

  const handleDetailsToggle = (customerId, isOpen) => {
    if (isOpen) {
      fetchRentals(customerId);
    }
  };
  const handleReturn = async (rentID) => {
    try {
      const response = await axios.post('http://localhost:5000/api/returnMovie', {
        rentID: rentID
      });
      console.log('Return success:', response);
      alert("Return Successful :: Changes Will Be Reflected Upon Page Refresh");
      // Handle successful rental response here (e.g., show success message)
    } catch (error) {
      console.error('Return failed:', error);
      alert("Return Unsuccessful");
      // Handle error response here (e.g., show error message)
    }
  }
  const handleDelete = async (custID) =>{
    let check = confirm("You are about to delete this user. Continue?")
    if(check){
      try {
        const response = await axios.post('http://localhost:5000/api/deleteUser', {
          custID: custID
        });
        alert("Deletion Successful :: Changes Will Be Reflected Upon Page Refresh");
        // Handle successful rental response here (e.g., show success message)
      } catch (error) {
        console.error('Seletion failed:', error);
        alert("Deletion Failed");
        // Handle error response here (e.g., show error message)
      }
    }
  }
  const handleAddUserClick = () => {
    setEditState(true); // Show the Add User form
  };

  const handleCloseForm = () => {
    setEditState(false); // Close the form
  };

  return (
    <>
      {currentItems.map((item) => (
        <details
          key={item.customer_id}
          onToggle={(event) => handleDetailsToggle(item.customer_id, event.target.open)}
        >
          <summary>{item.first_name} {item.last_name}</summary>
          <div>
            Customer ID: {item.customer_id}
          </div>
          <div>
            Customer Email: {item.email}
          </div>
          <div>
            Store ID: {item.store_id}
          </div>
          <div>
            Address: {item.address}
          </div>
          <div>
            Phone Number: {item.phone}
          </div>

          {loadingRental[item.customer_id] ? (
            <div>Loading rentals...</div>
          ) : (
            <div>
              <h2>Currently Rented:</h2>
              <ul>
                {rentals[item.customer_id]?.filter((rent) => rent.return_date == null).map((rent, i) => (
                  <li key={i}><div>Title: {rent.title}</div> <div>Rental Date: {rent.rental_date}</div><button onClick={() => handleReturn(rent.rental_id)}>Returned</button></li> 
                ))}
              </ul>
              <h2>Previously Rented:</h2>
              <ul>
                {rentals[item.customer_id]?.filter((rent) => rent.return_date != null).map((rent, i) => (
                  <li key={i}><div>Title: {rent.title} </div><div>Rental Date: {rent.rental_date}</div><div>Return Date: {rent.return_date}</div></li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={handleAddUserClick}>Edit Customer</button><button onClick= {() => handleDelete(item.customer_id)}>Delete Customer</button>
          {editState && <EditFunc closeForm={handleCloseForm} item={item}/>}
        </details>
        
      ))}
    </>
  );
};
const EditFunc = ({ closeForm, item }) =>{
  const [formData, setFormData] = useState({
    firstName: item.first_name || '',
    lastName: item.last_name || '',
    email: item.email || '',
    phone: item.phone || '',
    address: item.address || '',
  });
  

  const handleAddUser= async () =>{
    if (!formData.firstName || !formData.lastName|| !formData.email|| !formData.phone|| !formData.address) {
      alert("Incomplete Info");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/editUser', {
        id: item.customer_id,
        aID: item.address_id,
        fName: formData.firstName,
        lName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
      });
      console.log('Edit success:', response);
      alert("Edit Successful :: Changes Will Be Reflected Upon Page Refresh");
      // Handle successful rental response here (e.g., show success message)
    } catch (error) {
      console.error('Edit failed:', error);
      alert("Failed to Add User");
      // Handle error response here (e.g., show error message)
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddUser() // In real scenario, send the data to an API here
    closeForm(); // Close the form after submission
  };

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value, // Update the corresponding field in the form data
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder={"First Name"}
      />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone #"
      />
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={closeForm}>Cancel</button>
    </form>
  );
}

const PaginatedItems = ({ itemsPerPage, items }) => {
  const [itemOffset, setItemOffset] = useState(0);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = items.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(items.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % items.length;
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
        pageClassName="page-item"
        pageLinkClassName="page-link"
        activeClassName="active"
        disabledClassName="disabled"
        breakClassName="break"
      />

    </>
  );
};

