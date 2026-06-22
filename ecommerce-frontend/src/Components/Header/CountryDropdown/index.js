import { useState } from 'react';
import Button from '@mui/material/Button';
import { FaAngleDown } from "react-icons/fa6";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const countries = [
  "India",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France"
];

const CountryDropdown = () => {
   const [open, setOpen] = useState(false);
   const [selectedCountry, setSelectedCountry] = useState("India");

   const handleClickOpen = () => {
      setOpen(true);
   };

   const handleClose = () => {
      setOpen(false);
   };

   const handleSelect = (country) => {
      setSelectedCountry(country);
      setOpen(false);
   };

   return (
      <>
         <Button className='countryDrop' onClick={handleClickOpen}>
            <div className='info d-flex flex-column'>
               <span className='label'>YOUR LOCATION</span>
               <span className='name'>{selectedCountry.toUpperCase()}</span>
            </div>
            <span className='ml-auto'><FaAngleDown /></span>
         </Button>

         <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Select Location</DialogTitle>
            <List sx={{ pt: 0, minWidth: '250px' }}>
               {countries.map((country) => (
                  <ListItem disablePadding key={country}>
                     <ListItemButton onClick={() => handleSelect(country)}>
                        <ListItemText primary={country} />
                     </ListItemButton>
                  </ListItem>
               ))}
            </List>
         </Dialog>
      </>
   )
}


export default CountryDropdown;
/*Is poore code ko beginner level se samjhao.
Har line me kyu likha gaya hai, agar ye line na ho to kya problem hogi,
aur real-life example ke saath samjhao.
Mujhe React / JS bilkul basic se samajhna hai.”*/