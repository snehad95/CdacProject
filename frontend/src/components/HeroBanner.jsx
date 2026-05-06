import React from 'react';

const HeroBanner = () => {
  return (
    <div style={{ background: "linear-gradient(135deg, #cbb6e9, #93c5fd, #a78bfa)", padding: '10px' }}>
      <div className="container my-5 d-flex justify-content-center ">

        <div
          className="shadow"
          style={{
            width: "100%",
            maxWidth: "1800px",
            height: "clamp(120px, 25vw, 260px)", // responsive height
            borderRadius: "50px",
            overflow: "hidden",
            padding: "5px",
            background: 'white',
          }}
        >
          {/* Gradient wrapper behind the image */}
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "45px",
              background: "linear-gradient(135deg, #cbb6e9, #93c5fd, #a78bfa)",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/cdac_logo.jpg"
              alt="C-DAC Delhi"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover", 
                objectPosition: "left center",
                borderRadius: "45px", 
              }}
            />
          </div>
        </div>

      </div>
    </div>

  );
};

export default HeroBanner;
