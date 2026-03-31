import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import { Link } from "react-router-dom";

const SIDEBAR_WIDTH = 240;

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: isOpen ? SIDEBAR_WIDTH : 0,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: isOpen ? SIDEBAR_WIDTH : 0,
                    transition: "width 0.3s ease-in-out",
                    overflowX: "hidden",
                    marginTop: "64px",
                },
            }}
        >
            <List>
                <ListItem button component={Link} to="/dashboard">
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button component={Link} to="/myprojects">
                    <ListItemIcon>
                        <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary="My projects" />
                </ListItem>
                 <ListItem button component={Link} to="/myruns">
                    <ListItemIcon>
                        <FolderIcon />
                    </ListItemIcon>
                    <ListItemText primary="My runs" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;