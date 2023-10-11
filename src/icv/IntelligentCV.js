import { useState, useEffect, useRef } from "react";
import { MuiFileInput } from 'mui-file-input';
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import LoadingButton from '@mui/lab/LoadingButton';
import Modal from '@mui/material/Modal';
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import SendIcon from '@mui/icons-material/Send';

import axios from "axios";

const errorModalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

export default function IntelligentCV() {

    const [test, setTest] = useState(true);
    const [fileName, setFileName] = useState(null);
    const [option, setOption] = useState("Cover");
    const [language, setLanguage] = useState("English");
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const [submitLoading, setSubmitLoading]= useState(false);
    const [contentLoaded, setContentLoaded]= useState(false);
    const [resolut, setResoult]= useState("");

    
    const handleFileChange = (newFileName) => {
        setFileName(newFileName)
    }
    const handleOptionChange = (event) => {
        setOption(event.target.value);
        
    };

    const handleLanguageChange = (event) => {
        setLanguage(event.target.value);
    };

    const handleErrorModalOpen = () => setErrorModalOpen(true);
    const handleErrorModalClose = () => {
        setErrorModalOpen(false);
        setSubmitLoading(false);
    }
 
    const handleSubmit = () => {
        if(!fileName || !fileName.name.toLocaleLowerCase().endsWith("pdf")){
            setErrorMessage("Select a valid PDF file");
            handleErrorModalOpen();
            return;
        }
        setSubmitLoading(true);
        setContentLoaded(false);
        const formData = new FormData();
        formData.append("file", fileName);
        formData.append("option", option);
        formData.append("language", language);
        let token="test"
        
        setResoult("waiting for the response...");
 
        let response;
        //                    headers: {Authorization: `Bearer ${token}`}, 
        (async () => {
            const url= (test)?"https://xpapi.xpilon.com/dev/uploadCV":"https://xpapi.xpilon.com/prod/uploadCV"
            try {

                response = await fetch(url, {
                    method: "POST",
                    "Content-Type": "multipart/form-data",
                    body: formData,
                });

                if (response.status !== 200) throw new Error(response.status.toString())
                if (!response.body) throw new Error('Response body does not exist')

                const reader = response.body.getReader()
                const decoder = new TextDecoder()
                
                let fullResoult="";
                while (true) {
                    const { value, done } = await reader.read()
                    if (done) {
                        setSubmitLoading(false);
                        setContentLoaded(true);
                        break;
                    }
                    const decodedChunk = decoder.decode(value, { stream: true })
                    console.log(decodedChunk);
                    fullResoult+=decodedChunk;
                    setResoult(fullResoult);
                }


            } catch (error) {
                var errmsg=error.message;
                if(errmsg.startsWith("429")){
                    errmsg="Too many requests from this IP address, wait a few minutes and try again.";
                }
                setErrorMessage("Error forom server: " + errmsg);
                handleErrorModalOpen();
            }
        })();
        
    }

    return(
        
    <Stack
      component="main"
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
      padding={2}
      width={"90%"}
    >
        <FormControl>
                <Typography variant="h6" color="text.primary" gutterBottom>
                    Simply upload your CV and let us handle the rest!
                </Typography>
                
                <MuiFileInput value={fileName} onChange={handleFileChange} label="Select a PDF file" />

                <RadioGroup
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="controlled-radio-buttons-group"
                    value={option}
                    onChange={handleOptionChange}
                >
                    <FormControlLabel value="Cover" control={<Radio />} label="Generate Cover Letter" />
                    <FormControlLabel value="Improve" control={<Radio />} label="Improve CV" />
                    <FormControlLabel value="Summarize" control={<Radio />} label="Extract Summary" />
                    {test && <FormControlLabel value="Test" control={<Radio />} label="Test" /> }
                </RadioGroup> 

                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={language}
                    onChange={handleLanguageChange}
                >
                    <MenuItem value={"English"}>Output in English</MenuItem>
                    <MenuItem value={"Italian"}>Output in Italian</MenuItem>
                    <MenuItem value={"Spanish"}>Output in Spanish</MenuItem>
                    <MenuItem value={"French"}>Output in French</MenuItem>
                    <MenuItem value={"German"}>Output in German</MenuItem>
                </Select>
                <Box m={1} >
                </Box>
                <LoadingButton onClick={handleSubmit}  variant="contained" 
                    endIcon={<SendIcon />}
                    loading={submitLoading}
                    loadingPosition="end"
                >
                    Upload and Enhance!
                </LoadingButton>
                <Box m={1} >
                </Box>
            {(submitLoading || contentLoaded) && 
            <>
                <TextField
                    id="outlined-multiline-flexible"
                    label="Response"
                    value={resolut}
                    multiline
                />
                <Box m={2} >
                </Box>
            </>
            }
        </FormControl>





        <Modal
            open={errorModalOpen}
            onClose={handleErrorModalClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
            <Box sx={errorModalStyle}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                Error
                </Typography>
                <Typography id="modal-modal-description" sx={{ mz: 2 }}>
                    {errorMessage}
                </Typography>
            </Box>
        </Modal>

    </Stack>
    )
}