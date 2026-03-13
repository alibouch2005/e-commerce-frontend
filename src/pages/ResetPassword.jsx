import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ResetPassword(){

const [params] = useSearchParams();

const token = params.get("token");
const email = params.get("email");

const [password,setPassword] = useState("");
const [passwordConfirmation,setPasswordConfirmation] = useState("");

const handleSubmit = async(e)=>{

e.preventDefault();

try{

await resetPassword({
token,
email,
password,
password_confirmation:passwordConfirmation
});

alert("Mot de passe réinitialisé");

}catch(err){

console.log(err.response?.data);

}

};

return(

<div className="max-w-md mx-auto mt-20">

<h1 className="text-2xl font-bold mb-6">
Réinitialiser mot de passe
</h1>

<form
onSubmit={handleSubmit}
className="flex flex-col gap-4"
>

<Input
type="email"
value={email}
disabled
/>

<Input
type="password"
placeholder="Nouveau mot de passe"
onChange={(e)=>setPassword(e.target.value)}
/>

<Input
type="password"
placeholder="Confirmer mot de passe"
onChange={(e)=>setPasswordConfirmation(e.target.value)}
/>

<Button type="submit">
Réinitialiser
</Button>

</form>

</div>

);

}