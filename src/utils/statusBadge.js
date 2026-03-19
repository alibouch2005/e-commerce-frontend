export const getStatusStyle = (status) => {
  switch (status) {
    case "En attente":
      return "bg-yellow-100 text-yellow-700";

    case "Preparation":
      return "bg-blue-100 text-blue-700";

    case "Expedie":
      return "bg-purple-100 text-purple-700";

    case "Livre":
      return "bg-green-100 text-green-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};