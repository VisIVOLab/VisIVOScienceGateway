import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";

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
                <ListItem button>
                    <ListItemIcon>
                        <HomeIcon />
                    </ListItemIcon>
                    <ListItemText primary="Home" />
                </ListItem>
                <ListItem button>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="Settings" />
                </ListItem>
            </List>
        </Drawer>
    );
};

export default Sidebar;