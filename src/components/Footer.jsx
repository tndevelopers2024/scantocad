import React from 'react';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="text-center py-4 text-sm text-gray-500">
      &copy; {year} convertscantocad.com. All rights reserved.
    </footer>
  );
};

export default Footer;
