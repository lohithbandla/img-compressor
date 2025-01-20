# Image Compressor

A web application that allows users to compress images with adjustable quality settings. Built with Node.js (Express) backend and React frontend.

## Features

-   Image upload with preview
-   Adjustable compression quality (1-100%)
-   Real-time preview of compressed image
-   Download compressed images
-   Supports common image formats
-   Simple and intuitive user interface
## Prerequisites

Before you begin, ensure you have the following installed:

-   Node.js (v14 or higher)
-   npm (Node Package Manager)

## Installation

### Backend Setup

 1. Navigate to the backend directory:
	 ```bash
	cd backend			
	 ```
 2. Install dependencies:
	 ```
	 npm install
	 ```
	 it will install all the required dependencies like express, multer, sharp, cors
 3. Create required directories:
	 ```
	 mkdir uploads compressed
	 ```
 4. Start the server:
	  ```
	  npm start
	  ```
	 this will start the server on port 3000, you can change it  later as you like.
### Frontend Setup

 1.  Navigate to the frontend directory:
		```
		cd frontend
		```

 2. Install dependencies:
	 ```
	 npm install
	 ```
	 this will install the dependencies for react for other things like axios

 3. Start the development server:
	 ```
	 npm start
	 ```
	## Usage

1.  Open your browser and go to URL where your frontend is hosted
2.  Click the upload button to select an image
3.  Use the quality slider to adjust compression level (100% = original quality)
4.  Click "Compress Image" to process the image
5.  Once compression is complete, you can view and download the compressed image

## API Endpoints

### POST `/upload`

-   Uploads and compresses an image
-   Request body: FormData with:
    -   `file`: Image file
    -   `quality`: Compression quality (1-100)
-   Returns: JSON with compressed file URL

## Acknowledgments

-   Sharp for image processing
-   Multer for file upload handling
-   React for the frontend framework
