import React, { useEffect, useState } from "react";
import { CWLGraphView }  from "../components/graphic_cwl";
import { useNavigate } from "react-router-dom";
import { useParams } from 'react-router-dom';
import { CircularProgress,Button } from "@mui/material";
import axios from "axios";
import { Graphviz } from "@hpcc-js/wasm/graphviz";


function Home() {
  const navigate = useNavigate();
  const [cwlContent, setCwlContent] = useState(null);
  
  const [svg,setSvg] = useState(null);
  const URL = import.meta.env.VITE_API_URL || "http://localhost/";
  const { idCwl } = useParams();
  useEffect(() => {
    
    getCWL()
  }, []);

  

  const getCWL = async () => {
    
      console.log("id= ",idCwl);

    
    const token = localStorage.getItem("access_token");
    //console.log(token);
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const config =
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      console.log("id= ",idCwl);
      const res = await axios.get(`${URL}/api/data/view/${idCwl}`, config);

      const data = await res.data;
      
      const graphviz = await Graphviz.load();
      setSvg (graphviz.dot(data));
      //setCwlContent("pippo");
      console.log("s");
    }catch(error)
    {
      console.log("Error loading cwl",error);
    }
    
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col items-center">
  <h1 className="text-2xl font-bold mb-6">CWL Workflow Visualization</h1>

  {/* Contenitore per il grafico  */}
  <div className="w-full flex justify-center mb-6">
    {svg ? (
      <div 
        className="shadow-md p-4 bg-white rounded-lg" 
                dangerouslySetInnerHTML={{ __html: svg }} 
      />
    ) : (
      <div className="text-center py-20 text-gray-500 flex flex-col items-center gap-4">
        <p>Your CWL workflow is being visualized...</p>
        <CircularProgress />
      </div>
    )}
  </div>

  {/* Contenitore per il Button */}
  <div className="w-full flex justify-end">
    <Button 
      variant="contained" 
      onClick={() => navigate(-1)}
      className="bg-blue-600 hover:bg-blue-700" 
    >
      Back
    </Button>
  </div>
</div>
      
  );
}

export default Home;
