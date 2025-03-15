import React, { useState } from 'react';
import SearchCustomer from './Component/SearchUser';
import axios from 'axios';

// Customers Component
export default function Customers() {
  const [isAddUserVisible, setIsAddUserVisible] = useState(false); // State to control form visibility

  const handleAddUserClick = () => {
    setIsAddUserVisible(true); // Show the Add User form
  };

  const handleCloseForm = () => {
    setIsAddUserVisible(false); // Close the form
  };

  return (
    <>
      <nav>
        <h1>Customers</h1>
        <div className="container">
          <section>
            <a id="top1" href="/">Home</a>
            <a id="top2" href="/FilmsPage">Films</a>
            <a id="top3" href="/CustomersPage">Customers</a>
          </section>
        </div>
      </nav>

      {/* Search and Customer list */}
      <SearchCustomer />

      {/* Add User Button */}
      <div>
        <button onClick={handleAddUserClick}>Add User</button>
      </div>

      {/* Conditionally render Add User form */}
      {isAddUserVisible && <AddUser closeForm={handleCloseForm} />}
    </>
  );
}

// AddUser Form Component
const AddUser = ({ closeForm }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
  });

  const handleAddUser= async () =>{
    if (!formData.firstName || !formData.lastName|| !formData.email|| !formData.phone|| !formData.postalCode|| !formData.address) {
      alert("Incomplete Info");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/addUser', {
        fName: formData.firstName,
        lName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        postalCode: formData.postalCode
      });
      console.log('Add User success:', response);
      alert("Add User Successful :: Changes Will Be Reflected Upon Page Refresh");
      // Handle successful rental response here (e.g., show success message)
    } catch (error) {
      alert("Add User Unsuccessful");
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
        class="new"
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        class="new"
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        class="new"
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <input
        class="new"
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone #"
      />
      <input
        class="new"
        type="text"
        name="address"
        value={formData.address}
        onChange={handleChange}
        placeholder="Address"
      />
      <input
        class="new"
        type="text"
        name="postalCode"
        value={formData.postalCode}
        onChange={handleChange}
        placeholder="Postal Code"
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={closeForm}>Cancel</button>
    </form>
  );
};
