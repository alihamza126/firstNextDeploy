// // import * as cocoSsd from '@tensorflow-models/coco-ssd';
// // import * as tf from '@tensorflow/tfjs';

// export default function Home() {

//   return (
//     <>
//       main page
//     </>
//   );
// }

"use client";

import axios from 'axios';
import React, { useState } from 'react';

export default function DownloadPage() {
  const [urlDownload, setUrlDownload] = useState('');
  const [loading, setLoading] = useState(false);
  const [url,setUrl]=useState('')

  // const url = 'https://pin.it/4aMkq1rrj'; // Replace with actual URL or obtain it dynamically

  const handleDownload = async () => {
    setLoading(true); // Set loading to true while fetching
    try {
      const res = await axios.get(`/api/download?url=${url}`, {
        timeout: 60000, // Set timeout to 60 seconds (60000 milliseconds)
      });
      setUrlDownload(res.data); // Set the downloaded URL
      console.log(res.data);
    } catch (error) {
      console.error('Error during the request:', error.message);
    } finally {
      setLoading(false); // Set loading to false after fetching is done
    }
  };

  return (
    <div>
      <h1>Download Video</h1>
      <br />
      <input type="url" name="url" id="url" placeholder='enter url' onChange={(e)=>setUrl(e.target.value)}/>
      <br /> <br /><button onClick={handleDownload} disabled={loading}>
        {loading ? 'Downloading...' : 'Handle Download'}
      </button>

      {urlDownload && (
        <a href={urlDownload} download={true}>
          Download
        </a>
      )}
    </div>
  );
}
