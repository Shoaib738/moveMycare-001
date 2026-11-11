/**
 * MoveMyCar UAE - Centralized Mock Data Engine
 * Realistic UAE locations, driver rosters, vehicle categories, demo telemetry, and high-res luxury fleet
 */

const UAE_LOCATIONS = {
  marina: { id: 'marina', name: 'Dubai Marina', emirate: 'Dubai', coords: [25.0805, 55.1403] },
  downtown: { id: 'downtown', name: 'Downtown Dubai', emirate: 'Dubai', coords: [25.1972, 55.2744] },
  alquoz: { id: 'alquoz', name: 'Al Quoz Auto Hub', emirate: 'Dubai', coords: [25.1400, 55.2300] },
  dip: { id: 'dip', name: 'Dubai Investments Park', emirate: 'Dubai', coords: [24.9850, 55.1700] },
  dxb: { id: 'dxb', name: 'Dubai Int Airport (DXB)', emirate: 'Dubai', coords: [25.2532, 55.3657] },
  businessbay: { id: 'businessbay', name: 'Business Bay', emirate: 'Dubai', coords: [25.1837, 55.2708] },
  jafza: { id: 'jafza', name: 'Jebel Ali Free Zone', emirate: 'Dubai', coords: [24.9922, 55.0815] },
  
  auh: { id: 'auh', name: 'Abu Dhabi Corniche', emirate: 'Abu Dhabi', coords: [24.4539, 54.3773] },
  reem: { id: 'reem', name: 'Al Reem Island', emirate: 'Abu Dhabi', coords: [24.4990, 54.4040] },
  yas: { id: 'yas', name: 'Yas Marina', emirate: 'Abu Dhabi', coords: [24.4984, 54.6062] },
  mussafah: { id: 'mussafah', name: 'Mussafah Industrial Hub', emirate: 'Abu Dhabi', coords: [24.3644, 54.4916] },
  ain: { id: 'ain', name: 'Al Ain Central', emirate: 'Abu Dhabi', coords: [24.2075, 55.7447] },
  
  shj: { id: 'shj', name: 'Sharjah Auto Village', emirate: 'Sharjah', coords: [25.3463, 55.4209] },
  ajm: { id: 'ajm', name: 'Ajman City', emirate: 'Ajman', coords: [25.4052, 55.5136] },
  rak: { id: 'rak', name: 'Ras Al Khaimah', emirate: 'RAK', coords: [25.7895, 55.9432] },
  fuj: { id: 'fuj', name: 'Fujairah Port Hub', emirate: 'Fujairah', coords: [25.1288, 56.3265] },
  uaq: { id: 'uaq', name: 'Umm Al Quwain', emirate: 'UAQ', coords: [25.5647, 55.5552] }
};

const VEHICLE_TYPES = {
  sedan: { id: 'sedan', label: 'Saloon / Sedan', mult: 1.0, icon: '🚗' },
  suv: { id: 'suv', label: 'SUV / 4x4 (Patrol, Land Cruiser)', mult: 1.15, icon: '🚙' },
  prestige: { id: 'prestige', label: 'Prestige & Exotic (Porsche, Rolls-Royce, BMW)', mult: 1.45, icon: '🏎️' },
  van: { id: 'van', label: 'Van / Light Commercial', mult: 1.25, icon: '🚐' }
};

// High-Resolution Modern Luxury Cars (BMW, Rolls-Royce, Mercedes, Porsche, etc.)
const LUXURY_FLEET = [
  {
    id: 'rollroy-ghost',
    name: 'Rolls-Royce Ghost Extended',
    category: 'luxury',
    tag: 'Ultra-Luxury VIP Handover',
    engine: '6.75L V12 Twin-Turbo',
    seats: '4 Seats · Executive Suite',
    basePrice: 580,
    photo: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=800&q=85',
    vehType: 'prestige'
  },
  {
    id: 'bmw-m8',
    name: 'BMW M8 Competition Gran Coupe',
    category: 'sports',
    tag: 'Prestige Performance',
    engine: '4.4L V8 · 617 HP',
    seats: '5 Seats · M xDrive',
    basePrice: 480,
    photo: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=85',
    vehType: 'prestige'
  },
  {
    id: 'mercedes-g63',
    name: 'Mercedes-AMG G63 BiTurbo',
    category: 'suv',
    tag: 'Prestige 4x4 Transit',
    engine: '4.0L V8 · 577 HP',
    seats: '5 Seats · All-Terrain',
    basePrice: 520,
    photo: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=85',
    vehType: 'suv'
  },
  {
    id: 'porsche-911',
    name: 'Porsche 911 GT3 RS',
    category: 'sports',
    tag: 'Exotic Supercar Relocation',
    engine: '4.0L Flat-6 · 518 HP',
    seats: '2 Seats · Track Spec',
    basePrice: 540,
    photo: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=85',
    vehType: 'prestige'
  },
  {
    id: 'range-rover',
    name: 'Range Rover SV Autobiography',
    category: 'suv',
    tag: 'Executive Long Wheelbase',
    engine: '4.4L V8 Twin-Turbo',
    seats: '5 Seats · First Class',
    basePrice: 460,
    photo: 'https://images.unsplash.com/photo-1606611013016-969c19ba27bb?auto=format&fit=crop&w=800&q=85',
    vehType: 'suv'
  },
  {
    id: 'bmw-7series',
    name: 'BMW 7 Series 760i xDrive',
    category: 'luxury',
    tag: 'Flagship Luxury Sedan',
    engine: 'TwinPower Turbo V8',
    seats: '5 Seats · Executive Lounge',
    basePrice: 440,
    photo: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=85',
    vehType: 'sedan'
  }
];

