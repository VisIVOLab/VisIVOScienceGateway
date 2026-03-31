
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Avatar } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { ConnectingAirportsOutlined, UploadFile } from "@mui/icons-material";
import Button from '@mui/material/Button';
import React, { useState } from "react";



const Upload_button = ({ onFileSubmit }) => {
	const [selectedFile, setSelectedFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [error, setError] = useState(null);
    const ALLOWED_EXTENSIONS = ['.cwl', '.yaml', '.yml'];
    const [dirName, setDirName] = useState("");     


    const onFileChange = (event) => {
        setError(null); 
        if (event.target.files && event.target.files.length > 0) {
            // Converte la FileList (che non è un vero array) in un array
            setSelectedFiles(Array.from(event.target.files));
        } else {
            setSelectedFiles([]); // Resetta a un array vuoto
        }
    };
	
	const fileData = () => {
        console.log(dirName);
		if (selectedFiles.length == 3){

        
               return (
                <div className="my-4 text-left">
                    <h4 className="font-semibold">File selezionati:</h4>
                    <ul className="list-disc list-inside text-sm max-h-32 overflow-y-auto">
                        {/* E 'selectedFiles.map' funziona perché è un array */}
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                </div>
            );
        } else  if (selectedFiles.length != 3  ){
            return (
                <div className="my-4 text-red-500">
                    <br />
                    <h4>Upload 3 files!</h4>
                </div>
            );
        }
	};

    const showForm = () => {
            setIsModalOpen(true);
    };

    const  HandleSend = async () => {
        //mandare il file alla api
   
        if(selectedFiles.length != 3)
        {
            alert("Check your files! ")
            return;
        }


        if(!dirName || dirName =="" || dirName.length <=3)
        {   
            alert("check the project name!");
            return;

        }

        
        onFileSubmit(selectedFiles,dirName);
	
        setDirName("")
        setIsModalOpen(false);
         setSelectedFiles([]); // Resetta l'array alla chiusura
        setError(null);
    }


	return (
		<div>
			<h3> Upload your cwl</h3>
             <Button variant="contained" onClick={showForm}> Upload</Button>
        {isModalOpen && (    <div  id="form" className="fixed inset-0   bg-black bg-opacity-50 z-40 ">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center  
                                         fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"  >

                <div >
                  <label>Project name:</label>  <input className="p-2 mb-2 border rounded" type="text" name="dir_name" placeholder="my_project_1" required onChange={(e) => setDirName(e.target.value)}></input>
	                <input type="file" multiple  onChange={onFileChange} />
				  
                     {fileData()}
                </div>
                {error && ( <div className="text-red-600 text-sm my-2 p-2 bg-red-50 rounded">    {error} </div>)}
                    <Button  variant="contained" onClick={HandleSend}>Upload</Button>
            </div>
        </div>)}
		</div>
	);
};

export default Upload_button;
