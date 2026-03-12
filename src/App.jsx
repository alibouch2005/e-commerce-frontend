import { BrowserRouter,Routes,Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Register from "./pages/Register";
// import Cart from "./pages/Cart";

function App(){

  return(

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Home />} />

         <Route path="/login" element={<Login />} />

       <Route path="/products" element={<Products />} />

        {/* <Route path="/cart" element={<Cart />} /> */}
        <Route path="/register" element={<Register />} />
      </Routes>

    </BrowserRouter>

  )

}

export default App;