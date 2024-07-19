# Team099

Sumesh Arappanal Sekharan, sumeshsekhar@gatech.edu

Gen Hosonuma, ghosonuma3@gatech.edu

Franklin Samuel Nunez, fnunez31@gatech.edu

Qiping Yu, qipingyu@gatech.edu

# Quickstart

You will need to install Docker. Run `make` to build the images and start our service. For those that do not have `make` installed, we can effectively do the same thing by running the following:

```
docker-compose -p gatech -f docker-compose.yml up --build
```

The command builds the backend and frontend images defined by our dockerfiles, using docker-compose to deploy the service locally. To shutdown and delete the containers (to reset the database), run `make clean` or equivalently:

```
docker-compose -p gatech -f docker-compose.yml down
```

If the service is stopped, and you just want to run it and not rebuild with latest image, run without the --build flag:

```
docker-compose -p gatech -f docker-compose.yml up
```


# docker-compose.yml

This file is well commented for additional details, and we recommend reading over this file to understand what is happening.

# Frontend

You will need to have npm installed. Start the development server by going into the `frontend` directory and running:

```
npm install
npm run dev
```

The frontend is a React app. In production, it will be built into a single HTML file. Running `make` will automatically build the frontend. `make up` will deploy everything. You should be able to navigate to [http://localhost:3001](http://localhost:3001) to view the deployed version of the front end.

# Backend

Make sure to set up your Python environment with [virtualenv](https://virtualenv.pypa.io/en/latest/user_guide.html) and activate it before installing the packages. To start developing, installation of all required Python packages is handled in the `requirements.txt` file by running `pip install -r requirements.txt`.

Our backend is a simple Python Flask application. When debugging, start the server by running the following command:
`flask --app server run` or `python server.py`.

Running `make` and `make up` will deploy the server as well. Server welcome page is located at http://localhost:5000/

# Database

The database is mysql 8.0. This should be sufficient for most student use cases. To access it, navigate to localhost:5050/ to start phpMyAdmin and enter the credentials found in `docker-compose.yml` to login.

# Testing

We're leveraging Pytest to handle unit testing.
