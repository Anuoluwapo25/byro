import axios from "axios";



/**Endpoint for payment */
const axiosInstance = axios.create({
  baseURL: "https://bryo-dapp.onrender.com/api",
  // baseURL: "http://127.0.0.1:8000/api",
});


export default axiosInstance;
