import { useState, useEffect, useRef } from "react";
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const fetch = require('sync-fetch');

export default function ErrorModal({ message }) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return(
        <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        >
        <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
            Error
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                {message}
            </Typography>
        </Box>
        </Modal>
    )
}