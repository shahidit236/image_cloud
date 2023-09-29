import React, { useEffect, useState } from "react";
import axios from "axios";

const ImageComponent = () => {
  const [imageUrls, setImageUrls] = useState([]);

  useEffect(() => {
    const getImageUrls = async () => {
      try {
        const response = await axios.get("http://localhost:3001/getImages");
        setImageUrls(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    getImageUrls();
  }, []);

  return (
    <div>
      {imageUrls.map((imageUrl, index) => (
        <img key={index} src={imageUrl} alt={`Uploaded ${index}`}  height="200px" width="300px"/>
      ))}
    </div>
  );
};

export default ImageComponent;
