import axios from 'axios';

const baseURL = 'http://localhost:4000/';

export const validateUser = async (token) => {
    try {
        const res = await axios.get(`${baseURL}api/users/login`, {
            headers: {
                Authorization: 'Bearer ' + token,
            }
        });
        return res.data;
    } catch (error) {
        // Handle error if needed
    }
};


export const getAllUsers = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/users/getUsers");
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        return await response.json();  // Assuming the server response is JSON
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;  // Return null or handle the error as needed
    }
};


export const getAllSongs = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/songs/getAll");
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        return await response.json();  // Assuming the server response is JSON
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;  // Return null or handle the error as needed
    }
};

export const getAllArtists = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/artists/getAll");

        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        return await response.json();  // Assuming the server response is JSON
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;  // Return null or handle the error as needed
    }
};

export const getAllAlbums = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/albums/getAll");

        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        return await response.json();  // Assuming the server response is JSON
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;  // Return null or handle the error as needed
    }
};

export const fetchArtists = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/artists/getAll");

        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        return await response.json();  // Assuming the server response is JSON
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;  // Return null or handle the error as needed
    }
};

export const fetchAlbums = async () => {
    try {
        const response = await fetch("http://localhost:4000/api/albums/getAll");

        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.statusText);
        }
        return await response.json();  // Assuming the server response is JSON
    } catch (error) {
        console.error("Error fetching users:", error);
        return null;  // Return null or handle the error as needed
    }
};


