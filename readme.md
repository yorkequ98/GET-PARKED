# Getparked Portal Frontend 


THIS PORTAL IS MVP! - There's many new features in the backlog - for further info please check the [trello board](https://trello.com/b/12EqNzKN/get-parked). 

**To begin:**

Be sure to set/configure `config.yml` for new libraries & files included etc...

Then:

```
npm install
npm start
```

## UQ Zone Deployment Instructions

### Frontend
1. Make sure the BASE_URL in src/js.raw/core.js is set to `https://deco3801-yorke-sons.uqcloud.net/`
2. Run `npm run build` to generate dist/ directory
3. Make sure there is no existing dist directory at the copy destination by ssh `ssh -o "ProxyCommand ssh s4486185@moss.labs.eait.uq.edu.au nc -w 1 %h 22" s4486185@yorke-sons.zones.eait.uq.edu.au` and then remove ~/dist `sudo rm -rf ~/dist`
4. Copy dist/ directory to server `sudo scp -r -o "ProxyCommand ssh s4486185@moss.labs.eait.uq.edu.au -W %h:%p" ./dist s4486185@yorke-sons.zones.eait.uq.edu.au:~`
5. Check that the dist/ directory has been copied to the server at ~/dist then remove all currently deployed files `sudo rm -rf /var/www/htdocs/*`
6. Copy files from ~/dist into /var/www/htdocs `sudo cp -r ~/dist/* /var/www/htdocs`

### Backend
1. SSH into server and git pull latest code at /app/deco3801-yorke-sons
2. List running processes on 8080 with `sudo lsof -i :8080`
3. Kill the running process `fuser -k 8080/tcp` and `fuser -k 8000/tcp`
4. Restart the process `cd /app/deco3801-yorke-sons/backend` and run `sudo npm start`
5. Exit the shell without ending the process

### Database
1. SSH into the database and pull the latest code to /app/deco3801-yorke-sons
2. run mysql as root and password mysql and drop the nodelogin database `drop database nodelogin;`
3. run `mysql -u root -p < /app/deco3801-yorke-sons/database/scripts/init.sql`

## Docker For Development

Why is using docker more preferable? Basically you don't have to worry about dependencies, environment, versions. You have a single image that runs anywhere.

Download [Docker for Desktop](https://www.docker.com/products/docker-desktop)

### Docker compose

Run `docker-compose up` to start the frontend, backend and database

### First time install

If you can, run using Docker. This will make it so that our project works from all our different laptops and doesn't change functionality due to differences in environment

#### Frontend

1. Build the image

```docker build -t get-parked-frontend .```

2. Install node modules in container

```docker run --rm -it -v ${PWD}:/app get-parked-frontend npm install```

3. Run a container

Serve the website: 		
MacOS: `docker run --rm -it -v ${PWD}:/app -p 3001:3001 -p 8002:8002 get-parked-frontend npm start`
Windows: `docker run --rm -it -v %cd%:/app -p 3001:3001 -p 8002:8002 get-parked-frontend npm start`

Run interactively with `bash` instead of `npm start`

#### Backend 

1. Build the image

```docker build -t get-parked-backend ./backend```

2. Install node modules in container

MacOS: `docker run --rm -it -v ${PWD}/backend:/app get-parked-backend npm install`
Windows: `docker run --rm -it -v %cd%/backend:/app get-parked-backend npm install`

3. Run a container

Serve the backend: `docker run --rm -it -v ${PWD}/backend:/app -p 8080:8080 get-parked-backend npm start`

#### Database

1. Start with `docker run --rm -it -v ${PWD}/scripts:/docker-entrypoint-initdb.d -e MYSQL_ROOT_PASSWORD=mysql mysql:5.7`

