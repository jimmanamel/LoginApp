import axios from 'axios';
import { Route } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:3000', // make sure this matches your backend port
  withCredentials: true, // send cookies
});

export default api;


// Issues
// 1) After finishing 15s in modal not navigating to / Route
// 2) /Dashboard route static content is accessible even if not logged in
// 3) After clicking continue modal wont appear again agter 2min