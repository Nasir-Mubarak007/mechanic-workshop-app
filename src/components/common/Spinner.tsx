import React from 'react';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Spinner;
