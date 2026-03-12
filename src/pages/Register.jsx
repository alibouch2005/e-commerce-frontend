import { useState } from "react";
import { register } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function Register(){

const [form,setForm] = useState({
name:"",
email:"",
phone:"",
address:"",
role:"client",
password:"",
password_confirmation:""
});

const handleChange = (e)=>{
setForm({
...form,
[e.target.name]:e.target.value
});
};

const handleSubmit = async (e)=>{
e.preventDefault();

try{

await register(form);

alert("Compte créé avec succès");

}catch(err){

console.log(err.response?.data);

}

};

return(

<div className="max-w-md mx-auto mt-20">

<h1 className="text-2xl font-bold mb-6">
Créer un compte
</h1>

<form
onSubmit={handleSubmit}
className="flex flex-col gap-4"
>

<Input
name="name"
placeholder="Nom"
onChange={handleChange}
/>

<Input
name="email"
type="email"
placeholder="Email"
onChange={handleChange}
/>

<Input
name="phone"
placeholder="Téléphone"
onChange={handleChange}
/>

<Input
name="address"
placeholder="Adresse (optionnel)"
onChange={handleChange}
/>

<select
name="role"
onChange={handleChange}
className="border rounded-lg p-2"
>

<option value="client">Client</option>
<option value="livreur">Livreur</option>

</select>

<Input
name="password"
type="password"
placeholder="Mot de passe"
onChange={handleChange}
/>

<Input
name="password_confirmation"
type="password"
placeholder="Confirmer mot de passe"
onChange={handleChange}
/>

<Button type="submit" fullWidth>
S'inscrire
</Button>

</form>

</div>

);

}