import React from 'react';

const Logo = ({ className = '', alt = 'Logo', ...rest }) => {
  const handleError = (event) => {
    if (event.target.src.endsWith('/Logotipe.png')) {
      event.target.src = '/logo5.png';
    }
  };

  return (
    <img
      src="/Logotipe.png"
      alt={alt}
      className={`logo-image ${className}`.trim()}
      onError={handleError}
      {...rest}
    />
  );
};

export default Logo;
