export interface Airport {
    city: string;
    airport: string;
    code: string;
    terminal: string;
  }
  
export interface Flight {
    id: string;
    from: Airport;
    to: Airport;
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    flightNumber: string;
    airline: string;
    aircraft: string;
    status: string;
    price: number;
    class: string;
    bookingCode: string;
    cancellationReason?: string;
  }