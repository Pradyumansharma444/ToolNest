import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ToolLayout } from '@/components/tools/ToolLayout';
import { getToolById } from '@/data/tools';

const ELEMENTS = [
  { z: 1, sym: 'H', name: 'Hydrogen', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 2, sym: 'He', name: 'Helium', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  { z: 3, sym: 'Li', name: 'Lithium', cat: 'alkali', color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100' },
  { z: 4, sym: 'Be', name: 'Beryllium', cat: 'alkaline', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  { z: 5, sym: 'B', name: 'Boron', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 6, sym: 'C', name: 'Carbon', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 7, sym: 'N', name: 'Nitrogen', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 8, sym: 'O', name: 'Oxygen', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 9, sym: 'F', name: 'Fluorine', cat: 'halogen', color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100' },
  { z: 10, sym: 'Ne', name: 'Neon', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  { z: 11, sym: 'Na', name: 'Sodium', cat: 'alkali', color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100' },
  { z: 12, sym: 'Mg', name: 'Magnesium', cat: 'alkaline', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  { z: 13, sym: 'Al', name: 'Aluminium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 14, sym: 'Si', name: 'Silicon', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 15, sym: 'P', name: 'Phosphorus', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 16, sym: 'S', name: 'Sulfur', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 17, sym: 'Cl', name: 'Chlorine', cat: 'halogen', color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100' },
  { z: 18, sym: 'Ar', name: 'Argon', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  { z: 19, sym: 'K', name: 'Potassium', cat: 'alkali', color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100' },
  { z: 20, sym: 'Ca', name: 'Calcium', cat: 'alkaline', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  { z: 21, sym: 'Sc', name: 'Scandium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 22, sym: 'Ti', name: 'Titanium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 23, sym: 'V', name: 'Vanadium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 24, sym: 'Cr', name: 'Chromium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 25, sym: 'Mn', name: 'Manganese', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 26, sym: 'Fe', name: 'Iron', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 27, sym: 'Co', name: 'Cobalt', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 28, sym: 'Ni', name: 'Nickel', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 29, sym: 'Cu', name: 'Copper', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 30, sym: 'Zn', name: 'Zinc', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 31, sym: 'Ga', name: 'Gallium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 32, sym: 'Ge', name: 'Germanium', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 33, sym: 'As', name: 'Arsenic', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 34, sym: 'Se', name: 'Selenium', cat: 'nonmetal', color: 'bg-red-200 text-red-900 dark:bg-red-900 dark:text-red-100' },
  { z: 35, sym: 'Br', name: 'Bromine', cat: 'halogen', color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100' },
  { z: 36, sym: 'Kr', name: 'Krypton', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  { z: 37, sym: 'Rb', name: 'Rubidium', cat: 'alkali', color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100' },
  { z: 38, sym: 'Sr', name: 'Strontium', cat: 'alkaline', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  { z: 39, sym: 'Y', name: 'Yttrium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 40, sym: 'Zr', name: 'Zirconium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 41, sym: 'Nb', name: 'Niobium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 42, sym: 'Mo', name: 'Molybdenum', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 43, sym: 'Tc', name: 'Technetium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 44, sym: 'Ru', name: 'Ruthenium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 45, sym: 'Rh', name: 'Rhodium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 46, sym: 'Pd', name: 'Palladium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 47, sym: 'Ag', name: 'Silver', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 48, sym: 'Cd', name: 'Cadmium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 49, sym: 'In', name: 'Indium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 50, sym: 'Sn', name: 'Tin', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 51, sym: 'Sb', name: 'Antimony', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 52, sym: 'Te', name: 'Tellurium', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 53, sym: 'I', name: 'Iodine', cat: 'halogen', color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100' },
  { z: 54, sym: 'Xe', name: 'Xenon', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  { z: 55, sym: 'Cs', name: 'Caesium', cat: 'alkali', color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100' },
  { z: 56, sym: 'Ba', name: 'Barium', cat: 'alkaline', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  { z: 57, sym: 'La', name: 'Lanthanum', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 58, sym: 'Ce', name: 'Cerium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 59, sym: 'Pr', name: 'Praseodymium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 60, sym: 'Nd', name: 'Neodymium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 61, sym: 'Pm', name: 'Promethium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 62, sym: 'Sm', name: 'Samarium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 63, sym: 'Eu', name: 'Europium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 64, sym: 'Gd', name: 'Gadolinium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 65, sym: 'Tb', name: 'Terbium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 66, sym: 'Dy', name: 'Dysprosium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 67, sym: 'Ho', name: 'Holmium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 68, sym: 'Er', name: 'Erbium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 69, sym: 'Tm', name: 'Thulium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 70, sym: 'Yb', name: 'Ytterbium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 71, sym: 'Lu', name: 'Lutetium', cat: 'lanthanide', color: 'bg-pink-200 text-pink-900 dark:bg-pink-900 dark:text-pink-100' },
  { z: 72, sym: 'Hf', name: 'Hafnium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 73, sym: 'Ta', name: 'Tantalum', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 74, sym: 'W', name: 'Tungsten', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 75, sym: 'Re', name: 'Rhenium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 76, sym: 'Os', name: 'Osmium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 77, sym: 'Ir', name: 'Iridium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 78, sym: 'Pt', name: 'Platinum', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 79, sym: 'Au', name: 'Gold', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 80, sym: 'Hg', name: 'Mercury', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 81, sym: 'Tl', name: 'Thallium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 82, sym: 'Pb', name: 'Lead', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 83, sym: 'Bi', name: 'Bismuth', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 84, sym: 'Po', name: 'Polonium', cat: 'metalloid', color: 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-100' },
  { z: 85, sym: 'At', name: 'Astatine', cat: 'halogen', color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100' },
  { z: 86, sym: 'Rn', name: 'Radon', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
  { z: 87, sym: 'Fr', name: 'Francium', cat: 'alkali', color: 'bg-orange-200 text-orange-900 dark:bg-orange-900 dark:text-orange-100' },
  { z: 88, sym: 'Ra', name: 'Radium', cat: 'alkaline', color: 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100' },
  { z: 89, sym: 'Ac', name: 'Actinium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 90, sym: 'Th', name: 'Thorium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 91, sym: 'Pa', name: 'Protactinium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 92, sym: 'U', name: 'Uranium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 93, sym: 'Np', name: 'Neptunium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 94, sym: 'Pu', name: 'Plutonium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 95, sym: 'Am', name: 'Americium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 96, sym: 'Cm', name: 'Curium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 97, sym: 'Bk', name: 'Berkelium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 98, sym: 'Cf', name: 'Californium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 99, sym: 'Es', name: 'Einsteinium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 100, sym: 'Fm', name: 'Fermium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 101, sym: 'Md', name: 'Mendelevium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 102, sym: 'No', name: 'Nobelium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 103, sym: 'Lr', name: 'Lawrencium', cat: 'actinide', color: 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-100' },
  { z: 104, sym: 'Rf', name: 'Rutherfordium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 105, sym: 'Db', name: 'Dubnium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 106, sym: 'Sg', name: 'Seaborgium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 107, sym: 'Bh', name: 'Bohrium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 108, sym: 'Hs', name: 'Hassium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 109, sym: 'Mt', name: 'Meitnerium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 110, sym: 'Ds', name: 'Darmstadtium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 111, sym: 'Rg', name: 'Roentgenium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 112, sym: 'Cn', name: 'Copernicium', cat: 'transition', color: 'bg-indigo-200 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100' },
  { z: 113, sym: 'Nh', name: 'Nihonium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 114, sym: 'Fl', name: 'Flerovium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 115, sym: 'Mc', name: 'Moscovium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 116, sym: 'Lv', name: 'Livermorium', cat: 'metal', color: 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-100' },
  { z: 117, sym: 'Ts', name: 'Tennessine', cat: 'halogen', color: 'bg-cyan-200 text-cyan-900 dark:bg-cyan-900 dark:text-cyan-100' },
  { z: 118, sym: 'Og', name: 'Oganesson', cat: 'noble', color: 'bg-purple-200 text-purple-900 dark:bg-purple-900 dark:text-purple-100' },
];

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'nonmetal', label: 'Nonmetals' },
  { key: 'noble', label: 'Noble Gases' },
  { key: 'alkali', label: 'Alkali Metals' },
  { key: 'alkaline', label: 'Alkaline Earth' },
  { key: 'metalloid', label: 'Metalloids' },
  { key: 'halogen', label: 'Halogens' },
  { key: 'metal', label: 'Post-Transition' },
  { key: 'transition', label: 'Transition Metals' },
  { key: 'lanthanide', label: 'Lanthanides' },
  { key: 'actinide', label: 'Actinides' },
];

export default function PeriodicTable() {
  const tool = getToolById('periodic-table')!;
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<typeof ELEMENTS[0] | null>(null);

  const filtered = useMemo(() => {
    return ELEMENTS.filter(el => {
      const matchSearch = !search || el.name.toLowerCase().includes(search.toLowerCase()) || el.sym.toLowerCase().includes(search.toLowerCase()) || el.z.toString().includes(search);
      const matchCat = category === 'all' || el.cat === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  return (
    <ToolLayout tool={tool} resultVisible={true}>
      <div className="rounded-xl border bg-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, symbol, or number..." className="pl-9" />
          </div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-1.5">
          {filtered.map(el => (
            <button
              key={el.z}
              onClick={() => setSelected(el)}
              className={`rounded-md p-1.5 text-center cursor-pointer transition-all hover:scale-105 ${el.color} ${selected?.z === el.z ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <p className="text-[10px] opacity-70">{el.z}</p>
              <p className="text-sm font-bold">{el.sym}</p>
              <p className="text-[9px] truncate opacity-80">{el.name}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="rounded-lg border-2 border-primary/20 bg-muted/30 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${selected.color}`}>{selected.sym}</div>
                <div>
                  <p className="text-xl font-bold">{selected.name}</p>
                  <p className="text-sm text-muted-foreground">Atomic Number {selected.z}</p>
                </div>
              </div>
              <Badge>{CATEGORIES.find(c => c.key === selected.cat)?.label || selected.cat}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md bg-background p-2"><span className="text-muted-foreground">Symbol</span><br />{selected.sym}</div>
              <div className="rounded-md bg-background p-2"><span className="text-muted-foreground">Atomic Number</span><br />{selected.z}</div>
              <div className="rounded-md bg-background p-2"><span className="text-muted-foreground">Category</span><br />{CATEGORIES.find(c => c.key === selected.cat)?.label}</div>
              <div className="rounded-md bg-background p-2"><span className="text-muted-foreground">Phase at STP</span><br />{selected.z <= 2 || [5, 6, 7, 8, 9, 10, 14, 15, 16, 17, 18, 34, 35, 36, 53, 54, 80, 86].includes(selected.z) ? [1, 2, 7, 8, 9, 10, 17, 18, 35, 36, 54, 80, 86].includes(selected.z) ? selected.z === 80 ? 'Liquid' : selected.z >= 86 ? 'Gas' : 'Gas' : selected.z === 35 ? 'Liquid' : 'Gas' : 'Solid'}</div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
