import { useState , useContext} from "react";
import { login } from "../services/authService";

import { AuthContext } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");
  
  const { setUser } = useContext(AuthContext);// Récupérer la fonction setUser du contexte d'authentification
  const handleSubmit = async (e) => {

    e.preventDefault();

    try{

      const res = await login(email,password);

      console.log(res.data.user);
      setUser(res.data.user); // Mettre à jour l'état de l'utilisateur dans le contexte d'authentification
      alert("Connexion réussie");

    }catch(err){

      const message =
        err?.response?.data?.message ;

      console.log(message);

      setError(message);

    }

  };

  return (

    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Connexion</h1>

        <Input
          label="Email"
          type="email"
          placeholder="Votre email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <Button type="submit" variant="primary" size="md" >
          Se connecter
        </Button>

      </form>

    </div>

  );

}