const DRIVER_ROSTER = [
  { id: 'DRV-101', name: 'Omar Saeed', rating: 4.98, trips: 1420, emiratesId: '784-1988-******-1', carExp: 'Rolls-Royce & Exotic', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', status: 'Available', distKm: 2.4 },
  { id: 'DRV-102', name: 'Joseph Paul', rating: 4.95, trips: 980, emiratesId: '784-1992-******-3', carExp: 'BMW & AMG Specialist', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', status: 'On Trip', distKm: 5.1 },
  { id: 'DRV-103', name: 'Rashid Mansoor', rating: 4.99, trips: 2150, emiratesId: '784-1985-******-8', carExp: 'Fleet & Dealerships', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80', status: 'Available', distKm: 1.8 },
  { id: 'DRV-104', name: 'Vikram Patel', rating: 4.92, trips: 760, emiratesId: '784-1994-******-4', carExp: 'SUV & 4x4 Certified', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', status: 'Available', distKm: 3.2 }
];

const INITIAL_JOBS = [
  {
    ref: 'MMC-7821',
    dealer: 'Al Nabooda Automobiles',
    vehicle: 'Rolls-Royce Ghost Extended',
    vin: 'SCA664S50MU8912',
    plate: 'Dubai V 4921',
    from: 'alquoz',
    to: 'yas',
    driver: 'Omar Saeed',
    status: 'In Transit',
    speed: 84,
    time: '14:20',
    eta: '38 min',
    cost: 580,
    km: 118
  },
  {
    ref: 'MMC-6490',
    dealer: 'Gargash Motors (Mercedes-Benz)',
    vehicle: 'Mercedes-AMG G63',
    vin: 'W1N4632341X8911',
    plate: 'Abu Dhabi 5 7712',
    from: 'downtown',
    to: 'auh',
    driver: 'Rashid Mansoor',
    status: 'Delivered',
    speed: 0,
    time: '11:15',
    eta: 'Completed',
    cost: 520,
    km: 135
  },
  {
    ref: 'MMC-9012',
    dealer: 'AGMC BMW Dubai',
    vehicle: 'BMW M8 Competition Gran Coupe',
    vin: 'WBA83CF00NC8129',
    plate: 'Dubai K 81920',
    from: 'dip',
    to: 'shj',
    driver: null,
    status: 'Unassigned',
    speed: 0,
    time: '15:45',
    eta: 'Pending Driver',
    cost: 480,
    km: 56
  },
  {
    ref: 'MMC-3341',
    dealer: 'Al Tayer Motors (Range Rover)',
    vehicle: 'Range Rover SV Autobiography',
    vin: 'SALWR2VF5LA89120',
    plate: 'Sharjah 3 1184',
    from: 'shj',
    to: 'downtown',
    driver: null,
    status: 'Unassigned',
    speed: 0,
    time: '16:00',
    eta: 'Pending Driver',
    cost: 460,
    km: 42
  }
];

const HANDOVER_PHOTOS = [
  { label: 'Front Grille & Spirit of Ecstasy', url: 'https://images.unsplash.com/photo-1631295868223-63265b40d9e4?auto=format&fit=crop&w=400&q=80', status: 'Clean' },
  { label: 'Rear Bumper & Dual Exhaust', url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=400&q=80', status: 'Clean' },
  { label: 'Left Coach Doors & Panels', url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=400&q=80', status: 'Clean' },
  { label: 'Right Flank & Mirror', url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=400&q=80', status: 'Verified' },
  { label: 'Starlight Headliner & Dashboard', url: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=400&q=80', status: 'Pristine' },
  { label: 'Digital Odometer (14,210 km)', url: 'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80', status: 'Verified' },
  { label: 'Alloy Wheels & Floating Caps', url: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=400&q=80', status: 'No Scuffs' },
  { label: 'Boot Compartment & Toolkit', url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=400&q=80', status: 'Clean' }
];

window.UAE_LOCATIONS = UAE_LOCATIONS;
window.VEHICLE_TYPES = VEHICLE_TYPES;
window.LUXURY_FLEET = LUXURY_FLEET;
window.DRIVER_ROSTER = DRIVER_ROSTER;
window.INITIAL_JOBS = INITIAL_JOBS;
window.HANDOVER_PHOTOS = HANDOVER_PHOTOS;
