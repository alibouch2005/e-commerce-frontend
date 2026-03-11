import { useEffect } from "react";
import api from "./Api/axios";
function App() {

  useEffect(() => {

    api.get("/api/products?page=1")
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });

  }, []);

  return (
    <h1 >Frontend React connecté à Laravel</h1>
  );
}

export default App;