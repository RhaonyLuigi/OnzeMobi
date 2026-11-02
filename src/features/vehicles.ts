// Editable reference values for the front-end demo, not specifications for a trim/year.
export const vehicleCatalog: Record<
  string,
  Record<
    string,
    {
      capacity: number;
      range: number;
      maxAcKw: number;
      maxDcKw: number;
    }
  >
> = {
  Audi: {
    "e-tron": { capacity: 95, range: 350, maxAcKw: 11, maxDcKw: 150 },
    "Q4 e-tron": { capacity: 82, range: 400, maxAcKw: 11, maxDcKw: 135 },
    "e-tron GT": { capacity: 93.4, range: 400, maxAcKw: 11, maxDcKw: 270 },
  },
  BMW: {
    iX1: { capacity: 64.7, range: 300, maxAcKw: 11, maxDcKw: 130 },
    i4: { capacity: 83.9, range: 400, maxAcKw: 11, maxDcKw: 200 },
    iX: { capacity: 111.5, range: 450, maxAcKw: 11, maxDcKw: 195 },
  },
  BYD: {
    King: { capacity: 18.3, range: 80, maxAcKw: 6.6, maxDcKw: 0 },
    Dolphin: { capacity: 44.9, range: 300, maxAcKw: 7, maxDcKw: 60 },
    Seal: { capacity: 82.5, range: 400, maxAcKw: 7, maxDcKw: 150 },
  },
  "Caoa Chery": {
    iCar: { capacity: 30.8, range: 200, maxAcKw: 6.6, maxDcKw: 0 },
    "Tiggo 7": { capacity: 19.3, range: 60, maxAcKw: 6.6, maxDcKw: 0 },
    "Tiggo 8": { capacity: 19.3, range: 60, maxAcKw: 6.6, maxDcKw: 0 },
  },
};
