import React, { useEffect } from 'react';
import AdBanner from './AdBanner';

const AdDialog = ({ onClose }) => {
  useEffect(() => {
    // Load ads when component mounts
    if (window.adsbygoogle) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Ad loading error:', e);
      }
    }
  }, []);

  return (
    <div className="ad-dialog">
      <div className="ad-dialog-content">
        <h2>Hỗ Trợ Trò Chơi Của Chúng Tôi!</h2>
      <i> <p className="text-color-ads">Chịu khó xem ads xíu xiu nhoa các tình iuu!!!!</p></i> 
        <AdBanner slot="3779491168688544" format="rectangle" />
        <button className="close-ad-button" onClick={onClose}>
          Tiếp Tục Chơi
        </button>
      </div>
    </div>
  );
};

export default AdDialog;