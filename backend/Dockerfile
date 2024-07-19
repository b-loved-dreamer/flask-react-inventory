FROM python:3.6

EXPOSE 5000

WORKDIR /app

COPY requirements.txt /app
COPY . /app
COPY . . /app/
RUN pip install -r requirements.txt

COPY server.py /app
CMD python server.py
