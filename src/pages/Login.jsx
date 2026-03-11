import { useState } from "react";
import { login } from "../services/authService";

import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [error,setError] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

    try{

      const res = await login(email,password);

      console.log(res.data.user);

      alert("Connexion réussie");

    }catch(err){

      const message =
        err?.response?.data?.message || "Erreur login";

      console.log(message);

      setError(message);

    }

  };

  return (

    <div className="max-w-md mx-auto mt-20">

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >

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