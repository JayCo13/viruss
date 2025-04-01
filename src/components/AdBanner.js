import React, { useEffect, useRef } from 'react';

const AdBanner = ({ slot, format }) => {
  const adRef = useRef(null);
  
  useEffect(() => {
    // Only attempt to load ads if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        // Clean up any existing ad
        if (adRef.current && adRef.current.innerHTML !== '') {
          adRef.current.innerHTML = '';
        }
        
        // Push the ad after the component mounts
        ((window.adsbygoogle = window.adsbygoogle || [])).push({});
      } catch (error) {
        console.error('Ad loading error:', error);
      }
    }
  }, [slot]); // Re-initialize if slot changes

  return (
    <div className="ad-container">
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3779491168688544"
        data-ad-slot={slot}
        data-ad-format={format || 'auto'}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;