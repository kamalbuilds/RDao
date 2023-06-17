import React from 'react';
import fileupload from '../components/lighthouse/fileupload';
import Storeonceramic from '../components/Storeonceramic';

const MyComponent = () => {
  const handleFileUpload = async (e : any) => {
    try {
      const accessToken = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY as string;
      const result = await fileupload(e, accessToken);
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <Storeonceramic />
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
};

export default MyComponent;
