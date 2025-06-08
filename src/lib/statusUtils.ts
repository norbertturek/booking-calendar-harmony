export const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Potwierdzona';
    case 'pending':
      return 'Oczekująca';
    case 'completed':
      return 'Zakończona';
    case 'cancelled':
      return 'Anulowana';
    default:
      return status;
  }
};