# WatchUp

### Download the demo video:
```bash
curl -L -o WatchUp_Demo_1080p.mp4 https://raw.githubusercontent.com/Stenation/WatchUp/main/WatchUp_Demo_1080p.mp4
```

### Setup Environment Variables:
Copy the example environment file and configure your API keys:
```bash
cp .env.example .env
```
Add your TMDB and OMDb API keys to the `.env` file.

### Run the application:

To start the application make sure you have docker and docker-compose installed, then run in the root directory of the project:
```bash
docker-compose up --build -d
```
To stop the application run:
```bash
docker-compose down
```