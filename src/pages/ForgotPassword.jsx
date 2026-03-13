import { useState } from "react";
import { forgotPassword } from "../services/authService";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

export default function ForgotPassword(){

const [email,setEmail] = useState("");
const [message,setMessage] = useState("");

const handleSubmit = async (e)=>{

e.preventDefault();

try{

await forgotPassword(email);

setMessage("Email de réinitialisation envoyé");

}catch(err){

console.log(err.response?.data);

}

};

return(

<div className="max-w-md mx-auto mt-20">

<h1 className="text-2xl font-bold mb-6">
Mot de passe oublié
</h1>

<form
onSubmit={handleSubmit}
className="flex flex-col gap-4"
>

<Input
type="email"
placeholder="Email"
value={email}
onChange={(e)=>setEmail(e.target.value)}
/>

<Button type="submit">
Envoyer
</Button>

</form>

{message && (
<p className="text-green-600 mt-4">
{message}
</p>
)}

</div>

)

}